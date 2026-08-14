if (!window.APP_CONFIG) {
    throw new Error("APP_CONFIG no esta definido. Revisa admin/js/config.js.");
}

if (!window.supabase || !window.supabase.createClient) {
    throw new Error("SDK de Supabase no disponible. Revisa el script CDN en admin/index.html.");
}

// Shared Supabase client for all admin modules.
window.supabaseClient = window.supabase.createClient(
    window.APP_CONFIG.SUPABASE_URL,
    window.APP_CONFIG.SUPABASE_ANON_KEY
);