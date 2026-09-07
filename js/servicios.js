(function () {
    const FALLBACK_IMAGE = "images/next.jpeg";
    const DEFAULT_CURATED_IMAGES = [
        { position: 1, image_url: "images/servi.png" },
        { position: 2, image_url: "images/cap.jpeg" },
        { position: 3, image_url: "images/rec.jpeg" },
        { position: 4, image_url: "images/don.jpeg" }
    ];
    const DEFAULT_PROMO_BANNER_IMAGE = { position: 1, image_url: "images/servi.png" };
    const DEFAULT_PROMO_BANNER_IMAGES = [DEFAULT_PROMO_BANNER_IMAGE];
    const DEFAULT_SERVICES = [
        {
            id: "default-1",
            titulo: "Producción audiovisual profesional",
            descripcion: "Creación completa de contenidos audiovisuales de alta calidad, desde la conceptualización hasta la entrega final, con estándares profesionales.",
            imagen_url: "images/eve1.png",
            texto_badge: "Evento",
            texto_meta: "Haga su reserva",
            estilos_texto: {},
            estado: "publicado",
            orden: 1
        },
        {
            id: "default-2",
            titulo: "Grabación y Edición de Video",
            descripcion: "Captura de video con equipo avanzado y posterior edición creativa, para obtener resultados impactantes.",
            imagen_url: "images/eve2.png",
            texto_badge: "Evento",
            texto_meta: "Haga su reserva",
            estilos_texto: {},
            estado: "publicado",
            orden: 2
        },
        {
            id: "default-3",
            titulo: "Fotografía para Eventos Sociales y Corporativos",
            descripcion: "Cobertura fotográfica artística y técnica de bodas, quinceaños, reuniones empresariales, conferencias y todo tipo de eventos sociales o corporativos.",
            imagen_url: "images/eve3.png",
            texto_badge: "Evento",
            texto_meta: "Haga su reserva",
            estilos_texto: {},
            estado: "publicado",
            orden: 3
        },
        {
            id: "default-4",
            titulo: "Transmisiones en vivo (streaming)",
            descripcion: "Emisiones en directo profesionales para plataformas como YouTube, Instagram, Facebook o sitios web, con multicámara y alta calidad.",
            imagen_url: "images/eve4.png",
            texto_badge: "Evento",
            texto_meta: "Haga su reserva",
            estilos_texto: {},
            estado: "publicado",
            orden: 4
        },
        {
            id: "default-5",
            titulo: "Cobertura de eventos especiales",
            descripcion: "Registro completo y artístico de momentos únicos.",
            imagen_url: "images/eve5.png",
            texto_badge: "Evento",
            texto_meta: "Haga su reserva",
            estilos_texto: {},
            estado: "publicado",
            orden: 5
        },
        {
            id: "default-6",
            titulo: "Servicio de drone y tomas aéreas",
            descripcion: "Imágenes y videos aéreos espectaculares con drones, ideales para dar una perspectiva única a eventos, propiedades o producciones.",
            imagen_url: "images/eve6.png",
            texto_badge: "Evento",
            texto_meta: "Haga su reserva",
            estilos_texto: {},
            estado: "publicado",
            orden: 6
        },
        {
            id: "default-7",
            titulo: "Producción de promociones comerciales",
            descripcion: "Creación de videos publicitarios y spots promocionales atractivos para marcas, productos o servicios.",
            imagen_url: "images/eve7.png",
            texto_badge: "Evento",
            texto_meta: "Haga su reserva",
            estilos_texto: {},
            estado: "publicado",
            orden: 7
        },
        {
            id: "default-8",
            titulo: "Cobertura de conciertos y eventos masivos",
            descripcion: "Registro audiovisual dinámico y de gran escala de conciertos, festivales y eventos con gran afluencia de público.",
            imagen_url: "images/eve8.png",
            texto_badge: "Evento",
            texto_meta: "Haga su reserva",
            estilos_texto: {},
            estado: "publicado",
            orden: 8
        },
        {
            id: "default-9",
            titulo: "Producción de contenido para redes sociales",
            descripcion: "Creación de videos cortos, Reels, Stories y fotos optimizadas para Instagram, TikTok, LinkedIn y otras plataformas.",
            imagen_url: "images/eve9.png",
            texto_badge: "Evento",
            texto_meta: "Haga su reserva",
            estilos_texto: {},
            estado: "publicado",
            orden: 9
        },
        {
            id: "default-10",
            titulo: "Servicio de sonido para eventos",
            descripcion: "Sistema de audio profesional, micrófonos, mezcla y refuerzo sonoro para garantizar una excelente calidad de audio en todo tipo de eventos.",
            imagen_url: "images/eve10.png",
            texto_badge: "Evento",
            texto_meta: "Haga su reserva",
            estilos_texto: {},
            estado: "publicado",
            orden: 10
        },
        {
            id: "default-11",
            titulo: "Diseño de contenido visual y publicitario",
            descripcion: "Diseño gráfico y creación de piezas visuales (portadas, banners, animaciones, piezas para campañas) alineadas con la identidad de marca.",
            imagen_url: "images/eve11.png",
            texto_badge: "Evento",
            texto_meta: "Haga su reserva",
            estilos_texto: {},
            estado: "publicado",
            orden: 11
        },
        {
            id: "default-12",
            titulo: "Producción de videos institucionales",
            descripcion: "Videos corporativos que transmiten la misión, valores, instalaciones o logros de una empresa de forma profesional y emotiva.",
            imagen_url: "images/eve12.png",
            texto_badge: "Evento",
            texto_meta: "Haga su reserva",
            estilos_texto: {},
            estado: "publicado",
            orden: 12
        },
        {
            id: "default-13",
            titulo: "Cobertura de inauguraciones y eventos empresariales",
            descripcion: "Registro audiovisual completo de aperturas, lanzamientos de productos, galas corporativas y eventos de networking.",
            imagen_url: "images/eve13.png",
            texto_badge: "Evento",
            texto_meta: "Haga su reserva",
            estilos_texto: {},
            estado: "publicado",
            orden: 13
        },
        {
            id: "default-14",
            titulo: "Alquiler y uso de equipo audiovisual para producción",
            descripcion: "Renta de equipo profesional (cámaras, luces, lentes, audio, drones, etc.) y soporte técnico para producciones propias o de terceros.",
            imagen_url: "images/eve14.png",
            texto_badge: "Evento",
            texto_meta: "Haga su reserva",
            estilos_texto: {},
            estado: "publicado",
            orden: 14
        }
    ];

    function normalizeText(value) {
        return String(value ?? "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function getSupabaseConfig() {
        const config = window.APP_CONFIG || {};

        return {
            url: config.SUPABASE_URL || "https://trkbeldutzrmombqrkye.supabase.co",
            anonKey: config.SUPABASE_ANON_KEY || "sb_publishable_s7mXrjP9hjcfOHRLPADPhw_n1TAI_Tt"
        };
    }

    function initImageOnlyStyles() {
        if (document.getElementById("service-image-only-styles")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "service-image-only-styles";

        style.textContent = `
            .service-image-only {
                padding: 0;
                border: none;
                background: transparent;
                box-shadow: none;
                overflow: visible;
                max-width: 360px;
            }

            .service-image-only::before {
                display: none;
            }

            .service-image-only .card-image {
                border-radius: 24px;
                overflow: hidden;
                margin-bottom: 0;
            }

            .service-image-only .card-image img {
                height: auto;
                min-height: 240px;
                object-fit: cover;
            }

            .service-image-only .card-overlay,
            .service-image-only h3,
            .service-image-only p {
                display: none !important;
            }
        `;

        document.head.appendChild(style);
    }

    function normalizeStyleConfig(styleConfig) {
        if (!styleConfig || typeof styleConfig !== "object") {
            return {};
        }

        return styleConfig;
    }

    function applyStyleToElement(element, config) {
        if (!element || !config || typeof config !== "object") {
            return;
        }

        const alignmentMap = {
            left: "left",
            center: "center",
            right: "right"
        };

        const sizeMap = {
            small: "0.9rem",
            medium: "1rem",
            large: "1.3rem"
        };

        const weightMap = {
            normal: "400",
            semibold: "600",
            bold: "700"
        };

        const fontStyleMap = {
            normal: "normal",
            italic: "italic"
        };

        const alignment = alignmentMap[config.alineacion];
        const size = sizeMap[config.tamano];
        const weight = weightMap[config.peso];
        const fontStyle = fontStyleMap[config.estilo];
        const color = normalizeText(config.color);

        if (alignment) {
            element.style.textAlign = alignment;
        }

        if (size) {
            element.style.fontSize = size;
        }

        if (weight) {
            element.style.fontWeight = weight;
        }

        if (fontStyle) {
            element.style.fontStyle = fontStyle;
        }

        if (color) {
            element.style.color = color;
        }
    }

    function clearInlineTextStyles(element) {
        if (!element) {
            return;
        }

        element.style.removeProperty("text-align");
        element.style.removeProperty("font-size");
        element.style.removeProperty("font-weight");
        element.style.removeProperty("font-style");
        element.style.removeProperty("color");
    }

    function applyCardContent(card, service) {
        if (!card || !service) {
            return;
        }

        const titleEl = card.querySelector("h3");
        const descriptionEl = card.querySelector("p");
        const imageEl = card.querySelector(".card-image img");
        const overlayEl = card.querySelector(".card-overlay");

        const badgeEl = overlayEl
            ? overlayEl.querySelector("span")
            : null;

        const metaEl = overlayEl
            ? overlayEl.querySelector(".overlay-meta")
            : null;

        const title = normalizeText(service.titulo);
        const description = normalizeText(service.descripcion);
        const badge = normalizeText(service.texto_badge);
        const meta = normalizeText(service.texto_meta);
        const image = normalizeText(service.imagen_url);

        const styles = normalizeStyleConfig(service.estilos_texto);

        const titleStyles = normalizeStyleConfig(styles.titulo);
        const descriptionStyles = normalizeStyleConfig(styles.descripcion);

        /*
         * IMAGEN
         */
        if (imageEl) {
            if (image) {
                imageEl.src = image;
            } else {
                imageEl.src = FALLBACK_IMAGE;
            }

            imageEl.alt = title || "Servicio de Next Level Producciones";

            imageEl.onerror = function () {
                if (!imageEl.src.includes(FALLBACK_IMAGE)) {
                    imageEl.src = FALLBACK_IMAGE;
                }
            };
        }

        /*
         * TITULO
         */
        if (titleEl) {
            clearInlineTextStyles(titleEl);

            if (title) {
                titleEl.textContent = title;
                titleEl.style.display = "";
                applyStyleToElement(titleEl, titleStyles);
            } else {
                titleEl.textContent = "";
                titleEl.style.display = "none";
            }
        }

        /*
         * DESCRIPCION
         */
        if (descriptionEl) {
            clearInlineTextStyles(descriptionEl);

            if (description) {
                descriptionEl.textContent = description;
                descriptionEl.style.display = "";
                applyStyleToElement(
                    descriptionEl,
                    descriptionStyles
                );
            } else {
                descriptionEl.textContent = "";
                descriptionEl.style.display = "none";
            }
        }

        /*
         * BADGE
         */
        if (badgeEl) {
            if (badge) {
                badgeEl.textContent = badge;
                badgeEl.style.display = "";
            } else {
                badgeEl.textContent = "";
                badgeEl.style.display = "none";
            }
        }

        /*
         * TEXTO META
         */
        if (metaEl) {
            if (meta) {
                metaEl.textContent = meta;
                metaEl.style.display = "";
            } else {
                metaEl.textContent = "";
                metaEl.style.display = "none";
            }
        }

        /*
         * OVERLAY
         */
        if (overlayEl) {
            const hasOverlayContent =
                Boolean(title) ||
                Boolean(badge) ||
                Boolean(meta);

            overlayEl.style.display =
                hasOverlayContent ? "" : "none";
        }

        /*
         * MODO SOLO IMAGEN
         */
        const hasAnyText =
            Boolean(title) ||
            Boolean(description) ||
            Boolean(badge) ||
            Boolean(meta);

        const hasImage =
            Boolean(image && imageEl);

        card.classList.toggle(
            "service-image-only",
            !hasAnyText && hasImage
        );
    }

    function buildCardMarkup(service) {
        const id = String(service?.id ?? "");
        const title = normalizeText(service?.titulo || "");
        const description = normalizeText(service?.descripcion || "");
        const badge = normalizeText(service?.texto_badge || "");
        const meta = normalizeText(service?.texto_meta || "");
        const image = normalizeText(service?.imagen_url || "") || FALLBACK_IMAGE;

        return `
            <div class="card reveal active" data-service-id="${id}" data-supabase-id="${id}">
                <div class="card-image">
                    <img src="${image}" alt="${title || "Servicio de Next Level Producciones"}">
                    <div class="card-overlay">
                        <span>${badge || "Evento"}</span>
                        <h4>${title || "Servicio"}</h4>
                        <div class="overlay-meta">${meta || "Haga su reserva"}</div>
                    </div>
                </div>
                <h3>${title || "Servicio"}</h3>
                <p>${description || ""}</p>
            </div>
        `;
    }

    function getSiteMediaPattern(section, count) {
        if (section === "curated_grid") {
            if (count === 1) return ["large"];
            if (count === 2) return ["large", "medium"];
            if (count === 3) return ["large", "medium", "medium"];
            return ["large", "medium", "medium", "wide"];
        }

        if (count === 1) return ["single"];
        if (count === 2) return ["half", "half"];
        if (count === 3) return ["third", "third", "third"];
        return ["quarter", "quarter", "quarter", "quarter"];
    }

    function getDefaultSectionEntries(container, selector) {
        if (!container) {
            return [];
        }

        return Array.from(container.querySelectorAll(selector)).map((element, index) => {
            const image = element.querySelector("img");
            const sizeClass = Array.from(element.classList).find((className) =>
                ["large", "medium", "wide", "single", "half", "third", "quarter"].includes(className)
            ) || "";

            return {
                position: index + 1,
                element,
                imageUrl: image ? image.getAttribute("src") : "",
                sizeClass
            };
        });
    }

    function buildCuratedGridEmptyState() {
        return `
            <div class="gallery-empty-state" aria-live="polite">
                No hay imágenes seleccionadas para esta galería.
            </div>
        `;
    }

    function normalizeCuratedGridImages(images) {
        const customEntries = Array.isArray(images)
            ? [...images]
                .filter(Boolean)
                .filter((entry) => typeof entry?.image_url === "string" && entry.image_url.trim())
                .map((entry) => ({
                    ...entry,
                    position: Number(entry?.position ?? 1),
                    image_url: String(entry.image_url).trim()
                }))
                .filter((entry) => Number.isInteger(entry.position) && entry.position >= 1 && entry.position <= 4)
                .sort((a, b) => Number(a.position || 1) - Number(b.position || 1))
            : [];

        const byPosition = new Map();
        customEntries.forEach((entry) => {
            if (!byPosition.has(entry.position)) {
                byPosition.set(entry.position, entry);
            }
        });

        const resolvedItems = Array.from({ length: 4 }, (_, index) => {
            const position = index + 1;
            if (byPosition.has(position)) {
                return byPosition.get(position);
            }

            const fallback = DEFAULT_CURATED_IMAGES.find((entry) => Number(entry.position) === position);
            return fallback ? { ...fallback, image_url: String(fallback.image_url || "").trim() } : null;
        }).filter(Boolean);

        return resolvedItems.length ? resolvedItems : [...DEFAULT_CURATED_IMAGES].slice(0, 4);
    }

    function buildCuratedGridMarkup(images) {
        const resolvedItems = normalizeCuratedGridImages(images);
        const pattern = getSiteMediaPattern("curated_grid", resolvedItems.length);

        return resolvedItems.map((image, index) => {
            const sizeClass = pattern[index] || "medium";
            const imageUrl = image?.image_url || "";
            return `
                <div class="work-item ${sizeClass}">
                    <img src="${imageUrl}" alt="Imagen de la galería" loading="lazy">
                </div>
            `;
        }).join("");
    }

    function buildPromoBannerMarkup(images) {
        const customEntries = Array.isArray(images)
            ? [...images]
                .filter(Boolean)
                .filter((entry) => typeof entry?.image_url === "string" && entry.image_url.trim())
                .sort((a, b) => Number(a.position || 1) - Number(b.position || 1))
                .slice(0, 4)
            : [];

        const bannerItems = customEntries.length ? customEntries : [{ position: 1, image_url: DEFAULT_PROMO_BANNER_IMAGE.image_url || "" }];
        const count = Math.min(bannerItems.length, 4);

        return `
            <div class="promo-banner-grid" data-count="${count}" aria-label="Galería promocional">
                ${bannerItems.map((image, index) => `
                    <div class="promo-banner-slot" data-position="${Number(image.position || index + 1)}">
                        <img src="${image.image_url}" alt="Banner promocional" loading="lazy">
                    </div>
                `).join("")}
            </div>
        `;
    }

    function applyCustomMediaOverrides(container, selector, customItems, sectionName) {
        if (!container) {
            return;
        }

        if (sectionName === "promo_banner") {
            container.innerHTML = buildPromoBannerMarkup(customItems);
            return;
        }

        container.innerHTML = buildCuratedGridMarkup(customItems.length ? customItems : DEFAULT_CURATED_IMAGES);
    }

    async function loadSiteMedia(section) {
        if (!window.supabase || typeof window.supabase.createClient !== "function") {
            console.warn("Supabase no está disponible para cargar imágenes del sitio.");
            return [];
        }

        try {
            const { url, anonKey } = getSupabaseConfig();
            const supabase = window.supabase.createClient(url, anonKey);
            const { data, error } = await supabase
                .from("site_media")
                .select("id, section, position, image_url, storage_path, created_at, updated_at")
                .eq("section", section)
                .order("position", { ascending: true });

            if (error) {
                throw error;
            }

            return Array.isArray(data) ? data.filter(Boolean) : [];
        } catch (error) {
            console.error(`Error cargando imágenes de ${section}:`, error);
            return [];
        }
    }

    async function renderSiteMediaSections() {
        const curatedGrid = document.getElementById("curatedGridContainer");
        const promoBanner = document.getElementById("promoBannerContainer");

        if (!curatedGrid && !promoBanner) {
            return;
        }

        const [curatedImages, promoImages] = await Promise.all([
            loadSiteMedia("curated_grid"),
            loadSiteMedia("promo_banner")
        ]);

        if (curatedGrid) {
            const resolvedCuratedImages = curatedImages.length ? curatedImages : DEFAULT_CURATED_IMAGES;
            curatedGrid.innerHTML = buildCuratedGridMarkup(resolvedCuratedImages);
            curatedGrid.dataset.count = String(curatedGrid.querySelectorAll(".work-item").length || 0);
        }

        if (promoBanner) {
            promoBanner.innerHTML = buildPromoBannerMarkup(promoImages);
            promoBanner.dataset.count = String(promoBanner.querySelectorAll(".promo-banner-slot").length || 1);
            promoBanner.classList.add("reveal", "active");
        }
    }
    
    function mergeDefaultServicesWithOverrides(defaultServices, customServices) {
    const normalizedDefaults = (
        Array.isArray(defaultServices)
            ? defaultServices
            : []
    ).map((service) => ({
        ...service,
        id: service.id || `default-${service.orden}`,
        orden: Number(service?.orden ?? 0),
        estado: String(service?.estado || "publicado")
    }));

    const normalizedCustom = (
        Array.isArray(customServices)
            ? customServices
            : []
    )
        .filter(Boolean)
        .map((service) => ({
            ...service,
            id: String(service.id || ""),
            titulo: normalizeText(service.titulo),
            descripcion: normalizeText(service.descripcion),
            imagen_url: normalizeText(service.imagen_url),
            texto_badge: normalizeText(service.texto_badge),
            texto_meta: normalizeText(service.texto_meta),
            estilos_texto:
                service.estilos_texto &&
                typeof service.estilos_texto === "object"
                    ? service.estilos_texto
                    : {},
            estado: String(service.estado || "publicado"),
            orden: Number(service?.orden ?? 0)
        }))
        .filter((service) =>
            service.id &&
            Number.isFinite(service.orden) &&
            service.orden > 0
        );

    /*
     * Los servicios predeterminados ocupan los órdenes 1-14.
     */
    const defaultOrders = new Set(
        normalizedDefaults.map((service) => Number(service.orden))
    );

    /*
     * Registros de Supabase con orden 1-14
     * modifican los servicios predeterminados.
     */
    const overridesByOrder = new Map();

    normalizedCustom.forEach((service) => {
        if (defaultOrders.has(service.orden)) {
            overridesByOrder.set(service.orden, service);
        }
    });

    /*
     * Aplicamos las modificaciones a los servicios
     * predeterminados.
     */
    const mergedDefaults = normalizedDefaults.map((defaultService) => {
        const order = Number(defaultService.orden);
        const override = overridesByOrder.get(order);

        if (!override) {
            return defaultService;
        }

        return {
            ...defaultService,
            ...override,

            /*
             * Conservamos el ID del servicio predeterminado.
             */
            id: defaultService.id,

            titulo:
                normalizeText(
                    override.titulo ||
                    defaultService.titulo
                ) || "Servicio",

            descripcion:
                normalizeText(
                    override.descripcion ||
                    defaultService.descripcion
                ),

            imagen_url:
                normalizeText(
                    override.imagen_url ||
                    defaultService.imagen_url
                ) || FALLBACK_IMAGE,

            texto_badge:
                normalizeText(
                    override.texto_badge ||
                    defaultService.texto_badge
                ) || "Evento",

            texto_meta:
                normalizeText(
                    override.texto_meta ||
                    defaultService.texto_meta
                ) || "Haga su reserva",

            estilos_texto:
                override.estilos_texto ||
                defaultService.estilos_texto ||
                {},

            estado:
                String(
                    override.estado ||
                    defaultService.estado ||
                    "publicado"
                ),

            orden: order
        };
    });

    /*
     * TODO servicio de Supabase cuyo orden NO pertenece
     * a los servicios predeterminados es un servicio NUEVO.
     *
     * Ejemplo:
     *
     * orden 15 → servicio nuevo
     * orden 16 → servicio nuevo
     * orden 17 → servicio nuevo
     */
    const newCustomServices = normalizedCustom
        .filter((service) => !defaultOrders.has(service.orden))
        .map((service) => ({
            ...service,

            id: String(service.id),

            titulo:
                normalizeText(service.titulo) ||
                "Servicio",

            descripcion:
                normalizeText(service.descripcion),

            imagen_url:
                normalizeText(service.imagen_url) ||
                FALLBACK_IMAGE,

            texto_badge:
                normalizeText(service.texto_badge) ||
                "Evento",

            texto_meta:
                normalizeText(service.texto_meta) ||
                "Haga su reserva",

            estilos_texto:
                service.estilos_texto || {},

            estado:
                String(service.estado || "publicado"),

            orden:
                Number(service.orden)
        }));

    /*
     * IMPORTANTE:
     * Devolvemos TODOS los servicios:
     *
     * Predeterminados: 1-14
     * Nuevos:          15+
     */
    return [
        ...mergedDefaults,
        ...newCustomServices
    ];
}
 
    async function loadPublishedServices() {
        const defaults = DEFAULT_SERVICES.map((service) => ({
            ...service,
            id: service.id || `default-${service.orden}`,
            orden: Number(service.orden || 0),
            estado: "publicado"
        }));

        if (
            !window.supabase ||
            typeof window.supabase.createClient !== "function"
        ) {
            return defaults;
        }

        try {
            const { url, anonKey } =
                getSupabaseConfig();

            const supabase =
                window.supabase.createClient(
                    url,
                    anonKey
                );

            const { data, error } =
                await supabase
                    .from("productos")
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
                    .eq("estado", "publicado")
                    .order("orden", {
                        ascending: true
                    })
                    .order("created_at", {
                        ascending: true
                    });
                    console.log("SERVICIOS DESDE SUPABASE:", data);
                    console.log("TOTAL SERVICIOS DESDE SUPABASE:", Array.isArray(data) ? data.length : 0);
                    console.table(
                        (data || []).map(service => ({
                            id: service.id,
                            titulo: service.titulo,
                            orden: service.orden,
                            estado: service.estado
                        }))
                    );

            if (error) {
                throw error;
            }

            const customServices = Array.isArray(data) ? data.filter(Boolean) : [];
            
            return mergeDefaultServicesWithOverrides(defaults, customServices);

        } catch (error) {
            console.error(
                "Error cargando servicios publicados desde Supabase:",
                error
            );

            return defaults;
        }
    }

    function syncServiceCards(container, orderedServices) {
        if (!container) {
            return;
        }

        const existingCards = new Map(
            Array.from(container.querySelectorAll(".card[data-service-id]"))
                .map((card) => [String(card.dataset.serviceId), card])
        );

        const nextIds = new Set(
            orderedServices.map((service) => String(service?.id ?? ""))
                .filter(Boolean)
        );

        Array.from(container.querySelectorAll(".card[data-service-id]")).forEach((card) => {
            const serviceId = String(card.dataset.serviceId || "");
            if (!nextIds.has(serviceId)) {
                card.remove();
            }
        });

        orderedServices.forEach((service) => {
            const serviceId = String(service?.id ?? "");
            if (!serviceId) {
                return;
            }

            const existingCard = existingCards.get(serviceId);
            if (existingCard) {
                applyCardContent(existingCard, service);
                return;
            }

            const fragment = document.createRange().createContextualFragment(buildCardMarkup(service));
            container.appendChild(fragment);
        });

        container.querySelectorAll(".card[data-service-id]").forEach((card) => {
            if (!card.classList.contains("reveal")) {
                card.classList.add("reveal");
            }

            if (!card.classList.contains("active")) {
                card.classList.add("active");
            }
        });
    }

    async function renderPublishedServices() {
        const services = await loadPublishedServices();
        const container = document.querySelector(".servicios");

        if (!container) {
            return;
        }

        const orderedServices = [...services].sort((a, b) => {
            const orderA = Number(a?.orden ?? 0);
            const orderB = Number(b?.orden ?? 0);
            if (orderA !== orderB) {
                return orderA - orderB;
            }
            return String(a?.id ?? "").localeCompare(String(b?.id ?? ""));
        });

        if (!orderedServices.length) {
            container.innerHTML = "";
            console.info("No existen servicios publicados en Supabase.");
            return;
        }

        syncServiceCards(container, orderedServices);
    }

    function initializeReveal() {
        const cards =
            document.querySelectorAll(".card");

        cards.forEach(card => {
            if (!card.classList.contains("reveal")) {
                card.classList.add("reveal");
            }
        });

        if (
            typeof window.revealOnScroll ===
            "function"
        ) {
            window.revealOnScroll();
        }
    }

    async function hydrateServices() {
        initImageOnlyStyles();
        await renderPublishedServices();
        await renderSiteMediaSections();
        initializeReveal();
    }

    /*
     * Disponible globalmente para poder
     * volver a cargar los servicios manualmente.
     */
    window.loadServiciosPublicos =
        hydrateServices;

    /*
     * Inicialización.
     */
    if (
        document.readyState === "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            hydrateServices,
            { once: true }
        );
    } else {
        hydrateServices();
    }
})();