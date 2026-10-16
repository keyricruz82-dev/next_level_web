(function () {
    "use strict";

    const defaults = {
        site_name: "Next Level Producciones",
        social_instagram: "https://www.instagram.com/nextlevelproducciones_?igsh=bDBrcGkyNmp5aXZk",
        social_tiktok: "https://www.tiktok.com/@nextlevelproducciones?_r=1&_t=ZS-95vGeT53f7P",
        social_youtube: "https://www.youtube.com/@NextLevelProducciones",
        social_facebook: "https://www.facebook.com/share/1CRGc8frAp/?mibextid=wwXIfr",
        contact_email: "info@nextlevelproducciones.net",
        contact_whatsapp: "50377251450",
        site_logo_url: "images/next.jpeg"
    };

    function normalizeWhatsapp(value) {
        return String(value || "").replace(/\D/g, "");
    }

    function applyConfig(config) {
        const siteName = String(config.site_name || "").trim() || defaults.site_name;
        document.querySelectorAll("header .site-title, [data-site-name]").forEach((element) => {
            element.textContent = siteName;
        });

        const socialLinks = {
            instagram: config.social_instagram,
            tiktok: config.social_tiktok,
            youtube: config.social_youtube,
            facebook: config.social_facebook
        };

        document.querySelectorAll("[data-site-social], .footer-social a[aria-label]").forEach((link) => {
            const socialKey = link.dataset.siteSocial || String(link.getAttribute("aria-label") || "").toLowerCase();
            const url = socialLinks[socialKey] || "";
            link.href = url || "#";
            link.hidden = !url;
            link.setAttribute("aria-hidden", url ? "false" : "true");
        });

        const email = config.contact_email || "";
        document.querySelectorAll("[data-site-email], .footer-contact a[href^='mailto:']").forEach((link) => {
            link.textContent = email;
            link.href = email ? `mailto:${email}` : "#";
            link.hidden = !email;
        });

        const whatsapp = normalizeWhatsapp(config.contact_whatsapp);
        document.querySelectorAll("[data-site-whatsapp], a.whatsapp-btn").forEach((link) => {
            const currentUrl = new URL(link.href || window.location.href, window.location.href);
            const message = currentUrl.searchParams.get("text");
            link.href = whatsapp
                ? `https://wa.me/${whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ""}`
                : "#";
            link.hidden = !whatsapp;
        });

        const logoUrl = config.site_logo_url || defaults.site_logo_url;
        document.querySelectorAll("[data-site-logo], img[alt*='Logo Next Level Producciones']").forEach((image) => {
            image.src = logoUrl;
        });

        document.querySelectorAll("link[href$='images/next.jpeg'], meta[content$='images/next.jpeg']").forEach((element) => {
            if (element.hasAttribute("href")) {
                element.href = logoUrl;
            } else {
                element.content = logoUrl;
            }
        });

    }

    async function load() {
        const config = { ...defaults };
        try {
            if (!window.supabaseClient && window.supabase && window.APP_CONFIG) {
                window.supabaseClient = window.supabase.createClient(
                    window.APP_CONFIG.SUPABASE_URL,
                    window.APP_CONFIG.SUPABASE_ANON_KEY
                );
            }

            if (window.supabaseClient) {
                const { data, error } = await window.supabaseClient
                    .from("site_config")
                    .select("key, value");
                if (error) {
                    throw error;
                }
                (data || []).forEach((row) => {
                    if (row && Object.prototype.hasOwnProperty.call(config, row.key)) {
                        config[row.key] = row.value == null ? "" : String(row.value);
                    }
                });
            }
        } catch (error) {
            console.warn("No se pudo cargar la configuración del sitio; se conservan los valores predeterminados.", error);
        }

        applyConfig(config);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", load, { once: true });
    } else {
        load();
    }
})();
