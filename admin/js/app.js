window.AdminApp = (function createAdminApp() {
    const state = {
        currentUser: null,
        currentView: "dashboard",
        publicaciones: [],
        authSubscription: null
    };

    async function init() {
        UI.init();
        bindStaticEvents();

        if (state.authSubscription) {
            state.authSubscription.data.subscription.unsubscribe();
        }

        state.authSubscription = AuthService.onAuthStateChange((event, session) => {
            if (event === "SIGNED_OUT" || !session) {
                resetToLogin();
                return;
            }

            if (session.user && AuthService.isAuthorizedUser(session.user)) {
                startAdmin(session.user);
            }
        });

        await bootstrapSession();
    }

    async function bootstrapSession() {
        try {
            const session = await AuthService.getSession();
            if (session && session.user && AuthService.isAuthorizedUser(session.user)) {
                await startAdmin(session.user);
            } else {
                resetToLogin();
            }
        } catch (error) {
            console.error(error);
            resetToLogin();
            UI.showLoginMessage("No se pudo verificar la sesion actual.", "danger");
        }
    }

    function bindStaticEvents() {
        UI.refs.loginForm.addEventListener("submit", onLoginSubmit);
        document.getElementById("logoutTop").addEventListener("click", handleLogout);
        document.getElementById("logoutSidebar").addEventListener("click", handleLogout);
        document.getElementById("toggleSidebar").addEventListener("click", UI.toggleSidebar);

        document.querySelectorAll(".sidebar-link[data-view]").forEach((button) => {
            button.addEventListener("click", async () => {
                const targetView = button.dataset.view;
                await navigate(targetView);
            });
        });

        UI.refs.contentArea.addEventListener("click", onContentClick);
        UI.refs.publicationForm.addEventListener("submit", onPublicationFormSubmit);
    }

    async function onLoginSubmit(event) {
        event.preventDefault();
        UI.clearLoginMessage();

        const form = UI.refs.loginForm;
        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            return;
        }

        UI.setLoginLoading(true);

        try {
            const email = UI.refs.email.value.trim();
            const password = UI.refs.password.value;
            const { data, error } = await AuthService.signInWithPassword(email, password);

            if (error) {
                UI.showLoginMessage(error.message || "No se pudo iniciar sesion.", "danger");
                return;
            }

            await startAdmin(data.user);
            UI.showToast("Sesion iniciada correctamente.", "success");
        } catch (error) {
            console.error(error);
            UI.showLoginMessage("Ocurrio un error al iniciar sesion.", "danger");
        } finally {
            UI.setLoginLoading(false);
        }
    }

    async function startAdmin(user) {
        state.currentUser = user;
        UI.showAdmin(user);
        await navigate(state.currentView || "dashboard");
    }

    function resetToLogin() {
        state.currentUser = null;
        state.currentView = "dashboard";
        state.publicaciones = [];
        UI.refs.loginForm.reset();
        UI.clearLoginFormValidation();
        UI.clearLoginMessage();
        UI.showLogin();
    }

    async function handleLogout() {
        try {
            const { error } = await AuthService.signOut();
            if (error) {
                UI.showToast(error.message || "No se pudo cerrar la sesion.", "danger");
                return;
            }
            resetToLogin();
            UI.showToast("Sesion cerrada.", "success");
        } catch (error) {
            console.error(error);
            UI.showToast("Error inesperado al cerrar sesion.", "danger");
        }
    }

    async function navigate(view) {
        state.currentView = view;
        UI.setActiveNav(view);
        UI.closeSidebar();

        try {
            // This keeps the panel as a true SPA: same URL, dynamic content rendering.
            if (view === "dashboard") {
                const stats = await PublicacionesService.getStats();
                UI.renderDashboard(state.currentUser, stats);
                return;
            }

            if (view === "publicaciones") {
                state.publicaciones = await PublicacionesService.list();
                UI.renderPublicaciones(state.publicaciones);
                return;
            }

            UI.renderConfiguracion();
        } catch (error) {
            console.error(error);
            UI.showToast(`Error cargando ${view}: ${error.message}`, "danger");
        }
    }

    async function onContentClick(event) {
        const actionElement = event.target.closest("[data-action]");
        if (!actionElement) {
            return;
        }

        const action = actionElement.dataset.action;

        if (action === "new-publication") {
            UI.openPublicationModal("create", null);
            return;
        }

        const rowEl = actionElement.closest("tr[data-id]");
        if (!rowEl) {
            return;
        }

        const rowId = Number(rowEl.dataset.id);
        const row = state.publicaciones.find((item) => Number(item.id) === rowId);
        if (!row) {
            return;
        }

        if (action === "edit-publication") {
            UI.openPublicationModal("edit", row);
            return;
        }

        if (action === "toggle-estado") {
            await toggleEstado(row);
            return;
        }

        if (action === "delete-publication") {
            await deletePublicacion(row);
        }
    }

    async function onPublicationFormSubmit(event) {
        event.preventDefault();

        const form = UI.refs.publicationForm;
        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            return;
        }

        const formData = UI.getPublicationFormData();
        UI.setSaveLoading(true);

        try {
            if (formData.id) {
                await PublicacionesService.update(
                    formData.id,
                    formData.payload,
                    formData.imageFile,
                    formData.existingImageUrl
                );
                UI.showToast("Publicacion actualizada.", "success");
            } else {
                await PublicacionesService.create(formData.payload, formData.imageFile);
                UI.showToast("Publicacion creada.", "success");
            }

            UI.closePublicationModal();
            await navigate("publicaciones");
        } catch (error) {
            console.error(error);
            UI.showToast(error.message || "No se pudo guardar la publicacion.", "danger");
        } finally {
            UI.setSaveLoading(false);
        }
    }

    async function toggleEstado(row) {
        try {
            await PublicacionesService.toggleEstado(row.id, row.estado);
            UI.showToast("Estado actualizado.", "success");
            await navigate("publicaciones");
        } catch (error) {
            console.error(error);
            UI.showToast(error.message || "No se pudo cambiar el estado.", "danger");
        }
    }

    async function deletePublicacion(row) {
        const confirmed = window.confirm(`Deseas eliminar la publicacion \"${row.titulo}\"?`);
        if (!confirmed) {
            return;
        }

        try {
            await PublicacionesService.remove(row.id, row.imagen_principal);
            UI.showToast("Publicacion eliminada.", "success");
            await navigate("publicaciones");
        } catch (error) {
            console.error(error);
            UI.showToast(error.message || "No se pudo eliminar.", "danger");
        }
    }

    return {
        init,
        navigate
    };
})();

document.addEventListener("DOMContentLoaded", () => {
    window.AdminApp.init();
});
