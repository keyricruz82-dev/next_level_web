window.ProductosService = (function createProductosService() {
    const tableName = (window.APP_CONFIG && window.APP_CONFIG.TABLES && window.APP_CONFIG.TABLES.PRODUCTOS)
        ? window.APP_CONFIG.TABLES.PRODUCTOS
        : "productos";
    const bucketName = (window.APP_CONFIG && window.APP_CONFIG.STORAGE && window.APP_CONFIG.STORAGE.PUBLICACIONES_BUCKET)
        ? window.APP_CONFIG.STORAGE.PUBLICACIONES_BUCKET
        : "publicaciones";

    function createImageElementFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                const img = new Image();

                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error("No se pudo procesar la imagen del servicio."));
                img.src = reader.result;
            };

            reader.onerror = () => reject(new Error("No se pudo leer la imagen del servicio."));
            reader.readAsDataURL(file);
        });
    }

    async function optimizeImageFile(file, maxDimension = 1600, quality = 0.8) {
        if (!file || !(file instanceof File) || !file.type || !file.type.startsWith("image/")) {
            return file;
        }

        if (file.size <= 700 * 1024) {
            return file;
        }

        try {
            const img = await createImageElementFromFile(file);
            const width = img.width;
            const height = img.height;
            const scale = Math.min(1, maxDimension / Math.max(width, height));

            if (scale >= 1) {
                return file;
            }

            const canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.round(width * scale));
            canvas.height = Math.max(1, Math.round(height * scale));

            const context = canvas.getContext("2d");
            if (!context) {
                return file;
            }

            context.drawImage(img, 0, 0, canvas.width, canvas.height);

            const outputType = file.type === "image/webp" ? "image/webp" : "image/jpeg";
            const blob = await new Promise((resolve) => {
                canvas.toBlob(resolve, outputType, quality);
            });

            if (!blob) {
                return file;
            }

            const optimizedFile = new File([
                blob
            ], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                type: outputType,
                lastModified: Date.now()
            });

            return optimizedFile.size < file.size ? optimizedFile : file;
        } catch (error) {
            console.warn("No se pudo optimizar la imagen del servicio; se conserva el original:", error);
            return file;
        }
    }

    function buildImagePath(fileName) {
        const ext = fileName.includes(".")
            ? fileName.split(".").pop().toLowerCase()
            : "jpg";

        const token = crypto.randomUUID();
        const now = new Date();
        const year = String(now.getFullYear());
        const month = String(now.getMonth() + 1).padStart(2, "0");

        return `servicios/${year}/${month}/${token}.${ext}`;
    }

    function getStoragePathFromPublicUrl(publicUrl) {
        if (!publicUrl || typeof publicUrl !== "string") {
            return null;
        }

        const marker = `/object/public/${bucketName}/`;
        const index = publicUrl.indexOf(marker);

        if (index === -1) {
            return null;
        }

        return decodeURIComponent(publicUrl.substring(index + marker.length));
    }

    async function uploadImage(file) {
        if (!file) {
            return { publicUrl: "" };
        }

        const originalFile = file;
        const optimizedFile = await optimizeImageFile(file);
        const imagePath = buildImagePath(optimizedFile.name || originalFile.name);

        try {
            const { error: uploadError } = await window.supabaseClient
                .storage
                .from(bucketName)
                .upload(imagePath, optimizedFile, {
                    cacheControl: "3600",
                    upsert: false
                });

            if (uploadError) {
                const fallbackPath = buildImagePath(originalFile.name);
                const { error: fallbackError } = await window.supabaseClient
                    .storage
                    .from(bucketName)
                    .upload(fallbackPath, originalFile, {
                        cacheControl: "3600",
                        upsert: false
                    });

                if (fallbackError) {
                    throw fallbackError;
                }

                const { data: fallbackData } = window.supabaseClient
                    .storage
                    .from(bucketName)
                    .getPublicUrl(fallbackPath);

                return { publicUrl: fallbackData.publicUrl };
            }

            const { data } = window.supabaseClient
                .storage
                .from(bucketName)
                .getPublicUrl(imagePath);

            return { publicUrl: data.publicUrl };
        } catch (error) {
            console.error("[ProductosService] error inesperado en uploadImage:", error);
            throw error;
        }
    }

    async function removeImageByUrl(publicUrl) {
        const path = getStoragePathFromPublicUrl(publicUrl);

        if (!path) {
            return;
        }

        const { error } = await window.supabaseClient
            .storage
            .from(bucketName)
            .remove([path]);

        if (error) {
            console.warn("No se pudo eliminar la imagen del servicio:", error);
        }
    }

    function normalizeProducto(row = {}) {
        let estilosTexto = row.estilos_texto || {};
        if (typeof estilosTexto === "string") {
            try {
                estilosTexto = JSON.parse(estilosTexto) || {};
            } catch (error) {
                estilosTexto = {};
            }
        }

        return {
            id: row.id || null,
            titulo: row.titulo || "",
            descripcion: row.descripcion || "",
            imagen_url: row.imagen_url || "",
            texto_badge: row.texto_badge || "",
            texto_meta: row.texto_meta || "",
            estilos_texto: estilosTexto && typeof estilosTexto === "object" ? estilosTexto : {},
            estado: row.estado || "borrador",
            orden: Number.isFinite(Number(row.orden)) ? Number(row.orden) : 0,
            created_at: row.created_at || null,
            updated_at: row.updated_at || null
        };
    }

    async function ensureAdminSession() {
        if (!window.AuthService || typeof window.AuthService.getSession !== "function") {
            throw new Error("AuthService no está disponible.");
        }

        const session = await window.AuthService.getSession().catch(() => null);

        if (!(session && session.user)) {
            throw new Error("Debes iniciar sesión para gestionar servicios.");
        }

        return session;
    }

    async function list() {
        const { data, error } = await window.supabaseClient
            .from(tableName)
            .select(`
                id,
                titulo,
                descripcion,
                imagen_url,
                texto_badge,
                texto_meta,
                estilos_texto,
                estado,
                orden,
                created_at,
                updated_at
            `)
            .order("orden", { ascending: true })
            .order("created_at", { ascending: false });

        if (error) {
            throw error;
        }

        return (data || []).map(normalizeProducto);
    }

    async function getById(id) {
        if (!id) {
            throw new Error("Debes indicar el id del producto.");
        }

        const { data, error } = await window.supabaseClient
            .from(tableName)
            .select(`
                id,
                titulo,
                descripcion,
                imagen_url,
                texto_badge,
                texto_meta,
                estilos_texto,
                estado,
                orden,
                created_at,
                updated_at
            `)
            .eq("id", id)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return data ? normalizeProducto(data) : null;
    }
    async function getNextOrden() {
    const { data, error } = await window.supabaseClient
        .from(tableName)
        .select("orden")
        .order("orden", { ascending: false })
        .limit(1);

    if (error) {
        throw error;
    }

    const maxOrden = Number(data?.[0]?.orden);

    return Number.isFinite(maxOrden) && maxOrden >= 1
        ? Math.floor(maxOrden) + 1
        : 1;
}

    async function create(payload = {}, imageFile = null) {
        await ensureAdminSession();

        if (!imageFile) {
            throw new Error("La imagen principal del servicio es obligatoria.");
        }

        const uploadedMain = await uploadImage(imageFile);
        const nextOrden = await getNextOrden();

        const sanitizedPayload = {
            titulo: String(payload.titulo || "").trim(),
            descripcion: String(payload.descripcion || "").trim(),
            imagen_url: uploadedMain.publicUrl || null,
            texto_badge: payload.texto_badge || null,
            texto_meta: payload.texto_meta || null,
            estilos_texto: payload.estilos_texto || null,
            estado: payload.estado || "borrador",
            orden: nextOrden
        };

        if (!sanitizedPayload.titulo) {
            throw new Error("El titulo del servicio es obligatorio.");
        }

        if (!sanitizedPayload.imagen_url) {
            throw new Error("La imagen principal del servicio es obligatoria.");
        }

        if (!sanitizedPayload.texto_badge) {
            throw new Error("El texto del badge es obligatorio.");
        }

        if (!sanitizedPayload.texto_meta) {
            throw new Error("El texto meta es obligatorio.");
        }

        if (!['borrador', 'publicado'].includes(sanitizedPayload.estado)) {
            throw new Error("El estado del servicio debe ser 'borrador' o 'publicado'.");
        }

        try {
            const { data, error } = await window.supabaseClient
                .from(tableName)
                .insert(sanitizedPayload)
                .select(`
                    id,
                    titulo,
                    descripcion,
                    imagen_url,
                    texto_badge,
                    texto_meta,
                    estilos_texto,
                    estado,
                    orden,
                    created_at,
                    updated_at
                `)
                .single();

            if (error) {
                throw error;
            }

            return normalizeProducto(data);
        } catch (error) {
            if (sanitizedPayload.imagen_url) {
                await removeImageByUrl(sanitizedPayload.imagen_url);
            }
            throw error;
        }
    }

    async function update(id, payload = {}, imageFile = null, existingImageUrl = "") {
        if (!id) {
            throw new Error("Debes indicar el id del servicio.");
        }

        await ensureAdminSession();

        const sanitizedPayload = {};
        let nextImageUrl = String(existingImageUrl || "").trim();
        let oldImageToRemove = "";

        if (Object.prototype.hasOwnProperty.call(payload, "titulo")) {
            sanitizedPayload.titulo = String(payload.titulo || "").trim();
        }

        if (Object.prototype.hasOwnProperty.call(payload, "descripcion")) {
            sanitizedPayload.descripcion = String(payload.descripcion || "").trim();
        }

        if (imageFile) {
            const uploadedMain = await uploadImage(imageFile);
            nextImageUrl = uploadedMain.publicUrl || "";
            if (existingImageUrl && existingImageUrl !== nextImageUrl) {
                oldImageToRemove = existingImageUrl;
            }
        }

        if (nextImageUrl) {
            sanitizedPayload.imagen_url = nextImageUrl;
        }

        if (Object.prototype.hasOwnProperty.call(payload, "texto_badge")) {
            sanitizedPayload.texto_badge = payload.texto_badge || null;
        }

        if (Object.prototype.hasOwnProperty.call(payload, "texto_meta")) {
            sanitizedPayload.texto_meta = payload.texto_meta || null;
        }

        if (Object.prototype.hasOwnProperty.call(payload, "estilos_texto")) {
            sanitizedPayload.estilos_texto = payload.estilos_texto || null;
        }

        if (Object.prototype.hasOwnProperty.call(payload, "estado")) {
            if (!['borrador', 'publicado'].includes(payload.estado)) {
                throw new Error("El estado del servicio debe ser 'borrador' o 'publicado'.");
            }
            sanitizedPayload.estado = payload.estado;
        }

        if (Object.prototype.hasOwnProperty.call(payload, "orden")) {
            sanitizedPayload.orden = Number.isFinite(Number(payload.orden)) ? Number(payload.orden) : 0;
        }

        if (Object.prototype.hasOwnProperty.call(sanitizedPayload, "titulo") && !sanitizedPayload.titulo) {
            throw new Error("El titulo del servicio es obligatorio.");
        }

        if (!nextImageUrl) {
            throw new Error("La imagen principal del servicio es obligatoria.");
        }

        if (Object.prototype.hasOwnProperty.call(sanitizedPayload, "texto_badge") && !sanitizedPayload.texto_badge) {
            throw new Error("El texto del badge es obligatorio.");
        }

        if (Object.prototype.hasOwnProperty.call(sanitizedPayload, "texto_meta") && !sanitizedPayload.texto_meta) {
            throw new Error("El texto meta es obligatorio.");
        }

        if (!sanitizedPayload || Object.keys(sanitizedPayload).length === 0) {
            throw new Error("No hay cambios para actualizar.");
        }

        try {
            const { data, error } = await window.supabaseClient
                .from(tableName)
                .update(sanitizedPayload)
                .eq("id", id)
                .select(`
                    id,
                    titulo,
                    descripcion,
                    imagen_url,
                    texto_badge,
                    texto_meta,
                    estilos_texto,
                    estado,
                    orden,
                    created_at,
                    updated_at
                `)
                .single();

            if (error) {
                throw error;
            }

            if (oldImageToRemove) {
                await removeImageByUrl(oldImageToRemove);
            }

            return normalizeProducto(data);
        } catch (error) {
            if (nextImageUrl && nextImageUrl !== existingImageUrl) {
                await removeImageByUrl(nextImageUrl);
            }
            throw error;
        }
    }

    async function remove(id, imageUrl = "") {
        if (!id) {
            throw new Error("Debes indicar el id del servicio.");
        }

        await ensureAdminSession();

        const { error } = await window.supabaseClient
            .from(tableName)
            .delete()
            .eq("id", id);

        if (error) {
            throw error;
        }

        if (imageUrl) {
            await removeImageByUrl(imageUrl);
        }

        return true;
    }

    async function toggleEstado(id, estadoActual) {
        if (!id) {
            throw new Error("Debes indicar el id del servicio.");
        }

        await ensureAdminSession();

        const nextState = String(estadoActual || "borrador") === "publicado" ? "borrador" : "publicado";

        const { data, error } = await window.supabaseClient
            .from(tableName)
            .update({ estado: nextState })
            .eq("id", id)
            .select(`
                id,
                titulo,
                descripcion,
                imagen_url,
                texto_badge,
                texto_meta,
                estilos_texto,
                estado,
                orden,
                created_at,
                updated_at
            `)
            .single();

        if (error) {
            throw error;
        }

        return normalizeProducto(data);
    }

    return {
        normalizeProducto,
        list,
        getById,
        create,
        update,
        remove,
        toggleEstado
    };
})();

