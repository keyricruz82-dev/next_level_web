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

    async function listConfig() {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(CONFIG_TABLE)
            .select("id, key, value, created_at, updated_at")
            .order("key", { ascending: true });

        if (error) {
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

        const results = {};

        for (const [key, value] of updates) {
            const rowValue = value === null || typeof value === "undefined" ? "" : String(value);
            const { data: existingRows, error: selectError } = await supabase
                .from(CONFIG_TABLE)
                .select("id")
                .eq("key", key)
                .limit(1);

            if (selectError) {
                throw selectError;
            }

            const existingRow = existingRows && existingRows[0] ? existingRows[0] : null;
            const nowIso = new Date().toISOString();

            if (existingRow && existingRow.id) {
                const { error } = await supabase
                    .from(CONFIG_TABLE)
                    .update({
                        value: rowValue,
                        updated_at: nowIso
                    })
                    .eq("id", existingRow.id);

                if (error) {
                    throw error;
                }
            } else {
                const { error } = await supabase
                    .from(CONFIG_TABLE)
                    .insert([{
                        key,
                        value: rowValue,
                        created_at: nowIso,
                        updated_at: nowIso
                    }]);

                if (error) {
                    throw error;
                }
            }

            results[key] = rowValue;
        }

        return results;
    }

    async function saveTestimonial(position, payload = {}) {
        const supabase = getSupabaseClient();
        const safePosition = Number(position);

        if (!Number.isInteger(safePosition) || safePosition < 1 || safePosition > 3) {
            throw new Error("La posición del testimonio debe ser un número entero entre 1 y 3.");
        }

        const row = {
            position: safePosition,
            titulo: typeof payload.titulo === "string" ? payload.titulo : "",
            nombre_ubicacion: typeof payload.nombre_ubicacion === "string" ? payload.nombre_ubicacion : "",
            texto: typeof payload.texto === "string" ? payload.texto : "",
            image_url: typeof payload.image_url === "string" ? payload.image_url : "",
            is_visible: payload.is_visible !== false,
            updated_at: new Date().toISOString()
        };

        const { data: existingRows, error: selectError } = await supabase
            .from(TESTIMONIOS_TABLE)
            .select("id")
            .eq("position", safePosition)
            .limit(1);

        if (selectError) {
            throw selectError;
        }

        const existingRow = existingRows && existingRows[0] ? existingRows[0] : null;

        if (existingRow && existingRow.id) {
            const { error } = await supabase
                .from(TESTIMONIOS_TABLE)
                .update(row)
                .eq("id", existingRow.id);

            if (error) {
                throw error;
            }

            return normalizeTestimonial({ ...row, id: existingRow.id });
        }

        const { error } = await supabase
            .from(TESTIMONIOS_TABLE)
            .insert([{
                ...row,
                created_at: new Date().toISOString()
            }]);

        if (error) {
            throw error;
        }

        return normalizeTestimonial(row);
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
        ensureSeededDefaults
    };
})();
