window.AuthService = (function createAuthService() {
    // Centralized auth guard used by the SPA.
    function ensureClient() {
        if (!window.supabaseClient) {
            throw new Error("Supabase no inicializado.");
        }
    }

    function isAuthorizedUser(user) {
        if (!user || !user.email) {
            return false;
        }

        // If ADMIN_EMAIL is empty, any valid authenticated user can enter.
        const adminEmail = (window.APP_CONFIG.ADMIN_EMAIL || "").trim().toLowerCase();
        if (!adminEmail) {
            return true;
        }

        return user.email.toLowerCase() === adminEmail;
    }

    async function signInWithPassword(email, password) {
        ensureClient();
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return { data: null, error };
        }

        if (!isAuthorizedUser(data.user)) {
            // Immediately invalidate non-authorized users.
            await window.supabaseClient.auth.signOut();
            return {
                data: null,
                error: { message: "Este usuario no tiene permisos para este panel." }
            };
        }

        return { data, error: null };
    }

    async function getSession() {
        ensureClient();
        const { data, error } = await window.supabaseClient.auth.getSession();
        if (error) {
            throw error;
        }
        return data.session;
    }

    async function signOut() {
        ensureClient();
        const { error } = await window.supabaseClient.auth.signOut();
        return { error: error || null };
    }

    function onAuthStateChange(callback) {
        ensureClient();
        return window.supabaseClient.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });
    }

    return {
        signInWithPassword,
        getSession,
        signOut,
        onAuthStateChange,
        isAuthorizedUser
    };
})();