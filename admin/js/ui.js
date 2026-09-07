window.UI = (function createUI() {
    const refs = {};
    let publicationModal = null;

    function init() {
        refs.loginView = document.getElementById("loginView");
        refs.adminView = document.getElementById("adminView");
        refs.loginForm = document.getElementById("loginForm");
        refs.email = document.getElementById("email");
        refs.password = document.getElementById("password");
        refs.loginButton = document.getElementById("loginButton");
        refs.loginSpinner = document.getElementById("loginSpinner");
        refs.loginButtonText = document.getElementById("loginButtonText");
        refs.loginMessage = document.getElementById("loginMessage");

        refs.sessionUserName = document.getElementById("sessionUserName");
        refs.sessionUserEmail = document.getElementById("sessionUserEmail");
        refs.contentArea = document.getElementById("contentArea");
        refs.sidebar = document.getElementById("sidebar");
        refs.sidebarLinks = Array.from(document.querySelectorAll(".sidebar-link[data-view]"));

        refs.publicationForm = document.getElementById("publicationForm");
        refs.publicationModalLabel = document.getElementById("publicationModalLabel");
        refs.publicationId = document.getElementById("publicationId");
        refs.existingImageUrl = document.getElementById("existingImageUrl");
        refs.titulo = document.getElementById("titulo");
        refs.categoria = document.getElementById("categoria");
        refs.descripcionCorta = document.getElementById("descripcionCorta");
        refs.descripcionCompleta = document.getElementById("descripcionCompleta");
        refs.fechaEvento = document.getElementById("fechaEvento");
        refs.estado = document.getElementById("estado");
        refs.imagenPrincipal = document.getElementById("imagenPrincipal");
        refs.imagePreviewWrapper = document.getElementById("imagePreviewWrapper");
        refs.imagePreview = document.getElementById("imagePreview");
        refs.savePublicationBtn = document.getElementById("savePublicationBtn");
        refs.savePublicationSpinner = document.getElementById("savePublicationSpinner");
        refs.savePublicationText = document.getElementById("savePublicationText");

        const modalElement = document.getElementById("publicationModal");
        publicationModal = new bootstrap.Modal(modalElement);

        ensureToastContainer();
    }

    function ensureToastContainer() {
        if (document.getElementById("toastContainer")) {
            return;
        }

        const toastContainer = document.createElement("div");
        toastContainer.id = "toastContainer";
        toastContainer.className = "toast-container position-fixed top-0 end-0 p-3";
        document.body.appendChild(toastContainer);
    }

    function showLogin() {
        refs.loginView.classList.remove("d-none");
        refs.adminView.classList.add("d-none");
        closeSidebar();
    }

    function showAdmin(user) {
        refs.loginView.classList.add("d-none");
        refs.adminView.classList.remove("d-none");
        refs.sessionUserName.textContent = "Administrador";
        refs.sessionUserEmail.textContent = user && user.email ? user.email : "";
    }

    function setActiveNav(view) {
        refs.sidebarLinks.forEach((button) => {
            const active = button.dataset.view === view;
            button.classList.toggle("active", active);
        });
    }

    function setLoginLoading(isLoading) {
        refs.loginButton.disabled = isLoading;
        refs.loginSpinner.classList.toggle("d-none", !isLoading);
        refs.loginButtonText.textContent = isLoading ? "Validando..." : "Iniciar sesion";
    }

    function setSaveLoading(isLoading) {
        refs.savePublicationBtn.disabled = isLoading;
        refs.savePublicationSpinner.classList.toggle("d-none", !isLoading);
        refs.savePublicationText.textContent = isLoading ? "Guardando..." : "Guardar";
    }

    function showLoginMessage(message, type) {
        refs.loginMessage.className = `mt-3 small alert alert-${type || "danger"}`;
        refs.loginMessage.textContent = message;
    }

    function clearLoginMessage() {
        refs.loginMessage.className = "mt-3 small";
        refs.loginMessage.textContent = "";
    }

    function clearLoginFormValidation() {
        refs.loginForm.classList.remove("was-validated");
    }

    function toggleSidebar() {
        refs.sidebar.classList.toggle("is-open");
    }

    function closeSidebar() {
        refs.sidebar.classList.remove("is-open");
    }

    function renderDashboard(user, stats) {
        refs.contentArea.innerHTML = `
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h2 class="h4 mb-1">Bienvenido al CMS</h2>
                    <p class="text-secondary mb-0">Sesion iniciada con ${escapeHtml(user.email || "-")}</p>
                </div>
                <button class="btn btn-primary" data-action="new-publication">Nueva publicacion</button>
            </div>

            <div class="row g-3 mb-4">
                <div class="col-12 col-md-4">
                    <div class="card card-stat h-100">
                        <div class="card-body">
                            <p class="text-secondary mb-2">Total de publicaciones</p>
                            <p class="value mb-0">${stats.total}</p>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-md-4">
                    <div class="card card-stat h-100">
                        <div class="card-body">
                            <p class="text-secondary mb-2">Publicadas</p>
                            <p class="value mb-0 text-success">${stats.publicadas}</p>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-md-4">
                    <div class="card card-stat h-100">
                        <div class="card-body">
                            <p class="text-secondary mb-2">Borradores</p>
                            <p class="value mb-0 text-warning">${stats.borradores}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card table-wrap">
                <div class="card-body">
                    <h3 class="h6 mb-2">Resumen rapido</h3>
                    <p class="mb-0 text-secondary">Usa el menu lateral para administrar publicaciones y ajustar configuraciones del sitio.</p>
                </div>
            </div>
        `;
    }

    function renderPublicaciones(rows) {
        if (!rows.length) {
            refs.contentArea.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="h4 mb-0">Publicaciones</h2>
                    <button class="btn btn-primary" data-action="new-publication">Nueva publicacion</button>
                </div>
                <div class="empty-state">
                    <h3 class="h5">No hay publicaciones todavia</h3>
                    <p class="text-secondary mb-3">Crea la primera publicacion para comenzar.</p>
                    <button class="btn btn-primary" data-action="new-publication">Crear publicacion</button>
                </div>
            `;
            return;
        }

        // Actions are delegated from contentArea in app.js.
        const tableRows = rows.map((row) => {
            const badgeClass = row.estado === "Publicado" ? "text-bg-success" : "text-bg-warning";
            const shortDate = row.fecha_evento ? row.fecha_evento : "-";
            return `
                <tr data-id="${row.id}">
                    <td>
                        ${row.imagen_principal
                            ? `<img class="thumb" src="${escapeAttribute(row.imagen_principal)}" alt="${escapeAttribute(row.titulo)}">`
                            : "<span class='text-secondary small'>Sin imagen</span>"}
                    </td>
                    <td>
                        <p class="mb-0 fw-semibold">${escapeHtml(row.titulo)}</p>
                        <small class="text-secondary">${escapeHtml(row.categoria)}</small>
                    </td>
                    <td><span class="badge badge-estado ${badgeClass}">${escapeHtml(row.estado)}</span></td>
                    <td>${escapeHtml(shortDate)}</td>
                    <td class="text-end">
                        <div class="btn-group btn-group-sm" role="group">
                            <button class="btn btn-outline-primary" data-action="edit-publication">Editar</button>
                            <button class="btn btn-outline-secondary" data-action="toggle-estado">Estado</button>
                            <button class="btn btn-outline-danger" data-action="delete-publication">Eliminar</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        refs.contentArea.innerHTML = `
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <h2 class="h4 mb-0">Publicaciones</h2>
                <button class="btn btn-primary" data-action="new-publication">Nueva publicacion</button>
            </div>
            <div class="table-wrap p-2 p-md-3">
                <div class="table-responsive">
                    <table class="table align-middle mb-0">
                        <thead>
                            <tr>
                                <th style="width:90px;">Imagen</th>
                                <th>Titulo</th>
                                <th>Estado</th>
                                <th>Fecha evento</th>
                                <th class="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function renderConfiguracion() {
        refs.contentArea.innerHTML = `
            <div class="card table-wrap">
                <div class="card-body p-4">
                    <h2 class="h4 mb-3">Configuracion del panel</h2>
                    <p class="text-secondary">Esta seccion esta lista para ampliar el CMS en futuras fases.</p>
                    <ul class="mb-0 text-secondary">
                        <li>Galeria de imagenes</li>
                        <li>Servicios</li>
                        <li>Eventos</li>
                        <li>Configuracion general del sitio</li>
                        <li>Nuevos modulos administrativos</li>
                    </ul>
                </div>
            </div>
        `;
    }

    function openPublicationModal(mode, row) {
        // Reset form first to avoid stale values between create/edit flows.
        refs.publicationForm.classList.remove("was-validated");
        refs.publicationForm.reset();

        refs.publicationId.value = row && row.id ? row.id : "";
        refs.existingImageUrl.value = row && row.imagen_principal ? row.imagen_principal : "";

        if (mode === "edit" && row) {
            refs.publicationModalLabel.textContent = "Editar publicacion";
            refs.titulo.value = row.titulo || "";
            refs.categoria.value = row.categoria || "";
            refs.descripcionCorta.value = row.descripcion_corta || "";
            refs.descripcionCompleta.value = row.descripcion_completa || "";
            refs.fechaEvento.value = row.fecha_evento || "";
            refs.estado.value = row.estado || "Borrador";

            if (row.imagen_principal) {
                refs.imagePreview.src = row.imagen_principal;
                refs.imagePreviewWrapper.classList.remove("d-none");
            } else {
                refs.imagePreviewWrapper.classList.add("d-none");
            }
        } else {
            refs.publicationModalLabel.textContent = "Nueva publicacion";
            refs.estado.value = "Borrador";
            refs.imagePreviewWrapper.classList.add("d-none");
        }

        publicationModal.show();
    }

    function closePublicationModal() {
        publicationModal.hide();
    }

    function getPublicationFormData() {
        return {
            id: refs.publicationId.value,
            existingImageUrl: refs.existingImageUrl.value,
            imageFile: refs.imagenPrincipal.files[0] || null,
            payload: {
                titulo: refs.titulo.value.trim(),
                categoria: refs.categoria.value.trim(),
                descripcion_corta: refs.descripcionCorta.value.trim(),
                descripcion_completa: refs.descripcionCompleta.value.trim(),
                fecha_evento: refs.fechaEvento.value,
                estado: refs.estado.value
            }
        };
    }

    function showToast(message, type) {
        const toastContainer = document.getElementById("toastContainer");
        const toastId = `toast-${Date.now()}`;
        const bg = type === "danger" ? "text-bg-danger" : type === "warning" ? "text-bg-warning" : "text-bg-success";

        const wrapper = document.createElement("div");
        wrapper.innerHTML = `
            <div id="${toastId}" class="toast align-items-center ${bg} border-0" role="status" aria-live="polite" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">${escapeHtml(message)}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
                </div>
            </div>
        `;

        const toastEl = wrapper.firstElementChild;
        toastContainer.appendChild(toastEl);
        const toast = new bootstrap.Toast(toastEl, { delay: 3200 });
        toast.show();
        toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function escapeAttribute(value) {
        return escapeHtml(value);
    }

    return {
        refs,
        init,
        showLogin,
        showAdmin,
        setActiveNav,
        setLoginLoading,
        setSaveLoading,
        showLoginMessage,
        clearLoginMessage,
        clearLoginFormValidation,
        toggleSidebar,
        closeSidebar,
        renderDashboard,
        renderPublicaciones,
        renderConfiguracion,
        openPublicationModal,
        closePublicationModal,
        getPublicationFormData,
        showToast
    };
})();
