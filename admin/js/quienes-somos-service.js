window.QuienesSomosService = (function createQuienesSomosService() {
    "use strict";

    const CONFIG_TABLE = (
        window.APP_CONFIG &&
        window.APP_CONFIG.TABLES &&
        window.APP_CONFIG.TABLES.QUIENES_SOMOS_CONFIG
    ) ? window.APP_CONFIG.TABLES.QUIENES_SOMOS_CONFIG : "quienes_somos_config";

    const TESTIMONIOS_TABLE = (
        window.APP_CONFIG &&
        window.APP_CONFIG.TABLES &&
        window.APP_CONFIG.TABLES.QUIENES_SOMOS_TESTIMONIOS
    ) ? window.APP_CONFIG.TABLES.QUIENES_SOMOS_TESTIMONIOS : "quienes_somos_testimonios";
    const STYLE_TABLE = "inicio_web_styles";

    const DEFAULT_CONFIG = {
        expertise_subtitulo: "Sobre Next Level",
        expertise_titulo: "Transformamos momentos en contenido con alma.",
        expertise_parrafo_1: "Next Level Producciones nace para capturar lo extraordinario de cada evento y convertirlo en una narrativa visual memorable. Combinamos técnica, sensibilidad y estilo para que cada proyecto se vea como una pieza única.",
        expertise_parrafo_2: "Nos especializamos en fotografía, video, producción creativa y experiencias visuales personalizadas para bodas, celebraciones, contenido corporativo y proyectos con identidad propia.",

        about_kicker: "Historia",
        about_titulo: "Nosotros no solo capturamos momentos: los convertimos en una narrativa visual.",
        about_parrafo_1: "En Next Level Producciones trabajamos con una mirada editorial, cuidando cada detalle para que cada proyecto tenga una atmósfera propia, una identidad clara y una sensación de exclusividad.",
        about_parrafo_2: "Desde bodas y celebraciones hasta contenido corporativo y proyectos creativos, combinamos técnica, sensibilidad y dirección visual para que tu historia se vea tan memorable como se siente.",
        about_parrafo_3: "Cada imagen es parte de una conversación más amplia: luz, emoción, ritmo y diseño. Esa es la diferencia de trabajar con un equipo que entiende la estética como una herramienta de comunicación.",
        about_video_1: "videos/video1.mp4",
        about_video_2: "videos/video2.mp4",
        about_video_3: "videos/video3.mp4",

        about_banner_tag: "Nuestra energía",
        about_banner_titulo: "Donde la creatividad visual se convierte en una experiencia memorable.",
        about_banner_descripcion: "Cada proyecto es una oportunidad para contar una historia con sensibilidad, precisión y un estilo que se mantiene fiel a tu marca y a tu momento más importante."
    }; 

    const DEFAULT_TESTIMONIOS = [
        {
            position: 1,
            titulo: "15 años",
            nombre_ubicacion: "Naria | El Salvador",
            texto: "Estamos muy felices y agradecidos por el resultado de nuestras fotografías. Desde el primer momento recibimos una atención excepcional y un ambiente lleno de confianza y profesionalismo. Cada toma refleja la pasión y el talento detrás de la cámara, logrando imágenes llenas de vida, elegancia y emoción. Gracias por convertir momentos especiales en recuerdos inolvidables.",
            image_url: "images/15a.jpeg",
            is_visible: true
        },
        {
            position: 2,
            titulo: "Esposos",
            nombre_ubicacion: "Hector & Jennifer | El Salvador",
            texto: "Queremos agradecer profundamente por el increíble trabajo realizado en nuestra sesión fotográfica. Cada imagen logró capturar emociones reales, momentos espontáneos y detalles que jamás olvidaremos. La dedicación, creatividad y profesionalismo hicieron que nos sintiéramos cómodos durante toda la experiencia. Sin duda, las fotografías superaron nuestras expectativas y hoy tenemos recuerdos que podremos conservar para siempre.",
            image_url: "images/U25.jpeg",
            is_visible: true
        },
        {
            position: 3,
            titulo: "ESPOSOS",
            nombre_ubicacion: "Kristen & Daniel | El Salvador",
            texto: "Estamos muy felices y agradecidos por el resultado de nuestras fotografías. Desde el primer momento recibimos una atención excepcional y un ambiente lleno de confianza y profesionalismo. Cada toma refleja la pasión y el talento detrás de la cámara, logrando imágenes llenas de vida, elegancia y emoción. Gracias por convertir momentos especiales en recuerdos inolvidables.",
            image_url: "images/2ULI01.jpeg",
            is_visible: true
        }
    ];

    const DEFAULT_QUIENES_STYLES = {
        fuente: "inherit",
        peso: 400,
        tamano: 18,
        estilo: "normal",
        alineacion: "left",
        color: "#ffffff",
        transformacion: "none",
        line_height: 1.5,
        letter_spacing: 0
    };

    function getSupabaseClient() {
        if (window.supabaseClient) {
            return window.supabaseClient;
        }

        if (window.supabase) {
            return window.supabase;
        }

        throw new Error("No se encontró el cliente de Supabase.");
    }

    function normalizeConfigMap(rows = []) {
        return (rows || []).reduce((accumulator, row) => {
            if (!row || !row.key) {
                return accumulator;
            }

            accumulator[row.key] = typeof row.value === "string" ? row.value : "";
            return accumulator;
        }, {});
    }

    function normalizeTestimonial(row = {}) {
        return {
            id: row.id || null,
            position: Number(row.position) || 0,
            titulo: typeof row.titulo === "string" ? row.titulo : "",
            nombre_ubicacion: typeof row.nombre_ubicacion === "string" ? row.nombre_ubicacion : "",
            texto: typeof row.texto === "string" ? row.texto : "",
            image_url: typeof row.image_url === "string" ? row.image_url : "",
            is_visible: row.is_visible !== false,
            created_at: row.created_at || null,
            updated_at: row.updated_at || null
        };
    }

    function normalizeStyle(elemento, row = {}) {
        const numberOrDefault = (value, fallback) => {
            const number = Number(value);
            return Number.isFinite(number) ? number : fallback;
        };

        return {
            elemento,
            fuente: typeof row.fuente === "string" ? row.fuente : DEFAULT_QUIENES_STYLES.fuente,
            peso: numberOrDefault(row.peso, DEFAULT_QUIENES_STYLES.peso),
            tamano: numberOrDefault(row.tamano, DEFAULT_QUIENES_STYLES.tamano),
            estilo: row.estilo === "italic" ? "italic" : "normal",
            alineacion: ["left", "center", "right", "justify"].includes(row.alineacion)
                ? row.alineacion
                : DEFAULT_QUIENES_STYLES.alineacion,
            color: /^#[0-9a-fA-F]{6}$/.test(row.color || "")
                ? row.color
                : DEFAULT_QUIENES_STYLES.color,
            transformacion: ["none", "uppercase", "lowercase", "capitalize"].includes(row.transformacion)
                ? row.transformacion
                : DEFAULT_QUIENES_STYLES.transformacion,
            line_height: numberOrDefault(row.line_height, DEFAULT_QUIENES_STYLES.line_height),
            letter_spacing: numberOrDefault(row.letter_spacing, DEFAULT_QUIENES_STYLES.letter_spacing)
        };
    }

    async function getStyle(elemento) {
        if (!elemento || !elemento.startsWith("quienes_")) {
            throw new Error("El elemento de estilo de Quiénes Somos no es válido.");
        }

        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(STYLE_TABLE)
            .select("*")
            .eq("elemento", elemento)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return normalizeStyle(elemento, data || {});
    }

    async function saveStyle(style) {
        if (!style || !style.elemento || !style.elemento.startsWith("quienes_")) {
            throw new Error("No se recibió un elemento de estilo de Quiénes Somos válido.");
        }

        const normalized = normalizeStyle(style.elemento, style);
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(STYLE_TABLE)
            .upsert({
                elemento: normalized.elemento,
                fuente: normalized.fuente,
                peso: normalized.peso,
                tamano: normalized.tamano,
                estilo: normalized.estilo,
                alineacion: normalized.alineacion,
                color: normalized.color,
                transformacion: normalized.transformacion,
                line_height: normalized.line_height,
                letter_spacing: normalized.letter_spacing,
                updated_at: new Date().toISOString()
            }, { onConflict: "elemento" })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return normalizeStyle(normalized.elemento, data || normalized);
    }

    async function listConfig() {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(CONFIG_TABLE)
            .select("id, key, value, created_at, updated_at")
            .order("key", { ascending: true });

        if (error) {
            console.error("Error al consultar quienes_somos_config desde Supabase:", error);
            throw error;
        }

        return normalizeConfigMap(data || []);
    }

    async function listTestimonials(includeHidden = true) {
        const supabase = getSupabaseClient();
        let query = supabase
            .from(TESTIMONIOS_TABLE)
            .select("id, position, titulo, nombre_ubicacion, texto, image_url, is_visible, created_at, updated_at")
            .order("position", { ascending: true });

        if (!includeHidden) {
            query = query.eq("is_visible", true);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error al consultar quienes_somos_testimonios desde Supabase:", error);
            throw error;
        }

        return (data || []).map(normalizeTestimonial);
    }

    async function saveConfigEntries(entries = {}) {
        const supabase = getSupabaseClient();
        const updates = Object.entries(entries || {}).filter(([key]) => Boolean(key));

        if (!updates.length) {
            return {};
        }

        const nowIso = new Date().toISOString();
        const rows = updates.map(([key, value]) => ({
            key,
            value: value === null || typeof value === "undefined" ? "" : String(value),
            updated_at: nowIso
        }));

        // Intentar upsert atómico aprovechando el constraint UNIQUE(key)
        const { error: upsertError } = await supabase
            .from(CONFIG_TABLE)
            .upsert(rows, { onConflict: "key" });

        if (!upsertError) {
            const results = {};
            updates.forEach(([key, value]) => {
                results[key] = value === null || typeof value === "undefined" ? "" : String(value);
            });
            return results;
        }

        console.warn("Fallo el upsert por lotes en quienes_somos_config, intentando actualización individual:", upsertError);

        // Fallback: actualización o inserción individual
        const results = {};

        for (const [key, value] of updates) {
            const rowValue = value === null || typeof value === "undefined" ? "" : String(value);

            const { data: updatedRows, error: updateError } = await supabase
                .from(CONFIG_TABLE)
                .update({
                    value: rowValue,
                    updated_at: nowIso
                })
                .eq("key", key)
                .select("id");

            if (updateError) {
                console.error(`Error actualizando clave "${key}" en quienes_somos_config:`, updateError);
                throw updateError;
            }

            if (!updatedRows || updatedRows.length === 0) {
                const { error: insertError } = await supabase
                    .from(CONFIG_TABLE)
                    .insert([{
                        key,
                        value: rowValue,
                        created_at: nowIso,
                        updated_at: nowIso
                    }]);

                if (insertError) {
                    console.error(`Error insertando clave "${key}" en quienes_somos_config:`, insertError);
                    throw insertError;
                }
            }

            results[key] = rowValue;
        }

        return results;
    }

    function getStorageBucketName() {
        return (
            window.APP_CONFIG &&
            window.APP_CONFIG.STORAGE &&
            window.APP_CONFIG.STORAGE.PUBLICACIONES_BUCKET
        ) ? window.APP_CONFIG.STORAGE.PUBLICACIONES_BUCKET : "publicaciones";
    }

    async function uploadTestimonialImage(file, position) {
        if (!file || !(file instanceof File)) {
            throw new Error("Debes seleccionar un archivo de imagen válido.");
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            throw new Error("La imagen debe ser JPG, PNG o WebP.");
        }

        const maxBytes = 5 * 1024 * 1024;
        if (file.size > maxBytes) {
            throw new Error("La imagen no puede superar los 5 MB.");
        }

        const safePosition = Number(position);
        if (!Number.isInteger(safePosition) || safePosition < 1 || safePosition > 3) {
            throw new Error("La posición del testimonio debe ser un número entero entre 1 y 3.");
        }

        const supabase = getSupabaseClient();
        const bucketName = getStorageBucketName();
        const extension = String(file.name.split(".").pop() || "jpg").toLowerCase();
        const storagePath = `quienes-somos/testimonios/testimonio-${safePosition}-${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase
            .storage
            .from(bucketName)
            .upload(storagePath, file, {
                cacheControl: "3600",
                upsert: false
            });

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase
            .storage
            .from(bucketName)
            .getPublicUrl(storagePath);

        if (!data || !data.publicUrl) {
            throw new Error("No se pudo obtener la URL pública de la imagen.");
        }

        return {
            publicUrl: data.publicUrl,
            storagePath
        };
    }

    async function removeStorageFileByUrl(imageUrl) {
        if (!imageUrl || typeof imageUrl !== "string") {
            return;
        }
        try {
            const bucketName = getStorageBucketName();
            const marker = `/storage/v1/object/public/${bucketName}/`;
            if (imageUrl.includes(marker)) {
                const storagePath = imageUrl.split(marker)[1];
                if (storagePath && storagePath.startsWith("quienes-somos/testimonios/")) {
                    const supabase = getSupabaseClient();
                    await supabase.storage.from(bucketName).remove([storagePath]);
                }
            }
        } catch (error) {
            console.warn("No se pudo eliminar el archivo previo de storage:", error);
        }
    }

    async function saveTestimonial(position, payload = {}, imageFile = null) {
        const supabase = getSupabaseClient();
        const safePosition = Number(position);

        if (!Number.isInteger(safePosition) || safePosition < 1 || safePosition > 3) {
            throw new Error("La posición del testimonio debe ser un número entero entre 1 y 3.");
        }

        const { data: existingRows, error: selectError } = await supabase
            .from(TESTIMONIOS_TABLE)
            .select("id, image_url")
            .eq("position", safePosition)
            .limit(1);

        if (selectError) {
            throw selectError;
        }

        const existingRow = existingRows && existingRows[0] ? existingRows[0] : null;
        const previousImageUrl = existingRow && typeof existingRow.image_url === "string" ? existingRow.image_url : "";

        let uploaded = null;
        if (imageFile && imageFile instanceof File) {
            uploaded = await uploadTestimonialImage(imageFile, safePosition);
        }

        const rawImageUrl = typeof payload.image_url === "string" ? payload.image_url.trim() : "";
        const targetImageUrl = uploaded
            ? uploaded.publicUrl
            : (rawImageUrl && !rawImageUrl.startsWith("[Seleccionada:")
                ? rawImageUrl
                : previousImageUrl);

        const row = {
            position: safePosition,
            titulo: typeof payload.titulo === "string" ? payload.titulo : "",
            nombre_ubicacion: typeof payload.nombre_ubicacion === "string" ? payload.nombre_ubicacion : "",
            texto: typeof payload.texto === "string" ? payload.texto : "",
            image_url: targetImageUrl,
            is_visible: payload.is_visible !== false,
            updated_at: new Date().toISOString()
        };

        let result;
        if (existingRow && existingRow.id) {
            const { error } = await supabase
                .from(TESTIMONIOS_TABLE)
                .update(row)
                .eq("id", existingRow.id);

            if (error) {
                throw error;
            }

            result = normalizeTestimonial({ ...row, id: existingRow.id });
        } else {
            const { error } = await supabase
                .from(TESTIMONIOS_TABLE)
                .insert([{
                    ...row,
                    created_at: new Date().toISOString()
                }]);

            if (error) {
                throw error;
            }

            result = normalizeTestimonial(row);
        }

        if (uploaded && previousImageUrl && previousImageUrl !== uploaded.publicUrl) {
            await removeStorageFileByUrl(previousImageUrl);
        }

        return result;
    }

    function getDefaultConfig() {
        return { ...DEFAULT_CONFIG };
    }

    function getDefaultTestimonials() {
        return DEFAULT_TESTIMONIOS.map((item) => ({ ...item }));
    }

    async function ensureSeededDefaults() {
        const [configMap, testimonials] = await Promise.all([
            listConfig().catch(() => ({})),
            listTestimonials(true).catch(() => [])
        ]);

        const missingConfigKeys = Object.keys(DEFAULT_CONFIG).filter((key) => !(key in configMap));
        const configUpdates = {};

        missingConfigKeys.forEach((key) => {
            configUpdates[key] = DEFAULT_CONFIG[key];
        });

        if (Object.keys(configUpdates).length) {
            await saveConfigEntries(configUpdates);
        }

        const existingPositions = new Set((testimonials || []).map((item) => Number(item.position)).filter((position) => Number.isInteger(position)));
        const missingTestimonials = DEFAULT_TESTIMONIOS.filter((item) => !existingPositions.has(Number(item.position)));

        for (const item of missingTestimonials) {
            await saveTestimonial(item.position, {
                titulo: item.titulo,
                nombre_ubicacion: item.nombre_ubicacion,
                texto: item.texto,
                image_url: item.image_url,
                is_visible: item.is_visible !== false
            });
        }

        return {
            config: await listConfig().catch(() => DEFAULT_CONFIG),
            testimonials: await listTestimonials(true).catch(() => getDefaultTestimonials())
        };
    }

    return {
        CONFIG_TABLE,
        TESTIMONIOS_TABLE,
        DEFAULT_CONFIG,
        DEFAULT_TESTIMONIOS,
        getDefaultConfig,
        getDefaultTestimonials,
        listConfig,
        listTestimonials,
        saveConfigEntries,
        saveTestimonial,
        getStyle,
        saveStyle,
        uploadTestimonialImage,
        removeStorageFileByUrl,
        ensureSeededDefaults
    };
})();