window.SiteMediaService = (function createSiteMediaService() {
    const tableName = (window.APP_CONFIG && window.APP_CONFIG.TABLES && window.APP_CONFIG.TABLES.SITE_MEDIA)
        ? window.APP_CONFIG.TABLES.SITE_MEDIA
        : "site_media";

    const bucketName = (window.APP_CONFIG && window.APP_CONFIG.STORAGE && window.APP_CONFIG.STORAGE.PUBLICACIONES_BUCKET)
        ? window.APP_CONFIG.STORAGE.PUBLICACIONES_BUCKET
        : "publicaciones";

    function normalizeSiteMedia(row = {}) {
        return {
            id: row.id || null,
            section: row.section || "",
            position: Number(row.position) || 1,
            image_url: row.image_url || "",
            storage_path: row.storage_path || "",
            created_at: row.created_at || null,
            updated_at: row.updated_at || null
        };
    }

    function dedupeRowsByPosition(rows = []) {
        const deduped = new Map();

        (rows || []).forEach((row) => {
            const position = Number(row?.position);
            if (!Number.isInteger(position) || position < 1 || position > 4) {
                return;
            }

            if (!deduped.has(position)) {
                deduped.set(position, normalizeSiteMedia(row));
            }
        });

        return Array.from(deduped.values()).sort((a, b) => Number(a.position || 1) - Number(b.position || 1));
    }

    function getStoragePathFromPublicUrl(publicUrl) {
        if (!publicUrl || typeof publicUrl !== "string") {
            return null;
        }

        const marker = `/object/public/${bucketName}/`;
        const index = publicUrl.indexOf(marker);

        if (index === -1) {
            return null;
        }

        return decodeURIComponent(publicUrl.substring(index + marker.length));
    }

    async function removeStorageFile(storagePath) {
        if (!storagePath) {
            return;
        }

        const { error } = await window.supabaseClient
            .storage
            .from(bucketName)
            .remove([storagePath]);

        if (error) {
            console.warn("No se pudo eliminar la imagen del sitio:", error);
        }
    }

    function validateImageFile(file) {
        if (!file || !(file instanceof File)) {
            throw new Error("Debes seleccionar una imagen válida.");
        }

        if (!file.type || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            throw new Error("La imagen debe ser JPG, PNG o WebP.");
        }
    }

    function buildStoragePath(section, position, fileName) {
        const extension = String(fileName || "image.jpg").split(".").pop().toLowerCase() || "jpg";
        return `site-media/${section}/position-${position}-${crypto.randomUUID()}.${extension}`;
    }

    async function uploadSiteMediaFile(file, section, position) {
        validateImageFile(file);

        const storagePath = buildStoragePath(section, position, file.name);
        const { error } = await window.supabaseClient
            .storage
            .from(bucketName)
            .upload(storagePath, file, {
                cacheControl: "3600",
                upsert: false
            });

        if (error) {
            throw error;
        }

        const { data } = window.supabaseClient
            .storage
            .from(bucketName)
            .getPublicUrl(storagePath);

        return {
            publicUrl: data.publicUrl,
            storagePath
        };
    }

    async function listBySection(section) {
        const { data, error } = await window.supabaseClient
            .from(tableName)
            .select("id, section, position, image_url, storage_path, created_at, updated_at")
            .eq("section", section)
            .order("position", { ascending: true });

        if (error) {
            throw error;
        }

        return dedupeRowsByPosition(data || []);
    }

    async function save(section, position, file, currentRow = null) {
        if (!section || !["curated_grid", "promo_banner"].includes(section)) {
            throw new Error("Sección inválida para la imagen del sitio.");
        }

        const existingRows = await listBySection(section);
        const nextAvailablePosition = (() => {
            const occupied = new Set(
                (existingRows || [])
                    .map((item) => Number(item.position) || 0)
                    .filter((itemPosition) => Number.isInteger(itemPosition) && itemPosition >= 1 && itemPosition <= 4)
            );

            for (let candidate = 1; candidate <= 4; candidate += 1) {
                if (!occupied.has(candidate)) {
                    return candidate;
                }
            }

            return null;
        })();

        if (!file) {
            throw new Error("Debes seleccionar una imagen para guardar.");
        }

        validateImageFile(file);

        const normalizedPosition = Number(position);
        if (!Number.isInteger(normalizedPosition) || normalizedPosition < 1 || normalizedPosition > 4) {
            throw new Error("La posición debe estar entre 1 y 4.");
        }


        const existing = currentRow
    ? existingRows.find((item) => String(item.id) === String(currentRow.id)) || null
    : existingRows.find(
        (item) =>
            item.section === section &&
            Number(item.position) === normalizedPosition
    ) || null;
        
        if (existing) {
            if (Number(existing.position) !== normalizedPosition) {
                throw new Error("La posición seleccionada no coincide con el registro existente.");
            }
        } else if (existingRows.some((item) => Number(item.position) === normalizedPosition)) {
            throw new Error("La posición seleccionada ya está ocupada. Debe usarse la primera posición libre disponible.");
        } else if (nextAvailablePosition === null) {
            throw new Error("Ya existen 4 imágenes en esta sección. Elimina o reemplaza una para agregar otra.");
        } else if (section === "promo_banner" && nextAvailablePosition !== normalizedPosition) {
    throw new Error("La posición seleccionada ya está ocupada. Debe usarse la primera posición libre disponible.");
}

        const uploaded = await uploadSiteMediaFile(file, section, normalizedPosition);
        const publicUrl = uploaded.publicUrl;
        const storagePath = uploaded.storagePath;

        if (!publicUrl || !storagePath) {
            throw new Error("No se pudo preparar la imagen para guardar.");
        }

        try {
            if (existing) {
                const previousStoragePath = existing.storage_path || null;
                const { data, error } = await window.supabaseClient
                    .from(tableName)
                    .update({
                        image_url: publicUrl,
                        storage_path: storagePath,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", existing.id)
                    .select("id, section, position, image_url, storage_path, created_at, updated_at")
                    .single();

                if (error) {
                    throw error;
                }

                if (previousStoragePath && previousStoragePath !== storagePath) {
                    await removeStorageFile(previousStoragePath);
                }

                return normalizeSiteMedia(data);
            }

            const { data, error } = await window.supabaseClient
                .from(tableName)
                .insert({
                    section,
                    position: normalizedPosition,
                    image_url: publicUrl,
                    storage_path: storagePath,
                    updated_at: new Date().toISOString()
                })
                .select("id, section, position, image_url, storage_path, created_at, updated_at")
                .single();

            if (error) {
                throw error;
            }

            return normalizeSiteMedia(data);
        } catch (error) {
            const storageFromPublicUrl = getStoragePathFromPublicUrl(publicUrl);
            if (storageFromPublicUrl) {
                await removeStorageFile(storageFromPublicUrl);
            }
            throw error;
        }
    }

    async function remove(section, position, currentRow = null) {
        const row = currentRow || (await listBySection(section)).find((item) => Number(item.position) === Number(position)) || null;
        if (!row || !row.id) {
            return false;
        }

        const { error } = await window.supabaseClient
            .from(tableName)
            .delete()
            .eq("id", row.id);

        if (error) {
            throw error;
        }

        if (row.storage_path) {
            await removeStorageFile(row.storage_path);
        }

        return true;
    }

    return {
        listBySection,
        save,
        remove,
        normalizeSiteMedia,
        validateImageFile
    };
})();
