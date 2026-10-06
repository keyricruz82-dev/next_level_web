window.QuienesSomosPublic = (function createQuienesSomosPublic() {
    "use strict";

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

    function getValue(configMap, key) {
        const candidate = configMap && configMap[key];
        return typeof candidate === "string" && candidate.trim().length > 0
            ? candidate
            : DEFAULT_CONFIG[key] || "";
    }

    function applyTextContent(configMap) {
        document.querySelectorAll("[data-quienes-key]").forEach((element) => {
            const key = element.dataset.quienesKey;
            if (!key) {
                return;
            }

            const value = getValue(configMap, key);
            if (!value) {
                return;
            }

            element.textContent = value;
        });
    }

    function applyVideoSources(configMap) {
        document.querySelectorAll("[data-quienes-video]").forEach((videoElement) => {
            const position = Number(videoElement.dataset.quienesVideo || 0);
            const key = `about_video_${position}`;
            const value = getValue(configMap, key);

            if (!value || !videoElement || !(videoElement.tagName === "VIDEO")) {
                return;
            }

            const sourceElement = videoElement.querySelector("source") || document.createElement("source");
            sourceElement.src = value;
            sourceElement.type = "video/mp4";
            if (!videoElement.querySelector("source")) {
                videoElement.appendChild(sourceElement);
            }
            videoElement.load();
        });
    }

    function applyTestimonials(entries = []) {
        const byPosition = new Map();

        (entries || []).forEach((item) => {
            const position = Number(item && item.position || 0);
            if (!Number.isInteger(position) || position < 1 || position > 3) {
                return;
            }
            byPosition.set(position, item);
        });

        [1, 2, 3].forEach((position) => {
            const row = document.querySelector(`[data-quienes-testimonio="${position}"]`);
            const item = byPosition.get(position) || null;

            if (!row || !item) {
                return;
            }

            const imageTarget = row.querySelector("[data-quienes-field='image_url']") || row.querySelector("img");
            const tituloTarget = row.querySelector("[data-quienes-field='titulo']");
            const nombreTarget = row.querySelector("[data-quienes-field='nombre_ubicacion']");
            const textoTarget = row.querySelector("[data-quienes-field='texto']");

            if (imageTarget && typeof item.image_url === "string" && item.image_url.trim()) {
                if (imageTarget.tagName === "IMG") {
                    imageTarget.src = item.image_url;
                    if (imageTarget.alt) {
                        imageTarget.alt = item.titulo || imageTarget.alt;
                    }
                }
            }

            if (tituloTarget && typeof item.titulo === "string" && item.titulo.trim()) {
                tituloTarget.textContent = item.titulo;
            }

            if (nombreTarget && typeof item.nombre_ubicacion === "string" && item.nombre_ubicacion.trim()) {
                nombreTarget.textContent = item.nombre_ubicacion;
            }

            if (textoTarget && typeof item.texto === "string" && item.texto.trim()) {
                textoTarget.textContent = item.texto;
            }
        });
    }

    async function init() {
        if (!window.QuienesSomosService) {
            return;
        }

        try {
            const configMap = await window.QuienesSomosService.listConfig();
            const testimonials = await window.QuienesSomosService.listTestimonials(false);
            applyTextContent(configMap);
            applyVideoSources(configMap);
            applyTestimonials(testimonials);
        } catch (error) {
            console.warn("QuienesSomosPublic: No se pudo cargar el contenido CMS, se mantiene el fallback visual.", error);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    return {
        init,
        applyTextContent,
        applyVideoSources,
        applyTestimonials
    };
})();
