(function () {
    "use strict";

    const TABLE_NAME = "inicio_web_styles";

    const DEFAULT_GRADIENT_COLORS = {
        background_color_1: "#090c11",
        background_color_2: "#454a52",
        background_color_3: null
    };

    const BACKGROUND_STYLE_KEYS = [
        "banner1_background",
        "banner2_background"
    ];

    const DEFAULT_STYLES = {
        hero_eyebrow: {
            fuente: "inherit",
            peso: 500,
            tamano: 14,
            estilo: "normal",
            alineacion: "left",
            color: "#ffffff",
            transformacion: "none",
            line_height: 1.2,
            letter_spacing: 0
        },

        hero_titulo: {
            fuente: "inherit",
            peso: 800,
            tamano: 64,
            estilo: "normal",
            alineacion: "left",
            color: "#ffffff",
            transformacion: "none",
            line_height: 1.1,
            letter_spacing: 0
        },

        hero_boton: {
            fuente: "inherit",
            peso: 600,
            tamano: 16,
            estilo: "normal",
            alineacion: "center",
            color: "#ffffff",
            transformacion: "none",
            line_height: 1.2,
            letter_spacing: 0
        },

        banner1_tag: {
            fuente: "inherit",
            peso: 600,
            tamano: 14,
            estilo: "normal",
            alineacion: "left",
            color: "#ffffff",
            transformacion: "uppercase",
            line_height: 1.2,
            letter_spacing: 1
        },

        banner1_titulo: {
            fuente: "inherit",
            peso: 700,
            tamano: 48,
            estilo: "normal",
            alineacion: "left",
            color: "#ffffff",
            transformacion: "none",
            line_height: 1.2,
            letter_spacing: 0
        },

        banner1_descripcion: {
            fuente: "inherit",
            peso: 400,
            tamano: 18,
            estilo: "normal",
            alineacion: "left",
            color: "#ffffff",
            transformacion: "none",
            line_height: 1.5,
            letter_spacing: 0
        },

        banner2_tag: {
            fuente: "inherit",
            peso: 600,
            tamano: 14,
            estilo: "normal",
            alineacion: "left",
            color: "#ffffff",
            transformacion: "uppercase",
            line_height: 1.2,
            letter_spacing: 1
        },

        banner2_titulo: {
            fuente: "inherit",
            peso: 700,
            tamano: 48,
            estilo: "normal",
            alineacion: "left",
            color: "#ffffff",
            transformacion: "none",
            line_height: 1.2,
            letter_spacing: 0
        },

        banner2_descripcion: {
            fuente: "inherit",
            peso: 400,
            tamano: 18,
            estilo: "normal",
            alineacion: "left",
            color: "#ffffff",
            transformacion: "none",
            line_height: 1.5,
            letter_spacing: 0
        },

        galeria_titulo: {
            fuente: "inherit",
            peso: 700,
            tamano: 42,
            estilo: "normal",
            alineacion: "center",
            color: "#ffffff",
            transformacion: "none",
            line_height: 1.2,
            letter_spacing: 0
        },

        banner1_background: {
            fuente: "inherit",
            peso: 700,
            tamano: 48,
            estilo: "normal",
            alineacion: "left",
            color: null,
            background_color_1: "#090c11",
            background_color_2: "#454a52",
            background_color_3: null,
            transformacion: "none",
            line_height: 1.2,
            letter_spacing: 0
        },

        banner2_background: {
            fuente: "inherit",
            peso: 700,
            tamano: 48,
            estilo: "normal",
            alineacion: "left",
            color: null,
            background_color_1: "#090c11",
            background_color_2: "#454a52",
            background_color_3: null,
            transformacion: "none",
            line_height: 1.2,
            letter_spacing: 0
        }
    };

    function getSupabaseClient() {
        if (window.supabaseClient) {
            return window.supabaseClient;
        }

        if (window.supabase) {
            return window.supabase;
        }

        throw new Error(
            "No se encontró el cliente de Supabase."
        );
    }

    function normalizeNumber(value, fallback) {
        const number = Number(value);

        return Number.isFinite(number)
            ? number
            : fallback;
    }

    function isBackgroundStyleElement(elemento) {
        return BACKGROUND_STYLE_KEYS.includes(elemento);
    }

    function normalizeStyle(elemento, row = {}) {
        const defaults =
            DEFAULT_STYLES[elemento] ||
            DEFAULT_STYLES.hero_titulo;

        const colorValue =
            typeof row.color === "string" &&
            /^#[0-9a-fA-F]{6}$/.test(row.color)
                ? row.color
                : defaults.color;

        const backgroundColor1 =
            typeof row.background_color_1 === "string" &&
            /^#[0-9a-fA-F]{6}$/.test(row.background_color_1)
                ? row.background_color_1
                : (defaults.background_color_1 || DEFAULT_GRADIENT_COLORS.background_color_1);

        const backgroundColor2 =
            typeof row.background_color_2 === "string" &&
            /^#[0-9a-fA-F]{6}$/.test(row.background_color_2)
                ? row.background_color_2
                : (defaults.background_color_2 || DEFAULT_GRADIENT_COLORS.background_color_2);

        const backgroundColor3 =
            typeof row.background_color_3 === "string" &&
            /^#[0-9a-fA-F]{6}$/.test(row.background_color_3)
                ? row.background_color_3
                : (defaults.background_color_3 || null);

        return {
            elemento,

            fuente:
                typeof row.fuente === "string" &&
                row.fuente.trim()
                    ? row.fuente
                    : defaults.fuente,

            peso:
                normalizeNumber(
                    row.peso,
                    defaults.peso
                ),

            tamano:
                normalizeNumber(
                    row.tamano,
                    defaults.tamano
                ),

            estilo:
                row.estilo === "italic"
                    ? "italic"
                    : "normal",

            alineacion:
                [
                    "left",
                    "center",
                    "right",
                    "justify"
                ].includes(row.alineacion)
                    ? row.alineacion
                    : defaults.alineacion,

            color: isBackgroundStyleElement(elemento)
                ? null
                : colorValue,

            background_color_1: backgroundColor1,
            background_color_2: backgroundColor2,
            background_color_3: backgroundColor3,

            transformacion:
                [
                    "none",
                    "uppercase",
                    "lowercase",
                    "capitalize"
                ].includes(row.transformacion)
                    ? row.transformacion
                    : defaults.transformacion,

            line_height:
                normalizeNumber(
                    row.line_height,
                    defaults.line_height
                ),

            letter_spacing:
                normalizeNumber(
                    row.letter_spacing,
                    defaults.letter_spacing
                )
        };
    }

    async function listStyles() {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("elemento", { ascending: true });

        if (error) {
            throw error;
        }

        return (data || []).map((row) =>
            normalizeStyle(row.elemento, row)
        );
    }

    async function getStyle(elemento) {
        if (!DEFAULT_STYLES[elemento]) {
            throw new Error(
                `Elemento de Inicio Web no válido: ${elemento}`
            );
        }

        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .eq("elemento", elemento)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return normalizeStyle(
            elemento,
            data || DEFAULT_STYLES[elemento]
        );
    }

    async function saveStyle(style) {
        if (!style || !style.elemento) {
            throw new Error(
                "No se recibió un elemento de estilo válido."
            );
        }

        if (!DEFAULT_STYLES[style.elemento]) {
            throw new Error(
                `Elemento de Inicio Web no válido: ${style.elemento}`
            );
        }

        const normalized = normalizeStyle(
            style.elemento,
            style
        );

        const supabase = getSupabaseClient();

        const payload = {
            elemento: normalized.elemento,
            fuente: normalized.fuente,
            peso: normalized.peso,
            tamano: normalized.tamano,
            estilo: normalized.estilo,
            alineacion: normalized.alineacion,
            background_color_1: normalized.background_color_1,
            background_color_2: normalized.background_color_2,
            background_color_3: normalized.background_color_3 ?? null,
            transformacion: normalized.transformacion,
            line_height: normalized.line_height,
            letter_spacing: normalized.letter_spacing,
            updated_at: new Date().toISOString()
        };

        if (!isBackgroundStyleElement(normalized.elemento)) {
            payload.color = normalized.color;
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .upsert(payload, {
                onConflict: "elemento"
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return normalizeStyle(
            normalized.elemento,
            data
        );
    }

    async function resetStyle(elemento) {
        if (!DEFAULT_STYLES[elemento]) {
            throw new Error(
                `Elemento de Inicio Web no válido: ${elemento}`
            );
        }

        return saveStyle({
            elemento,
            ...DEFAULT_STYLES[elemento]
        });
    }

    async function saveAllStyles(styles) {
        if (!Array.isArray(styles)) {
            throw new Error(
                "La lista de estilos no es válida."
            );
        }

        const supabase = getSupabaseClient();

        const payload = styles
            .filter((style) =>
                style &&
                DEFAULT_STYLES[style.elemento]
            )
            .map((style) => {
                const normalized = normalizeStyle(
                    style.elemento,
                    style
                );

                const row = {
                    elemento: normalized.elemento,
                    fuente: normalized.fuente,
                    peso: normalized.peso,
                    tamano: normalized.tamano,
                    estilo: normalized.estilo,
                    alineacion: normalized.alineacion,
                    background_color_1: normalized.background_color_1,
                    background_color_2: normalized.background_color_2,
                    background_color_3: normalized.background_color_3 ?? null,
                    transformacion: normalized.transformacion,
                    line_height: normalized.line_height,
                    letter_spacing: normalized.letter_spacing,
                    updated_at: new Date().toISOString()
                };

                if (!isBackgroundStyleElement(normalized.elemento)) {
                    row.color = normalized.color;
                }

                return row;
            });

        if (!payload.length) {
            return [];
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .upsert(payload, {
                onConflict: "elemento"
            })
            .select();

        if (error) {
            throw error;
        }

        return (data || []).map((row) =>
            normalizeStyle(row.elemento, row)
        );
    }

    function getDefaultStyle(elemento) {
        if (!DEFAULT_STYLES[elemento]) {
            return null;
        }

        return {
            elemento,
            ...DEFAULT_STYLES[elemento]
        };
    }

    const DEFAULT_TEXTS = {
        hero_eyebrow: "ARTE EN MOVIMIENTO",
        hero_titulo: "Transforma tus Ideas en Arte Visual.",
        hero_boton: "Reserva tu Sesión",
        banner1_tag: "VIVE NUESTRA EXPERIENCIA", 
        banner1_titulo: "Narrativa Visual a Medida",
        banner1_descripcion: "Creamos tus recuerdos más preciados en diversos géneros con un compromiso de experiencia y precisión.",
        banner2_tag: "VIVE NUESTRA EXPERIENCIA",
        banner2_titulo: "Cada detalle cuenta cuando se trata de llevar un evento al siguiente nivel.",
        banner2_descripcion: "Next Level Producciones transforma tus ideas en arte visual. Desde videos impactantes hasta fotografías memorables y transmisiones en vivo, capturamos lo extraordinario en cada momento. ¡Imagina, nosotros lo hacemos realidad!",
        galeria_titulo: "Galería"
};

const TEXT_ELEMENTS = Object.keys(DEFAULT_TEXTS);

async function getText(elemento) {
    if (!TEXT_ELEMENTS.includes(elemento)) {
        throw new Error(
            `Elemento de texto de Inicio Web no válido: ${elemento}`
        );
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
        .from("inicio_web_config")
        .select("*")
        .maybeSingle();

    if (error) {
        throw error;
    }

    const valor =
        data && typeof data[elemento] === "string"
            ? data[elemento].trim()
            : "";

    return {
        elemento,
        contenido: valor || DEFAULT_TEXTS[elemento],
        updated_at: data?.updated_at || null
    };
}

async function saveText(elemento, contenido) {
    if (!TEXT_ELEMENTS.includes(elemento)) {
        throw new Error(
            `Elemento de texto de Inicio Web no válido: ${elemento}`
        );
    }

    const normalizedContent =
        typeof contenido === "string"
            ? contenido.trim()
            : "";

    if (!normalizedContent) {
        throw new Error(
            "El texto no puede quedar vacío."
        );
    }

    const supabase = getSupabaseClient();
    const payload = {
        [elemento]: normalizedContent,
        updated_at: new Date().toISOString()
    };

    const { data: existingRow, error: existingError } = await supabase
        .from("inicio_web_config")
        .select("id, updated_at")
        .limit(1)
        .maybeSingle();

    if (existingError) {
        throw existingError;
    }

    let result;

    if (existingRow && existingRow.id) {
        const { data, error } = await supabase
            .from("inicio_web_config")
            .update(payload)
            .eq("id", existingRow.id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        result = data;
    } else {
        const { data, error } = await supabase
            .from("inicio_web_config")
            .insert(payload)
            .select()
            .single();

        if (error) {
            throw error;
        }

        result = data;
    }

    return {
        elemento,
        contenido: result?.[elemento] || normalizedContent,
        updated_at: result?.updated_at || payload.updated_at
    };
}

function getDefaultText(elemento) {
    if (!TEXT_ELEMENTS.includes(elemento)) {
        return null;
    }

    return {
        elemento,
        contenido: DEFAULT_TEXTS[elemento]
    };
}

    const GALLERY_TABLE_NAME = "inicio_web_galeria";
    const EXPERTISE_TABLE_NAME = "inicio_web_expertise";
    const GALLERY_BUCKET_NAME =
        (window.APP_CONFIG &&
            window.APP_CONFIG.STORAGE &&
            window.APP_CONFIG.STORAGE.PUBLICACIONES_BUCKET)
            ? window.APP_CONFIG.STORAGE.PUBLICACIONES_BUCKET
            : "publicaciones";
    const EXPERTISE_BUCKET_NAME = GALLERY_BUCKET_NAME;
    const EXPERTISE_MEDIA_PATH_PREFIX = "inicio-web-expertise";
    const DEFAULT_EXPERTISE_FALLBACK_VIDEO = "videos/vid.mp4";

    function isValidGalleryImageFile(file) {
        if (!file || !(file instanceof File)) {
            throw new Error("Debes seleccionar una imagen válida.");
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            throw new Error(
                "La imagen debe ser JPG, PNG o WebP."
            );
        }
    }

    async function removeGalleryStorageFile(storagePath) {
        if (!storagePath) {
            return;
        }

        const supabase = getSupabaseClient();

        const { error } = await supabase
            .storage
            .from(GALLERY_BUCKET_NAME)
            .remove([storagePath]);

        if (error) {
            console.warn(
                "No se pudo eliminar la imagen de la galería del Storage:",
                error
            );
        }
    }

    async function listGallery() {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from(GALLERY_TABLE_NAME)
            .select("id, image_url, storage_path, is_visible, created_at, updated_at")
            .order("created_at", { ascending: false });

        if (error) {
            throw error;
        }

        return (data || []).map((row) => ({
            id: row.id,
            image_url: row.image_url || "",
            storage_path: row.storage_path || "",
            is_visible: Boolean(row.is_visible),
            created_at: row.created_at || null,
            updated_at: row.updated_at || null
        }));
    }

    async function uploadGalleryImage(file) {
        isValidGalleryImageFile(file);

        const supabase = getSupabaseClient();
        const extension = String(file.name || "image.jpg")
            .split(".")
            .pop()
            .toLowerCase() || "jpg";

        const storagePath = `inicio-web-galeria/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase
            .storage
            .from(GALLERY_BUCKET_NAME)
            .upload(storagePath, file, {
                cacheControl: "3600",
                upsert: false
            });

        if (uploadError) {
            throw uploadError;
        }

        const { data: publicUrlData } = supabase
            .storage
            .from(GALLERY_BUCKET_NAME)
            .getPublicUrl(storagePath);

        const publicUrl = publicUrlData?.publicUrl || "";

        if (!publicUrl) {
            await removeGalleryStorageFile(storagePath);
            throw new Error(
                "No se pudo generar la URL pública de la imagen subida."
            );
        }

        try {
            const { data, error } = await supabase
                .from(GALLERY_TABLE_NAME)
                .insert({
                    image_url: publicUrl,
                    storage_path: storagePath,
                    is_visible: true,
                    updated_at: new Date().toISOString()
                })
                .select("id, image_url, storage_path, is_visible, created_at, updated_at")
                .single();

            if (error) {
                throw error;
            }

            return {
                id: data.id,
                image_url: data.image_url || publicUrl,
                storage_path: data.storage_path || storagePath,
                is_visible: Boolean(data.is_visible),
                created_at: data.created_at || null,
                updated_at: data.updated_at || null
            };
        } catch (error) {
            await removeGalleryStorageFile(storagePath);
            throw error;
        }
    }

    async function uploadGalleryImages(files) {
        if (!Array.isArray(files) || files.length === 0) {
            throw new Error("Debes seleccionar al menos una imagen.");
        }

        const created = [];
        const failed = [];

        for (const file of files) {
            try {
                const item = await uploadGalleryImage(file);
                created.push(item);
            } catch (error) {
                const fileName = file && file.name ? file.name : "Archivo";
                failed.push(fileName);
                console.error(
                    `Error al subir la imagen de la galería: ${fileName}`,
                    error
                );
            }
        }

        if (!created.length) {
            throw new Error(
                `No se pudo guardar ninguna imagen. Falló: ${failed.join(", ")}`
            );
        }

        return {
            created,
            failed
        };
    }

    async function updateGalleryVisibility(id, isVisible) {
        if (!id) {
            throw new Error("Falta el identificador de la imagen.");
        }

        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from(GALLERY_TABLE_NAME)
            .update({
                is_visible: Boolean(isVisible),
                updated_at: new Date().toISOString()
            })
            .eq("id", id)
            .select("id, image_url, storage_path, is_visible, created_at, updated_at")
            .single();

        if (error) {
            throw error;
        }

        return {
            id: data.id,
            image_url: data.image_url || "",
            storage_path: data.storage_path || "",
            is_visible: Boolean(data.is_visible),
            created_at: data.created_at || null,
            updated_at: data.updated_at || null
        };
    }

    async function deleteGalleryImage(id, storagePath) {
        if (!id) {
            throw new Error("Falta el identificador de la imagen.");
        }

        const supabase = getSupabaseClient();

        const { error: deleteError } = await supabase
            .from(GALLERY_TABLE_NAME)
            .delete()
            .eq("id", id);

        if (deleteError) {
            throw deleteError;
        }

        if (storagePath) {
            await removeGalleryStorageFile(storagePath);
        }

        return true;
    }

    function normalizeExpertiseRecord(row) {
        if (!row) {
            return null;
        }

        return {
            id: row.id || null,
            media_type: row.media_type || "image",
            video_url: row.video_url || null,
            alt_text: row.alt_text || "",
            is_visible: Boolean(row.is_visible),
            created_at: row.created_at || null,
            updated_at: row.updated_at || null
        };
    }

    function isCustomExpertiseVideo(item) {
        if (!item || item.media_type !== "video") {
            return false;
        }

        const videoUrl = typeof item.video_url === "string" ? item.video_url.trim() : "";
        return videoUrl !== "";
    }

    function hasCustomExpertiseVideo(items) {
        return Array.isArray(items) && items.some((item) => isCustomExpertiseVideo(item));
    }

    function normalizeExpertiseVideoUrl(value) {
        if (typeof value !== "string") {
            return "";
        }

        return value.trim();
    }

    function detectExpertiseVideoType(videoUrl) {
        const normalizedUrl = normalizeExpertiseVideoUrl(videoUrl);

        if (!normalizedUrl) {
            return "unknown";
        }

        try {
            const url = new URL(normalizedUrl);
            const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
            const pathname = url.pathname.toLowerCase();

            if (/\.(mp4|webm|ogg)(?:$|[?#])/i.test(pathname)) {
                return "direct-video";
            }

            if (["youtube.com", "m.youtube.com", "youtu.be"].includes(hostname) || hostname.endsWith(".youtube.com")) {
                return "youtube";
            }

            if (["vimeo.com"].includes(hostname) || hostname.endsWith(".vimeo.com")) {
                return "vimeo";
            }

            if (["tiktok.com"].includes(hostname) || hostname.endsWith(".tiktok.com")) {
                return "tiktok";
            }

            if (["instagram.com"].includes(hostname) || hostname.endsWith(".instagram.com")) {
                return "instagram";
            }

            if (["facebook.com", "fb.watch"].includes(hostname) || hostname.endsWith(".facebook.com") || hostname.endsWith(".fb.watch")) {
                return "facebook";
            }

            return "unknown";
        } catch (error) {
            return "unknown";
        }
    }

    function getExpertiseVideoEmbedUrl(videoUrl) {
        const normalizedUrl = normalizeExpertiseVideoUrl(videoUrl);

        if (!normalizedUrl) {
            return "";
        }

        try {
            const url = new URL(normalizedUrl);
            const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
            const pathParts = url.pathname.split("/").filter(Boolean);

            if (["youtube.com", "m.youtube.com"].includes(hostname) || hostname.endsWith(".youtube.com")) {
                const videoId = url.searchParams.get("v") || pathParts[1] || "";
                if (videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)) {
                    return `https://www.youtube.com/embed/${videoId}`;
                }
            }

            if (hostname === "youtu.be") {
                const videoId = pathParts[0] || "";
                if (videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)) {
                    return `https://www.youtube.com/embed/${videoId}`;
                }
            }

            if (["vimeo.com"].includes(hostname) || hostname.endsWith(".vimeo.com")) {
                const videoId = pathParts[0] || "";
                if (videoId && /^\d+$/.test(videoId)) {
                    return `https://player.vimeo.com/video/${videoId}`;
                }
            }

            return "";
        } catch (error) {
            return "";
        }
    }

    function getExpertiseImageStoragePath(id) {
        if (!id) {
            return "";
        }

        return `${EXPERTISE_MEDIA_PATH_PREFIX}/${id}`;
    }

    async function listExpertise() {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from(EXPERTISE_TABLE_NAME)
            .select("id, media_type, video_url, alt_text, is_visible, created_at, updated_at")
            .order("created_at", { ascending: true });

        if (error) {
            throw error;
        }

        return (data || [])
            .map(normalizeExpertiseRecord)
            .filter(Boolean);
    }

    function buildExpertisePublicImageUrl(id) {
        if (!id) {
            return "";
        }

        const supabase = getSupabaseClient();
        const storagePath = getExpertiseImageStoragePath(id);
        const { data } = supabase.storage.from(EXPERTISE_BUCKET_NAME).getPublicUrl(storagePath);

        return data?.publicUrl || "";
    }

    async function createExpertiseImage(file, altText = "") {
        if (!file || !(file instanceof File)) {
            throw new Error("Debes seleccionar una imagen válida.");
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            throw new Error("La imagen debe ser JPG, PNG o WebP.");
        }

        const supabase = getSupabaseClient();
        const id = crypto.randomUUID();
        const storagePath = getExpertiseImageStoragePath(id);

        const { data: existingRow, error: existingError } = await supabase
            .from(EXPERTISE_TABLE_NAME)
            .select("id")
            .eq("id", id)
            .maybeSingle();

        if (existingError) {
            throw existingError;
        }

        if (existingRow && existingRow.id) {
            throw new Error("No fue posible generar un identificador válido para la imagen.");
        }

        const { error: insertError } = await supabase
            .from(EXPERTISE_TABLE_NAME)
            .insert({
                id,
                media_type: "image",
                video_url: null,
                alt_text: typeof altText === "string" ? altText.trim() : "",
                is_visible: true,
                updated_at: new Date().toISOString()
            });

        if (insertError) {
            throw insertError;
        }

        try {
            const { error: uploadError } = await supabase
                .storage
                .from(EXPERTISE_BUCKET_NAME)
                .upload(storagePath, file, {
                    cacheControl: "3600",
                    upsert: false,
                    contentType: file.type || "image/jpeg"
                });

            if (uploadError) {
                await supabase
                    .from(EXPERTISE_TABLE_NAME)
                    .delete()
                    .eq("id", id);

                throw uploadError;
            }

            const { data, error } = await supabase
                .from(EXPERTISE_TABLE_NAME)
                .select("id, media_type, video_url, alt_text, is_visible, created_at, updated_at")
                .eq("id", id)
                .single();

            if (error) {
                throw error;
            }

            return normalizeExpertiseRecord(data);
        } catch (error) {
            try {
                await supabase.storage.from(EXPERTISE_BUCKET_NAME).remove([storagePath]);
            } catch (storageCleanupError) {
                console.warn("No se pudo limpiar el archivo de expertise tras un error de subida:", storageCleanupError);
            }

            try {
                await supabase.from(EXPERTISE_TABLE_NAME).delete().eq("id", id);
            } catch (dbCleanupError) {
                console.warn("No se pudo limpiar el registro de expertise tras un error de subida:", dbCleanupError);
            }

            throw error;
        }
    }

    async function uploadExpertiseImages(files) {
        if (!Array.isArray(files) || files.length === 0) {
            throw new Error("Debes seleccionar al menos una imagen.");
        }

        const created = [];
        const failed = [];

        for (const file of files) {
            try {
                const item = await createExpertiseImage(file, "");
                created.push(item);
            } catch (error) {
                const fileName = file && file.name ? file.name : "Archivo";
                failed.push(fileName);
                console.error(`Error al subir la imagen de expertise: ${fileName}`, error);
            }
        }

        if (!created.length) {
            throw new Error(`No se pudo guardar ninguna imagen. Falló: ${failed.join(", ")}`);
        }

        return { created, failed };
    }

    async function createExpertiseVideoFile(file) {
        if (!file || !(file instanceof File)) {
            throw new Error("Debes seleccionar un archivo de video válido.");
        }

        const allowedTypes = ["video/mp4", "video/webm", "video/ogg"];
        if (!allowedTypes.includes(file.type)) {
            throw new Error("El archivo debe ser un video MP4, WebM u Ogg.");
        }

        const maxBytes = 2 * 1024 * 1024;
        if (file.size > maxBytes) {
            throw new Error("El video no puede superar los 2 MB.");
        }

        const supabase = getSupabaseClient();

        const { data: existingRows, error: existingError } = await supabase
            .from(EXPERTISE_TABLE_NAME)
            .select("id, media_type, video_url")
            .eq("media_type", "video");

        if (existingError) {
            throw existingError;
        }

        const customVideoExists = (existingRows || []).some((item) => {
            if (!item || item.media_type !== "video") {
                return false;
            }

            const existingVideoUrl = typeof item.video_url === "string" ? item.video_url.trim() : "";
            return existingVideoUrl !== "";
        });

        if (customVideoExists) {
            throw new Error("Ya existe un video personalizado en Expertise.");
        }

        const id = crypto.randomUUID();
        const fileExtension = (file.name && file.name.includes("."))
            ? file.name.split(".").pop().toLowerCase()
            : "mp4";
        const storagePath = `${EXPERTISE_MEDIA_PATH_PREFIX}/${id}.${fileExtension}`;

        const { error: uploadError } = await supabase
            .storage
            .from(EXPERTISE_BUCKET_NAME)
            .upload(storagePath, file, {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type || "video/mp4"
            });

        if (uploadError) {
            throw uploadError;
        }

        const publicUrl = supabase.storage.from(EXPERTISE_BUCKET_NAME).getPublicUrl(storagePath).data?.publicUrl || "";

        const payload = {
            id,
            media_type: "video",
            video_url: publicUrl,
            alt_text: "",
            is_visible: true,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from(EXPERTISE_TABLE_NAME)
            .insert(payload)
            .select("id, media_type, video_url, alt_text, is_visible, created_at, updated_at")
            .single();

        if (error) {
            try {
                await supabase.storage.from(EXPERTISE_BUCKET_NAME).remove([storagePath]);
            } catch (cleanupError) {
                console.warn("No se pudo limpiar el archivo de video tras un error de inserción:", cleanupError);
            }
            throw error;
        }

        return normalizeExpertiseRecord(data);
    }

    async function createExpertiseVideo({ videoUrl = null, altText = "" } = {}) {
        const normalizedVideoUrl = normalizeExpertiseVideoUrl(videoUrl);
        const cleanAltText = typeof altText === "string" ? altText.trim() : "";

        if (!normalizedVideoUrl) {
            throw new Error("Debes pegar una URL válida para el video.");
        }

        const supabase = getSupabaseClient();

        const { data: existingRows, error: existingError } = await supabase
            .from(EXPERTISE_TABLE_NAME)
            .select("id, media_type, video_url")
            .eq("media_type", "video");

        if (existingError) {
            throw existingError;
        }

        const customVideoExists = (existingRows || []).some((item) => {
            if (!item || item.media_type !== "video") {
                return false;
            }

            const existingVideoUrl = typeof item.video_url === "string" ? item.video_url.trim() : "";
            return existingVideoUrl !== "";
        });

        if (customVideoExists) {
            throw new Error("Ya existe un video personalizado en Expertise.");
        }

        const payload = {
            media_type: "video",
            video_url: normalizedVideoUrl,
            alt_text: "",
            is_visible: true,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from(EXPERTISE_TABLE_NAME)
            .insert(payload)
            .select("id, media_type, video_url, alt_text, is_visible, created_at, updated_at")
            .single();

        if (error) {
            throw error;
        }

        return normalizeExpertiseRecord(data);
    }

    async function updateExpertiseVisibility(id, isVisible) {
        if (!id) {
            throw new Error("Falta el identificador del elemento.");
        }

        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from(EXPERTISE_TABLE_NAME)
            .update({
                is_visible: Boolean(isVisible),
                updated_at: new Date().toISOString()
            })
            .eq("id", id)
            .select("id, media_type, video_url, alt_text, is_visible, created_at, updated_at")
            .single();

        if (error) {
            throw error;
        }

        return normalizeExpertiseRecord(data);
    }

    async function deleteExpertiseItem(item) {
        if (!item || !item.id) {
            throw new Error("Falta el identificador del elemento.");
        }

        const supabase = getSupabaseClient();

        if (item.media_type === "image") {
            const storagePath = getExpertiseImageStoragePath(item.id);
            const { error: storageError } = await supabase
                .storage
                .from(EXPERTISE_BUCKET_NAME)
                .remove([storagePath]);

            if (storageError) {
                throw new Error(`No se pudo eliminar la imagen del Storage: ${storageError.message || "Error desconocido"}`);
            }
        }

        const { error: deleteError } = await supabase
            .from(EXPERTISE_TABLE_NAME)
            .delete()
            .eq("id", item.id);

        if (deleteError) {
            throw deleteError;
        }

        return true;
    }

    window.InicioWebService = {
        listStyles,
        getStyle,
        saveStyle,
        resetStyle,
        saveAllStyles,
        getDefaultStyle,
        DEFAULT_STYLES,
        getText,
        saveText,
        getDefaultText,
        DEFAULT_TEXTS,
        listGallery,
        uploadGalleryImage,
        uploadGalleryImages,
        updateGalleryVisibility,
        deleteGalleryImage,
        listExpertise,
        createExpertiseImage,
        uploadExpertiseImages,
        createExpertiseVideoFile,
        createExpertiseVideo,
        updateExpertiseVisibility,
        deleteExpertiseItem,
        buildExpertisePublicImageUrl,
        getExpertiseImageStoragePath,
        DEFAULT_EXPERTISE_FALLBACK_VIDEO,
        detectExpertiseVideoType,
        getExpertiseVideoEmbedUrl,
        isCustomExpertiseVideo,
        hasCustomExpertiseVideo
    };
})();