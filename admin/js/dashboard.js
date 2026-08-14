(function () {
	const state = {
		user: null,
		publicaciones: []
	};

	const refs = {};
	let modal = null;
	let authSubscription = null;
	let currentExistingAdditionalImages = [];

	function cacheRefs() {
		refs.contentArea = document.getElementById("contentArea");
		refs.adminEmail = document.getElementById("adminEmail");
		refs.logoutButton = document.getElementById("logoutButton");
		refs.logoutSidebar = document.getElementById("logoutSidebar");
		refs.toggleSidebar = document.getElementById("toggleSidebar");
		refs.sidebar = document.getElementById("sidebar");
		refs.publicationModal = document.getElementById("publicationModal");
		refs.publicationForm = document.getElementById("publicationForm");
		refs.publicationFormError = document.getElementById("publicationFormError");
		refs.publicationModalLabel = document.getElementById("publicationModalLabel");
		refs.publicationId = document.getElementById("publicationId");
		refs.existingImageUrl = document.getElementById("existingImageUrl");
		refs.titulo = document.getElementById("titulo");
		refs.descripcion = document.getElementById("descripcion");
		refs.fechaEvento = document.getElementById("fechaEvento");
		refs.horaEvento = document.getElementById("horaEvento");
		refs.videoUrl = document.getElementById("videoUrl");
		refs.estado = document.getElementById("estado");
		refs.imagenPrincipal = document.getElementById("imagenPrincipal");
		refs.imagenAdicionales = document.getElementById("imagenAdicionales");
		refs.imagePreviewWrapper = document.getElementById("imagePreviewWrapper");
		refs.imagePreview = document.getElementById("imagePreview");
		refs.additionalImagesPreview = document.getElementById("additionalImagesPreview");
		refs.savePublicationBtn = document.getElementById("savePublicationBtn");
		refs.savePublicationSpinner = document.getElementById("savePublicationSpinner");
		refs.savePublicationText = document.getElementById("savePublicationText");
		refs.publicationCloseButton = document.getElementById("publicationCloseButton");
		refs.cancelPublicationBtn = document.getElementById("cancelPublicationBtn");
	}

	async function init() {
		cacheRefs();
		modal = new bootstrap.Modal(refs.publicationModal);

		const session = await AuthService.getSession().catch(() => null);
		if (!(await ensureAuthorizedSession(session))) {
			return;
		}

		state.user = session.user;
		refs.adminEmail.textContent = session.user.email || "Administrador";
		bindAuthGuard();
		bindEvents();
		await navigate("publicaciones");
	}

	function bindAuthGuard() {
		authSubscription = AuthService.onAuthStateChange(async (_event, session) => {
			if (!(await ensureAuthorizedSession(session))) {
				return;
			}

			state.user = session.user;
			refs.adminEmail.textContent = session.user.email || "Administrador";
		});

		window.addEventListener("beforeunload", () => {
			authSubscription?.data?.subscription?.unsubscribe();
		});
	}

	async function ensureAuthorizedSession(session) {
		if (session && session.user && AuthService.isAuthorizedUser(session.user)) {
			return true;
		}

		await AuthService.signOut().catch(() => null);
		window.location.href = "login.html";
		return false;
	}

	function bindEvents() {
		refs.logoutButton.addEventListener("click", handleLogout);
		refs.logoutSidebar.addEventListener("click", handleLogout);
		refs.toggleSidebar.addEventListener("click", () => refs.sidebar.classList.toggle("is-open"));
		refs.publicationForm.addEventListener("submit", onPublicationSubmit);
		refs.imagenPrincipal.addEventListener("change", onImageChange);
		refs.imagenAdicionales.addEventListener("change", onAdditionalImagesChange);
		refs.additionalImagesPreview.addEventListener("click", onAdditionalImagesPreviewClick);
		refs.contentArea.addEventListener("click", onContentClick);
		refs.publicationCloseButton.addEventListener("click", () => handleModalCloseAttempt());
		refs.cancelPublicationBtn.addEventListener("click", () => handleModalCloseAttempt());
		refs.publicationModal.addEventListener("hidden.bs.modal", () => {
			refs.publicationFormError.classList.add("d-none");
			refs.publicationFormError.textContent = "";
		});

		document.querySelectorAll(".sidebar-link[data-view]").forEach((button) => {
			button.addEventListener("click", () => {
				navigate(button.dataset.view);
			});
		});
	}

	async function handleLogout() {
		await AuthService.signOut().catch(() => null);
		window.location.href = "login.html";
	}

	function setActiveNav(view) {
		document.querySelectorAll(".sidebar-link[data-view]").forEach((button) => {
			button.classList.toggle("active", button.dataset.view === view);
		});
	}

	async function navigate(view) {
		const targetView = view === "publicaciones" ? "publicaciones" : "publicaciones";
		setActiveNav(targetView);
		refs.sidebar.classList.remove("is-open");

		await renderPublicaciones();
	}

	async function renderPublicaciones() {
		try {
			const [stats, publicaciones] = await Promise.all([
				PublicacionesService.getStats(),
				PublicacionesService.list()
			]);

			state.publicaciones = publicaciones;

			const rows = state.publicaciones.map((item) => `
				<tr data-id="${item.id}">
					<td>
						${item.imagen_url
							? `<img class="thumb" src="${escapeHtml(item.imagen_url)}" alt="${escapeHtml(item.titulo)}">`
							: "<span class='text-secondary small'>Sin imagen</span>"}
					</td>
					<td>
						<p class="mb-0 fw-semibold">${escapeHtml(item.titulo)}</p>
						<small class="text-secondary">${escapeHtml(item.descripcion.slice(0, 80))}${item.descripcion.length > 80 ? "..." : ""}</small>
					</td>
					<td><span class="badge badge-estado ${item.estado === "publicado" ? "text-bg-success" : "text-bg-warning"}">${escapeHtml(capitalize(item.estado))}</span></td>
					<td>${escapeHtml(formatDate(item.fecha_evento))}</td>
					<td class="text-end">
						<div class="btn-group btn-group-sm" role="group">
							<button class="btn btn-outline-primary" data-action="edit-publication">Editar</button>
							<button class="btn btn-outline-secondary" data-action="toggle-estado">Estado</button>
							<button class="btn btn-outline-danger" data-action="delete-publication">Eliminar</button>
						</div>
					</td>
				</tr>
			`).join("");
			const tableContent = rows
				? `
					<div class="table-wrap p-2 p-md-3">
						<div class="table-responsive">
							<table class="table align-middle mb-0">
								<thead>
									<tr>
										<th style="width:90px;">Imagen</th>
										<th>Titulo</th>
										<th>Estado</th>
										<th>Creacion</th>
										<th class="text-end">Acciones</th>
									</tr>
								</thead>
								<tbody>${rows}</tbody>
							</table>
						</div>
					</div>
				`
				: `
					<div class="empty-state">
						<p class="text-secondary text-uppercase small fw-semibold mb-2">Publicaciones</p>
						<h3 class="h5 mb-2">Aun no hay publicaciones registradas</h3>
						<p class="text-secondary mb-4">Crea la primera publicacion del panel para comenzar a gestionar contenido, imagenes y estado de visibilidad.</p>
						<button class="btn btn-primary" data-action="new-publication">Crear primera publicacion</button>
					</div>
				`;

			refs.contentArea.innerHTML = `
				<section class="hero-panel mb-4">
					<div class="hero-copy">
						<p class="hero-eyebrow mb-2">Panel Administrativo privado</p>
						<h1 class="h3 mb-2">Publicaciones</h1>
					</div>
					<div class="hero-actions">
						<button class="btn btn-primary" data-action="new-publication">Nueva publicacion</button>
					</div>
				</section>

				<div class="row g-3 mb-4">
					<div class="col-12 col-md-4"><div class="card card-stat h-100"><div class="card-body"><p class="text-secondary mb-2">Total</p><p class="value mb-0">${stats.total}</p></div></div></div>
					<div class="col-12 col-md-4"><div class="card card-stat h-100"><div class="card-body"><p class="text-secondary mb-2">Publicadas</p><p class="value mb-0 text-success">${stats.publicadas ?? 0}</p></div></div></div>
					<div class="col-12 col-md-4"><div class="card card-stat h-100"><div class="card-body"><p class="text-secondary mb-2">Borradores</p><p class="value mb-0 text-warning">${stats.borradores ?? 0}</p></div></div></div>
				</div>

				<div class="section-note mb-4">
					<span class="section-chip">Tabla: ${escapeHtml(APP_CONFIG.TABLES.PUBLICACIONES)}</span>
					<span class="section-chip">Bucket: ${escapeHtml(APP_CONFIG.STORAGE.PUBLICACIONES_BUCKET)}</span>
				</div>

				${tableContent}
			`;
		} catch (error) {
			console.error("Error cargando publicaciones:", error);
			refs.contentArea.innerHTML = `
				<section class="hero-panel mb-4">
					<div class="hero-copy">
						<p class="hero-eyebrow mb-2">Dashboard privado</p>
						<h1 class="h3 mb-2">Publicaciones</h1>
						<p class="text-danger mb-2">No se pudo cargar el modulo de publicaciones.</p>
						<p class="text-secondary mb-0">${escapeHtml(error && error.message ? error.message : "Error desconocido al consultar Supabase.")}</p>
					</div>
					<div class="hero-actions">
						<button class="btn btn-primary" data-action="new-publication">Nueva publicacion</button>
					</div>
				</section>
			`;
		}
	}

	function onContentClick(event) {
		const actionButton = event.target.closest("[data-action]");
		if (!actionButton) {
			return;
		}

		const action = actionButton.dataset.action;

		if (action === "new-publication") {
			openPublicationModal();
			return;
		}

		const row = actionButton.closest("tr[data-id]");
		if (!row) {
			return;
		}

		const publication = state.publicaciones.find((item) => String(item.id) === String(row.dataset.id));
		if (!publication) {
			return;
		}

		if (action === "edit-publication") {
			openPublicationModal(publication);
			return;
		}

		if (action === "toggle-estado") {
			toggleEstado(publication);
			return;
		}

		if (action === "delete-publication") {
			deletePublication(publication);
		}
	}

	function normalizeAdditionalImages(value) {
		if (!value) {
			return [];
		}

		let parsedValue = value;
		if (typeof parsedValue === "string") {
			try {
				parsedValue = JSON.parse(parsedValue);
			} catch (error) {
				return parsedValue.trim() ? [parsedValue.trim()] : [];
			}
		}

		if (!Array.isArray(parsedValue)) {
			return [];
		}

		return parsedValue
			.map((item) => {
				if (typeof item === "string") {
					return item.trim();
				}

				if (item && typeof item === "object") {
					return (item.url || item.img || item.src || "").trim();
				}

				return "";
			})
			.filter(Boolean);
	}

	function renderAdditionalImagesPreview() {
		const existingMarkup = currentExistingAdditionalImages.map((url, index) => `
			<div class="position-relative border rounded overflow-hidden bg-dark-subtle" style="width: 96px; height: 96px;">
				<img src="${escapeHtml(url)}" alt="Imagen adicional existente ${index + 1}" style="width:100%;height:100%;object-fit:cover;">
				<button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 p-1" data-remove-existing="${index}" aria-label="Eliminar imagen existente">×</button>
			</div>
		`).join("");

		const newFiles = Array.from(refs.imagenAdicionales.files || []);
		const newMarkup = newFiles.map((file, index) => {
			const objectUrl = URL.createObjectURL(file);
			return `
				<div class="position-relative border rounded overflow-hidden bg-dark-subtle" style="width: 96px; height: 96px;">
					<img src="${objectUrl}" alt="Imagen adicional ${index + 1}" style="width:100%;height:100%;object-fit:cover;">
					<button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 p-1" data-remove-extra="${index}" aria-label="Eliminar imagen nueva">×</button>
				</div>
			`;
		}).join("");

		refs.additionalImagesPreview.innerHTML = existingMarkup + newMarkup;
	}

	function onAdditionalImagesPreviewClick(event) {
		const removeExistingButton = event.target.closest("[data-remove-existing]");
		if (removeExistingButton) {
			const index = Number(removeExistingButton.dataset.removeExisting);
			if (Number.isInteger(index)) {
				currentExistingAdditionalImages.splice(index, 1);
				renderAdditionalImagesPreview();
			}
			return;
		}

		const removeExtraButton = event.target.closest("[data-remove-extra]");
		if (!removeExtraButton) {
			return;
		}

		const index = Number(removeExtraButton.dataset.removeExtra);
		if (!Number.isInteger(index)) {
			return;
		}

		const dataTransfer = new DataTransfer();
		Array.from(refs.imagenAdicionales.files || []).forEach((file, fileIndex) => {
			if (fileIndex !== index) {
				dataTransfer.items.add(file);
			}
		});
		refs.imagenAdicionales.files = dataTransfer.files;
		renderAdditionalImagesPreview();
	}

	function openPublicationModal(publication = null) {
		const isEditing = Boolean(publication && publication.id);
		const hasExistingImage = Boolean(publication && publication.imagen_url);
		currentExistingAdditionalImages = publication ? normalizeAdditionalImages(publication.imagenes_adicionales) : [];

		refs.publicationForm.reset();
		refs.publicationForm.classList.remove("was-validated");
		refs.publicationFormError.classList.add("d-none");
		refs.publicationFormError.textContent = "";
		refs.publicationId.value = publication ? publication.id : "";
		refs.existingImageUrl.value = publication ? publication.imagen_url : "";
		refs.publicationModalLabel.textContent = isEditing ? "Editar publicacion" : "Nueva publicacion";
		refs.titulo.value = publication ? publication.titulo : "";
		refs.descripcion.value = publication ? publication.descripcion : "";
		refs.fechaEvento.value = publication && publication.fecha_evento ? publication.fecha_evento : "";
		refs.horaEvento.value = publication && publication.hora_evento ? publication.hora_evento.slice(0, 5) : "";
		refs.videoUrl.value = publication ? (publication.video_url || "") : "";
		refs.estado.value = publication ? publication.estado : "borrador";
		refs.imagenPrincipal.required = !isEditing || !hasExistingImage;
		refs.imagenPrincipal.value = "";
		refs.imagenAdicionales.value = "";
		refs.additionalImagesPreview.innerHTML = "";
		refs.imagePreview.src = "";
		refs.imagePreviewWrapper.classList.add("d-none");
		updateSaveButtonText(isEditing);

		if (publication && publication.imagen_url) {
			refs.imagePreview.src = publication.imagen_url;
			refs.imagePreviewWrapper.classList.remove("d-none");
		}

		renderAdditionalImagesPreview();

		const savedDraft = getDraft();
		if (!publication && savedDraft && savedDraft.titulo) {
			const shouldRecover = window.confirm("Se encontro un borrador de una publicacion. ¿Deseas recuperarlo?");
			if (shouldRecover) {
				applyDraft(savedDraft);
			} else {
				clearDraft();
			}
		}

		modal.show();
	}

	function onImageChange() {
		const file = refs.imagenPrincipal.files[0];
		if (!file) {
			refs.imagePreview.src = "";
			refs.imagePreviewWrapper.classList.add("d-none");
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			refs.imagePreview.src = reader.result;
			refs.imagePreviewWrapper.classList.remove("d-none");
		};
		reader.readAsDataURL(file);
		saveDraftToLocalStorage();
	}

	function onAdditionalImagesChange() {
		renderAdditionalImagesPreview();
		saveDraftToLocalStorage();
	}

	function getDraftKey() {
		return "next_level_publicacion_borrador";
	}

	function getDraft() {
		try {
			const raw = localStorage.getItem(getDraftKey());
			return raw ? JSON.parse(raw) : null;
		} catch (error) {
			return null;
		}
	}

	function saveDraftToLocalStorage() {
		const draft = {
			titulo: refs.titulo.value.trim(),
			descripcion: refs.descripcion.value.trim(),
			fecha_evento: refs.fechaEvento.value,
			hora_evento: refs.horaEvento ? refs.horaEvento.value : "",
			video_url: refs.videoUrl ? refs.videoUrl.value.trim() : "",
			estado: refs.estado.value
		};
		localStorage.setItem(getDraftKey(), JSON.stringify(draft));
	}

	function applyDraft(draft) {
		refs.titulo.value = draft.titulo || "";
		refs.descripcion.value = draft.descripcion || "";
		refs.fechaEvento.value = draft.fecha_evento || "";
		refs.horaEvento.value = draft.hora_evento || "";
		refs.videoUrl.value = draft.video_url || "";
		refs.estado.value = draft.estado || "borrador";
	}

	function clearDraft() {
		localStorage.removeItem(getDraftKey());
	}

	function handleModalCloseAttempt() {
		const hasChanges = refs.titulo.value.trim() || refs.descripcion.value.trim() || refs.fechaEvento.value || refs.horaEvento.value || refs.videoUrl.value.trim() || refs.estado.value !== "borrador" || refs.imagenPrincipal.files.length > 0 || refs.imagenAdicionales.files.length > 0;
		if (!hasChanges) {
			closePublicationModal();
			return;
		}

		const shouldLeave = window.confirm("Hay cambios sin guardar. ¿Deseas salir?");
		if (shouldLeave) {
			closePublicationModal();
		}
	}

	function closePublicationModal() {
		modal.hide();
		refs.publicationForm.reset();
		refs.publicationFormError.classList.add("d-none");
		refs.publicationFormError.textContent = "";
		refs.publicationForm.classList.remove("was-validated");
		refs.imagePreview.src = "";
		refs.imagePreviewWrapper.classList.add("d-none");
		refs.additionalImagesPreview.innerHTML = "";
		refs.imagenPrincipal.value = "";
		refs.imagenAdicionales.value = "";
		refs.fechaEvento.value = "";
		refs.horaEvento.value = "";
		refs.videoUrl.value = "";
		refs.publicationId.value = "";
		refs.existingImageUrl.value = "";
		refs.publicationModalLabel.textContent = "Nueva publicacion";
		refs.savePublicationText.textContent = "Guardar publicación";
		clearDraft();
	}

	async function onPublicationSubmit(event) {
		event.preventDefault();
		refs.publicationFormError.classList.add("d-none");
		refs.publicationFormError.textContent = "";

		const session = await AuthService.getSession().catch(() => null);
		if (!(session && session.user && AuthService.isAuthorizedUser(session.user))) {
			showFormError("La sesion no es valida o no tienes permisos para crear publicaciones.");
			window.location.href = "login.html";
			return;
		}

		const titulo = refs.titulo.value.trim();
		const descripcion = refs.descripcion.value.trim();
		const fechaEvento = refs.fechaEvento.value;
		const horaEvento = refs.horaEvento.value ? `${refs.horaEvento.value}:00` : null;
		const videoUrl = refs.videoUrl.value.trim();
		const estado = refs.estado.value;
		const publicationId = refs.publicationId.value.trim();
		const existingImageUrl = refs.existingImageUrl.value.trim();
		const imagePrincipal = refs.imagenPrincipal.files[0] || null;
		const isEditing = Boolean(publicationId);
		const hasExistingImage = Boolean(existingImageUrl);
		const additionalImages = Array.from(refs.imagenAdicionales.files || []);
		const preservedExistingAdditionalImages = currentExistingAdditionalImages.slice();

		if (!titulo || !descripcion || !fechaEvento || !estado) {
			refs.publicationForm.classList.add("was-validated");
			showFormError("Completa todos los campos obligatorios antes de guardar.");
			return;
		}

		if (!isEditing && !imagePrincipal) {
			refs.publicationForm.classList.add("was-validated");
			showFormError("Debes seleccionar una imagen principal antes de guardar.");
			return;
		}

		if (isEditing && !imagePrincipal && !hasExistingImage) {
			refs.publicationForm.classList.add("was-validated");
			showFormError("Debes seleccionar una imagen principal antes de guardar.");
			return;
		}

		setSaveLoading(true);

		try {
			const payload = {
				titulo,
				descripcion,
				fecha_evento: fechaEvento || null,
				hora_evento: horaEvento,
				estado,
				video_url: videoUrl || null
			};

			let result;
			if (isEditing) {
				result = await PublicacionesService.update(
					publicationId,
					payload,
					imagePrincipal,
					existingImageUrl,
					additionalImages,
					preservedExistingAdditionalImages
				);
				window.alert("Publicación actualizada correctamente.");
			} else {
				result = await PublicacionesService.create(payload, imagePrincipal, additionalImages);
				window.alert("Publicación creada correctamente.");
			}

			clearDraft();
			closePublicationModal();
			await renderPublicaciones();
			return result;
		} catch (error) {
			console.error("Error al guardar publicacion:", error);
			showFormError(error && error.message ? error.message : "No se pudo guardar la publicacion.");
		} finally {
			setSaveLoading(false);
		}
	}

	async function toggleEstado(publication) {
		try {
			await PublicacionesService.toggleEstado(publication.id, publication.estado);
			await renderPublicaciones();
		} catch (error) {
			window.alert(error.message || "No se pudo cambiar el estado.");
		}
	}

	async function deletePublication(publication) {
		const confirmDelete = window.confirm(`Eliminar la publicacion \"${publication.titulo}\"?`);
		if (!confirmDelete) {
			return;
		}

		try {
			await PublicacionesService.remove(publication.id, publication.imagen_url);
			await renderPublicaciones();
		} catch (error) {
			window.alert(error.message || "No se pudo eliminar la publicacion.");
		}
	}

	function showFormError(message) {
		refs.publicationFormError.textContent = message;
		refs.publicationFormError.classList.remove("d-none");
	}

	function updateSaveButtonText(isEditing) {
		const isCreate = !isEditing;
		refs.publicationModalLabel.textContent = isCreate ? "Nueva publicacion" : "Editar publicacion";
		refs.savePublicationText.textContent = isCreate ? "Guardar publicación" : "Actualizar publicación";
	}

	function setSaveLoading(isLoading) {
		refs.savePublicationBtn.disabled = isLoading;
		refs.savePublicationSpinner.classList.toggle("d-none", !isLoading);
		if (isLoading) {
			refs.savePublicationText.textContent = "Guardando...";
			return;
		}
		updateSaveButtonText(Boolean(refs.publicationId.value));
	}

	function capitalize(value) {
		return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
	}

	function formatDate(value) {
		if (!value) {
			return "-";
		}

		const date = new Date(value);
		if (Number.isNaN(date.getTime())) {
			return value;
		}

		return date.toLocaleString("es-SV", {
			year: "numeric",
			month: "short",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit"
		});
	}

	function formatDateInput(value) {
		if (!value) {
			return "";
		}

		if (typeof value === "string") {
			const trimmed = value.trim();
			if (!trimmed) {
				return "";
			}
			return trimmed.replace("Z", "").slice(0, 16);
		}

		const date = new Date(value);
		if (Number.isNaN(date.getTime())) {
			return "";
		}

		const pad = (number) => String(number).padStart(2, "0");
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
	}

	function escapeHtml(value) {
		return String(value)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/\"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}

	document.addEventListener("DOMContentLoaded", init);
})();
