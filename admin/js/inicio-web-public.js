(function () {
    "use strict";

    const TABLE_NAME = "inicio_web_styles";
    const TEXT_TABLE_NAME = "inicio_web_config";

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
        }
    };

    const DEFAULT_TEXTS = {
        hero_eyebrow: "ARTE EN MOVIMIENTO",
        hero_titulo: "Transforma tus Ideas en Arte Visual.",
        hero_boton: "Reserva tu Sesión",

        banner1_tag: "VIVE NUESTRA EXPERIENCIA",
        banner1_titulo: "Narrativa Visual a Medida",
        banner1_descripcion:
            "Creamos tus recuerdos más preciados en diversos géneros con un compromiso de experiencia y precisión.",

        banner2_tag: "VIVE NUESTRA EXPERIENCIA",
        banner2_titulo:
            "Cada detalle cuenta cuando se trata de llevar un evento al siguiente nivel.",
        banner2_descripcion:
            "Next Level Producciones transforma tus ideas en arte visual. Desde videos impactantes hasta fotografías memorables y transmisiones en vivo, capturamos lo extraordinario en cada momento. ¡Imagina, nosotros lo hacemos realidad!",

        galeria_titulo: "Galería"
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

    function normalizeStyle(elemento, row = {}) {

        const defaults =
            DEFAULT_STYLES[elemento] ||
            DEFAULT_STYLES.banner1_titulo;

        return {
            elemento,

            fuente:
                typeof row.fuente === "string" &&
                row.fuente.trim()
                    ? row.fuente
                    : defaults.fuente,

            peso:
                Number.isFinite(Number(row.peso))
                    ? Number(row.peso)
                    : defaults.peso,

            tamano:
                Number.isFinite(Number(row.tamano))
                    ? Number(row.tamano)
                    : defaults.tamano,

            estilo:
                row.estilo === "italic"
                    ? "italic"
                    : defaults.estilo,

            alineacion:
                [
                    "left",
                    "center",
                    "right",
                    "justify"
                ].includes(row.alineacion)
                    ? row.alineacion
                    : defaults.alineacion,

            color:
                typeof row.color === "string" &&
                /^#[0-9a-fA-F]{6}$/.test(row.color)
                    ? row.color
                    : defaults.color,

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
                Number.isFinite(Number(row.line_height))
                    ? Number(row.line_height)
                    : defaults.line_height,

            letter_spacing:
                Number.isFinite(Number(row.letter_spacing))
                    ? Number(row.letter_spacing)
                    : defaults.letter_spacing
        };
    }

    async function getStyle(elemento) {

        if (!DEFAULT_STYLES[elemento]) {
            throw new Error(
                `Elemento de Inicio Web no válido: ${elemento}`
            );
        }

        const supabase =
            getSupabaseClient();

        const { data, error } =
            await supabase
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
    async function getText(elemento) {
        if (!Object.prototype.hasOwnProperty.call(DEFAULT_TEXTS, elemento)) {
            throw new Error(
                `Elemento de texto de Inicio Web no válido: ${elemento}`
            );
        }

        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TEXT_TABLE_NAME)
            .select("*")
            .maybeSingle();

        if (error) {
            throw error;
        }

        const valor = data && typeof data[elemento] === "string"
            ? data[elemento].trim()
            : "";

        return {
            elemento,
            contenido: valor || DEFAULT_TEXTS[elemento]
        };
    }

    async function loadInicioWebTexts() {
        const elements = document.querySelectorAll("[data-inicio-web-elemento]");

        if (!elements.length) {
            return;
        }

        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TEXT_TABLE_NAME)
            .select("*")
            .maybeSingle();

        if (error) {
            console.error("Error al cargar textos de Inicio Web:", error);
            return;
        }

        const config = data || {};

        for (const element of elements) {
            const elemento = element.dataset.inicioWebElemento;

            if (!elemento) {
                continue;
            }

            const valor = config[elemento];
            const texto =
                typeof valor === "string" && valor.trim()
                    ? valor.trim()
                    : DEFAULT_TEXTS[elemento] || element.textContent || "";

            element.textContent = texto;
        }
    }

    document.addEventListener(
        "DOMContentLoaded",
        () => {
            loadInicioWebTexts();
        }
    );

    window.InicioWebPublicService = {
        getStyle,
        getText
    };
})();