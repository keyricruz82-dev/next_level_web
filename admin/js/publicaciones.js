window.PublicacionesService = (function createPublicacionesService() {
    const tableName = window.APP_CONFIG.TABLES.PUBLICACIONES;
    const bucketName = window.APP_CONFIG.STORAGE.PUBLICACIONES_BUCKET;

    function normalizePublicacion(row) {
        return {
            id: row.id,
            titulo: row.titulo || "",
            descripcion: row.descripcion || "",
            imagen_url: row.imagen_url || "",
            imagenes_adicionales: Array.isArray(row.imagenes_adicionales)
                ? row.imagenes_adicionales
                : [],
            video_url: row.video_url || "",
            fecha_evento: row.fecha_evento || "",
            hora_evento: row.hora_evento || "",
            estado: row.estado || "borrador"
        };
    }

    function buildImagePath(fileName) {
        const ext = fileName.includes(".")
            ? fileName.split(".").pop().toLowerCase()
            : "jpg";

        const token = crypto.randomUUID();
        const now = new Date();
        const year = String(now.getFullYear());
        const month = String(now.getMonth() + 1).padStart(2, "0");

        return `publicaciones/${year}/${month}/${token}.${ext}`;
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

        return decodeURIComponent(
            publicUrl.substring(index + marker.length)
        );
    }

    async function uploadImage(file) {
        if (!file) {
            return { publicUrl: "" };
        }

        const imagePath = buildImagePath(file.name);

        const { error: uploadError } = await window.supabaseClient
            .storage
            .from(bucketName)
            .upload(imagePath, file, {
                cacheControl: "3600",
                upsert: false
            });

        if (uploadError) {
            throw uploadError;
        }

        const { data } = window.supabaseClient
            .storage
            .from(bucketName)
            .getPublicUrl(imagePath);

        return {
            publicUrl: data.publicUrl
        };
    }

    async function uploadAdditionalImages(files) {
        if (!files || files.length === 0) {
            return [];
        }

        const uploadedUrls = [];

        try {
            for (const file of files) {
                const uploaded = await uploadImage(file);

                if (uploaded.publicUrl) {
                    uploadedUrls.push(uploaded.publicUrl);
                }
            }

            return uploadedUrls;
        } catch (error) {
            // Si alguna imagen falla, eliminamos las que ya se habían subido
            for (const url of uploadedUrls) {
                await removeImageByUrl(url);
            }

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
            console.warn("No se pudo eliminar la imagen:", error);
        }
    }

    async function removeImagesByUrls(urls) {
        if (!Array.isArray(urls) || urls.length === 0) {
            return;
        }

        for (const url of urls) {
            await removeImageByUrl(url);
        }
    }

    async function list() {
        const { data, error } = await window.supabaseClient
            .from(tableName)
            .select(`
                id,
                titulo,
                descripcion,
                imagen_url,
                imagenes_adicionales,
                video_url,
                fecha_evento,
                hora_evento,
                estado
            `)
            .order("fecha_evento", { ascending: false });

        if (error) {
            throw error;
        }

        return (data || []).map(normalizePublicacion);
    }

    async function getStats() {
        const [total, publicados, borradores] = await Promise.all([
            window.supabaseClient
                .from(tableName)
                .select("id", {
                    count: "exact",
                    head: true
                }),

            window.supabaseClient
                .from(tableName)
                .select("id", {
                    count: "exact",
                    head: true
                })
                .eq("estado", "publicado"),

            window.supabaseClient
                .from(tableName)
                .select("id", {
                    count: "exact",
                    head: true
                })
                .eq("estado", "borrador")
        ]);

        console.log("STATS TOTAL:", total);
        console.log("STATS PUBLICADOS:", publicados);
        console.log("STATS BORRADORES:", borradores);

        if (total.error) {
            throw total.error;
        }

        if (publicados.error) {
            console.error(
                "Error contando publicaciones:",
                publicados.error
            );
            throw publicados.error;
        }

        if (borradores.error) {
            console.error(
                "Error contando borradores:",
                borradores.error
            );
            throw borradores.error;
        }

        return {
            total: total.count ?? 0,
            publicadas: publicados.count ?? 0,
            borradores: borradores.count ?? 0
        };
    }

    async function create(payload, imageFile, additionalImageFiles = []) {
        if (!imageFile) {
            throw new Error(
                "Debes seleccionar una imagen antes de publicar."
            );
        }

        let mainImageUrl = "";
        let additionalImageUrls = [];

        try {
            // 1. Subir imagen principal
            const uploadedMain = await uploadImage(imageFile);
            mainImageUrl = uploadedMain.publicUrl;

            // 2. Subir imágenes adicionales
            additionalImageUrls = await uploadAdditionalImages(
                additionalImageFiles
            );

            // 3. Preparar información de la publicación
            const insertPayload = {
                titulo: payload.titulo,
                descripcion: payload.descripcion,
                imagen_url: mainImageUrl,
                imagenes_adicionales: additionalImageUrls,
                video_url: payload.video_url || null,
                fecha_evento: payload.fecha_evento || null,
                hora_evento: payload.hora_evento || null,
                estado: payload.estado
            };

            // 4. Guardar publicación
            const { data, error } = await window.supabaseClient
                .from(tableName)
                .insert(insertPayload)
                .select(`
                    id,
                    titulo,
                    descripcion,
                    imagen_url,
                    imagenes_adicionales,
                    video_url,
                    fecha_evento,
                    hora_evento,
                    estado
                `)
                .single();

            if (error) {
                throw error;
            }

            return normalizePublicacion(data);

        } catch (error) {
            // Si la publicación falla, limpiamos las imágenes que
            // acabamos de subir para evitar archivos huérfanos.

            if (mainImageUrl) {
                await removeImageByUrl(mainImageUrl);
            }

            await removeImagesByUrls(additionalImageUrls);

            throw error;
        }
    }

    async function update(
        id,
        payload,
        imageFile,
        existingImageUrl,
        additionalImageFiles = [],
        existingAdditionalImages = []
    ) {
        let imageUrl = existingImageUrl || "";
        let newAdditionalImageUrls = [];

        try {
            // Si se seleccionó una nueva imagen principal
            if (imageFile) {
                const uploaded = await uploadImage(imageFile);
                imageUrl = uploaded.publicUrl;
            }

            // Subir nuevas imágenes adicionales
            newAdditionalImageUrls = await uploadAdditionalImages(
                additionalImageFiles
            );

            // Mantener las imágenes adicionales existentes
            const finalAdditionalImages = [
                ...(Array.isArray(existingAdditionalImages)
                    ? existingAdditionalImages
                    : []),
                ...newAdditionalImageUrls
            ];

            const updatePayload = {
                titulo: payload.titulo,
                descripcion: payload.descripcion,
                imagen_url: imageUrl,
                imagenes_adicionales: finalAdditionalImages,
                video_url: payload.video_url || null,
                fecha_evento: payload.fecha_evento || null,
                hora_evento: payload.hora_evento || null,
                estado: payload.estado
            };

            const { data, error } = await window.supabaseClient
                .from(tableName)
                .update(updatePayload)
                .eq("id", id)
                .select(`
                    id,
                    titulo,
                    descripcion,
                    imagen_url,
                    imagenes_adicionales,
                    video_url,
                    fecha_evento,
                    hora_evento,
                    estado
                `)
                .single();

            if (error) {
                throw error;
            }

            // Si se cambió la imagen principal,
            // eliminamos la anterior.
            if (
                imageFile &&
                existingImageUrl &&
                existingImageUrl !== imageUrl
            ) {
                await removeImageByUrl(existingImageUrl);
            }

            return normalizePublicacion(data);

        } catch (error) {
            // Si hubo error después de subir nuevas imágenes,
            // eliminamos únicamente las nuevas.

            if (
                imageFile &&
                imageUrl &&
                imageUrl !== existingImageUrl
            ) {
                await removeImageByUrl(imageUrl);
            }

            await removeImagesByUrls(newAdditionalImageUrls);

            throw error;
        }
    }

    async function remove(id, imageUrl, additionalImages = []) {
        const { error } = await window.supabaseClient
            .from(tableName)
            .delete()
            .eq("id", id);

        if (error) {
            throw error;
        }

        // Eliminar imagen principal
        if (imageUrl) {
            await removeImageByUrl(imageUrl);
        }

        // Eliminar imágenes adicionales
        await removeImagesByUrls(additionalImages);
    }

    async function toggleEstado(id, estadoActual) {
        const nuevoEstado =
            estadoActual === "publicado"
                ? "borrador"
                : "publicado";

        const { data, error } = await window.supabaseClient
            .from(tableName)
            .update({
                estado: nuevoEstado
            })
            .eq("id", id)
            .select(`
                id,
                titulo,
                descripcion,
                imagen_url,
                imagenes_adicionales,
                video_url,
                fecha_evento,
                hora_evento,
                estado
            `)
            .single();

        if (error) {
            throw error;
        }

        return normalizePublicacion(data);
    }

    return {
        list,
        getStats,
        create,
        update,
        remove,
        toggleEstado
    };
})();