window.SiteConfigService = (function createSiteConfigService() {
    const tableName = (window.APP_CONFIG.TABLES && window.APP_CONFIG.TABLES.SITE_CONFIG)
        || "site_config";
    const bucketName = (window.APP_CONFIG.STORAGE && window.APP_CONFIG.STORAGE.PUBLICACIONES_BUCKET)
        || "publicaciones";

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

    function normalizeRows(rows) {
        const result = { ...defaults };
        (rows || []).forEach((row) => {
            if (row && row.key) {
                result[row.key] = row.value == null ? "" : String(row.value);
            }
        });
        return result;
    }

    function getDefaults() {
        return { ...defaults };
    }

    async function getConfig() {
        const { data, error } = await window.supabaseClient
            .from(tableName)
            .select("key, value")
            .order("key", { ascending: true });

        if (error) {
            throw error;
        }

        return normalizeRows(data);
    }

    async function saveConfig(values) {
        const rows = Object.entries(values || {})
            .filter(([key]) => Object.prototype.hasOwnProperty.call(defaults, key))
            .map(([key, value]) => ({
                key,
                value: value == null ? "" : String(value),
                updated_at: new Date().toISOString()
            }));

        if (!rows.length) {
            return getConfig();
        }

        const { error } = await window.supabaseClient
            .from(tableName)
            .upsert(rows, { onConflict: "key" });

        if (error) {
            throw error;
        }

        return getConfig();
    }

    async function uploadLogo(file) {
        if (!file || !(file instanceof File)) {
            throw new Error("Debes seleccionar una imagen válida.");
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            throw new Error("El logo debe ser JPG, PNG o WebP.");
        }

        if (file.size > 5 * 1024 * 1024) {
            throw new Error("El logo no puede superar los 5 MB.");
        }

        const extension = (file.name.split(".").pop() || "jpg").toLowerCase();
        const path = `site/logo/logo-${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await window.supabaseClient
            .storage
            .from(bucketName)
            .upload(path, file, { cacheControl: "3600", upsert: false });

        if (uploadError) {
            throw uploadError;
        }

        const { data } = window.supabaseClient.storage.from(bucketName).getPublicUrl(path);
        if (!data || !data.publicUrl) {
            throw new Error("Supabase no devolvió la URL pública del logo.");
        }

        return data.publicUrl;
    }

    return {
        getConfig,
        getDefaults,
        saveConfig,
        uploadLogo
    };
})();
