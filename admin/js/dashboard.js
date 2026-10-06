(function () {
	const state = {
		user: null,
		publicaciones: [],
		productos: [],
		currentView: "inicio"
	};

	const DEFAULT_PROMO_BANNER_IMAGE = { position: 1, image_url: "images/servi.png" };
	const DEFAULT_PROMO_BANNER_IMAGES = [DEFAULT_PROMO_BANNER_IMAGE];

	const refs = {};
	const DRAFT_STORAGE_KEY = "next_level_publicacion_borrador";
	const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
	const stateFilters = {
		search: "",
		estado: "todos"
	};
	const productoStateFilters = {
		search: "",
		estado: "todos"
	};
	let modal = null;
	let productoModal = null;
	let authSubscription = null;
	let currentExistingAdditionalImages = [];
	let currentOriginalAdditionalImages = [];
	let draftSaveTimer = null;

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
		refs.productoModal = document.getElementById("productoModal");
		refs.productoForm = document.getElementById("productoForm");
		refs.productoFormError = document.getElementById("productoFormError");
		refs.productoModalLabel = document.getElementById("productoModalLabel");
		refs.productoId = document.getElementById("productoId");
		refs.existingProductoImageUrl = document.getElementById("existingProductoImageUrl");
		refs.productoTitulo = document.getElementById("productoTitulo");
		refs.productoDescripcion = document.getElementById("productoDescripcion");
		refs.productoImagen = document.getElementById("productoImagen");
		refs.productoImagePreviewWrapper = document.getElementById("productoImagePreviewWrapper");
		refs.productoImagePreview = document.getElementById("productoImagePreview");
		refs.productoTextoBadge = document.getElementById("productoTextoBadge");
		refs.productoTextoMeta = document.getElementById("productoTextoMeta");
		refs.productoTituloFuente = document.getElementById("productoTituloFuente");
		refs.productoTituloAlineacion = document.getElementById("productoTituloAlineacion");
		refs.productoTituloTamano = document.getElementById("productoTituloTamano");
		refs.productoTituloPeso = document.getElementById("productoTituloPeso");
		refs.productoTituloEstilo = document.getElementById("productoTituloEstilo");
		refs.productoTituloColor = document.getElementById("productoTituloColor");
		refs.productoDescripcionFuente = document.getElementById("productoDescripcionFuente");
		refs.productoDescripcionAlineacion = document.getElementById("productoDescripcionAlineacion");
		refs.productoDescripcionTamano = document.getElementById("productoDescripcionTamano");
		refs.productoDescripcionPeso = document.getElementById("productoDescripcionPeso");
		refs.productoDescripcionEstilo = document.getElementById("productoDescripcionEstilo");
		refs.productoDescripcionColor = document.getElementById("productoDescripcionColor");
		refs.productoPreviewTitulo = document.getElementById("productoPreviewTitulo");
		refs.productoPreviewDescripcion = document.getElementById("productoPreviewDescripcion");
		refs.productoEstado = document.getElementById("productoEstado");
		refs.productoOrden = document.getElementById("productoOrden");
		refs.saveProductoBtn = document.getElementById("saveProductoBtn");
		refs.saveProductoSpinner = document.getElementById("saveProductoSpinner");
		refs.saveProductoText = document.getElementById("saveProductoText");
		refs.productoCloseButton = document.getElementById("productoCloseButton");
		refs.cancelProductoBtn = document.getElementById("cancelProductoBtn");
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
		refs.additionalImagesSummary = document.getElementById("additionalImagesSummary");
		refs.additionalImagesPreview = document.getElementById("additionalImagesPreview");
		refs.savePublicationBtn = document.getElementById("savePublicationBtn");
		refs.savePublicationSpinner = document.getElementById("savePublicationSpinner");
		refs.savePublicationText = document.getElementById("savePublicationText");
		refs.publicationCloseButton = document.getElementById("publicationCloseButton");
		refs.cancelPublicationBtn = document.getElementById("cancelPublicationBtn");
		ensureToastContainer();
	}

	function ensureToastContainer() {
		if (document.getElementById("toastContainer")) {
			return;
		}

		const toastContainer = document.createElement("div");
		toastContainer.id = "toastContainer";
		toastContainer.className = "toast-container position-fixed top-0 end-0 p-3";
		toastContainer.setAttribute("aria-live", "polite");
		toastContainer.setAttribute("aria-atomic", "true");
		document.body.appendChild(toastContainer);
	}

	function showToast(message, type = "success") {
		const toastContainer = document.getElementById("toastContainer");
		if (!toastContainer) {
			ensureToastContainer();
		}

		const toastId = `toast-${Date.now()}`;
		const toneClass = type === "danger" ? "text-bg-danger" : type === "warning" ? "text-bg-warning" : "text-bg-success";
		const wrapper = document.createElement("div");
		wrapper.innerHTML = `
			<div id="${toastId}" class="toast align-items-center ${toneClass} border-0" role="status" aria-live="polite" aria-atomic="true">
				<div class="d-flex">
					<div class="toast-body text-white">${escapeHtml(message)}</div>
					<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
				</div>
			</div>
		`;

		const toastElement = wrapper.firstElementChild;
		document.getElementById("toastContainer").appendChild(toastElement);
		const toast = new bootstrap.Toast(toastElement, { delay: 3200 });
		toast.show();
		toastElement.addEventListener("hidden.bs.toast", () => toastElement.remove());
	}

	async function init() {
		cacheRefs();
		modal = new bootstrap.Modal(refs.publicationModal);
		productoModal = new bootstrap.Modal(refs.productoModal);

		const session = await AuthService.getSession().catch(() => null);
		if (!(await ensureAuthorizedSession(session))) {
			return;
		}

		state.user = session.user;
		refs.adminEmail.textContent = session.user.email || "Administrador";
		bindAuthGuard();
		bindEvents();
		await navigate("inicio");
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
			saveDraftToLocalStorage();
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
		refs.productoForm.addEventListener("submit", onProductoSubmit);
		refs.titulo.addEventListener("input", scheduleDraftSave);
		refs.descripcion.addEventListener("input", scheduleDraftSave);
		refs.fechaEvento.addEventListener("input", scheduleDraftSave);
		refs.horaEvento.addEventListener("input", scheduleDraftSave);
		refs.videoUrl.addEventListener("input", scheduleDraftSave);
		refs.estado.addEventListener("change", scheduleDraftSave);
		refs.imagenPrincipal.addEventListener("change", onImageChange);
		refs.imagenAdicionales.addEventListener("change", onAdditionalImagesChange);
		refs.additionalImagesPreview.addEventListener("click", onAdditionalImagesPreviewClick);
		refs.contentArea.addEventListener("click", onContentClick);
		refs.contentArea.addEventListener("input", onContentInput);
		refs.contentArea.addEventListener("change", onContentInput);
		refs.contentArea.addEventListener("change", onSiteMediaInputChange);
		refs.contentArea.addEventListener("click", onSiteMediaActionClick);
		refs.publicationCloseButton.addEventListener("click", () => handleModalCloseAttempt());
		refs.cancelPublicationBtn.addEventListener("click", () => handleModalCloseAttempt());
		refs.productoImagen.addEventListener("change", onProductoImageChange);
		refs.productoCloseButton.addEventListener("click", () => handleProductoModalCloseAttempt());
		refs.cancelProductoBtn.addEventListener("click", () => handleProductoModalCloseAttempt());
		refs.publicationModal.addEventListener("hidden.bs.modal", () => {
			refs.publicationFormError.classList.add("d-none");
			refs.publicationFormError.textContent = "";
		});
		refs.productoModal.addEventListener("hidden.bs.modal", () => {
			refs.productoFormError.classList.add("d-none");
			refs.productoFormError.textContent = "";
		});
		[
			refs.productoTituloFuente,
			refs.productoTituloAlineacion,
			refs.productoTituloTamano,
			refs.productoTituloPeso,
			refs.productoTituloEstilo,
			refs.productoTituloColor,
			refs.productoDescripcionFuente,
			refs.productoDescripcionAlineacion,
			refs.productoDescripcionTamano,
			refs.productoDescripcionPeso,
			refs.productoDescripcionEstilo,
			refs.productoDescripcionColor
		].forEach((element) => {
			if (!element) {
				return;
			}
			element.addEventListener("change", updateProductoPreview);
			element.addEventListener("input", updateProductoPreview);
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
    const validViews = [ "inicio", "inicio-web", "publicaciones", "productos", "quienes-somos"
    ];

    const targetView = validViews.includes(view)
        ? view
        : "inicio";

    state.currentView = targetView;
    setActiveNav(targetView);
    refs.sidebar.classList.remove("is-open");
    refs.contentArea.classList.remove("inicio-web-view");

    if (targetView === "inicio") {
        await renderInicio();
        return;
    }

    if (targetView === "inicio-web") {
        await renderInicioWeb();
        return;
    }

    if (targetView === "productos") {
        await renderProductos();
        return;
    }

    if (targetView === "quienes-somos") {
        await renderQuienesSomos();
        return;
    }

    await renderPublicaciones();
}

async function renderQuienesSomos() {
	try {
		const [configMap, testimonials] = await Promise.all([
			window.QuienesSomosService.listConfig().catch(() => window.QuienesSomosService.getDefaultConfig()),
			window.QuienesSomosService.listTestimonials(true).catch(() => window.QuienesSomosService.getDefaultTestimonials())
		]);

		const values = {
			...window.QuienesSomosService.getDefaultConfig(),
			...configMap
		};

		const sectionFields = [
			{
				section: "Presentación",
				fields: [
					["expertise_subtitulo", "Subtítulo"],
					["expertise_titulo", "Título"],
					["expertise_parrafo_1", "Párrafo 1"],
					["expertise_parrafo_2", "Párrafo 2"]
				]
			},
			{
				section: "Historia",
				fields: [
					["about_kicker", "Kicker"],
					["about_titulo", "Título"],
					["about_parrafo_1", "Párrafo 1"],
					["about_parrafo_2", "Párrafo 2"],
					["about_parrafo_3", "Párrafo 3"],
					["about_video_1", "Video 1"],
					["about_video_2", "Video 2"],
					["about_video_3", "Video 3"]
				]
			},
			{
				section: "Nuestra energía",
				fields: [
					["about_banner_tag", "Tag"],
					["about_banner_titulo", "Título"],
					["about_banner_descripcion", "Descripción"]
				]
			}
		];

		const sectionsMarkup = sectionFields.map(({ section, fields }) => `
			<div class="quienes-somos-section-card">
				<div class="quienes-somos-section-title">${escapeHtml(section)}</div>
				<div class="quienes-somos-grid">
					${fields.map(([key, label]) => {
						const inputType = key.includes("video") ? "text" : "text";
						const isLongText = [
							"expertise_parrafo_1",
							"expertise_parrafo_2",
							"about_parrafo_1",
							"about_parrafo_2",
							"about_parrafo_3",
							"about_banner_descripcion"
						].includes(key);

						const control = isLongText
							? `<textarea class="form-control" rows="4" data-quienes-config-key="${key}">${escapeHtml(values[key] || "")}</textarea>`
							: `<input type="${inputType}" class="form-control" data-quienes-config-key="${key}" value="${escapeHtml(values[key] || "")}">`;

						return `
							<div>
								<label class="quienes-somos-form-label">${escapeHtml(label)}</label>
								${control}
							</div>
						`;
					}).join("")}
				</div>
			</div>
		`).join("");

		const testimonialMarkup = [1, 2, 3].map((position) => {
			const item = (testimonials || []).find((entry) => Number(entry.position) === position) || {
				titulo: "",
				nombre_ubicacion: "",
				texto: "",
				image_url: "",
				position
			};

			return `
				<div class="quienes-somos-testimonial-card">
					<div class="quienes-somos-section-title">Testimonio ${position}</div>
					<div class="row g-3">
						<div class="col-12 col-md-6">
							<label class="quienes-somos-form-label">Título</label>
							<input type="text" class="form-control" data-quienes-testimonio-position="${position}" data-quienes-testimonio-field="titulo" value="${escapeHtml(item.titulo || "")}">
						</div>
						<div class="col-12 col-md-6">
							<label class="quienes-somos-form-label">Nombre y ubicación</label>
							<input type="text" class="form-control" data-quienes-testimonio-position="${position}" data-quienes-testimonio-field="nombre_ubicacion" value="${escapeHtml(item.nombre_ubicacion || "")}">
						</div>
						<div class="col-12">
							<label class="quienes-somos-form-label">Texto</label>
							<textarea class="form-control" rows="4" data-quienes-testimonio-position="${position}" data-quienes-testimonio-field="texto">${escapeHtml(item.texto || "")}</textarea>
						</div>
						<div class="col-12">
							<label class="quienes-somos-form-label">Imagen URL</label>
							<input type="text" class="form-control" data-quienes-testimonio-position="${position}" data-quienes-testimonio-field="image_url" value="${escapeHtml(item.image_url || "")}">
						</div>
					</div>
					<div class="quienes-somos-form-actions">
						<button class="btn btn-primary" type="button" data-action="guardar-quienes-somos-testimonio" data-position="${position}">Guardar testimonio ${position}</button>
					</div>
				</div>
			`;
		}).join("");

		refs.contentArea.innerHTML = `
			<section class="hero-panel mb-4">
				<div class="hero-copy">
					<p class="hero-eyebrow mb-2">NEXT LEVEL PRODUCCIONES</p>
					<h1 class="h3 mb-2">Quiénes Somos</h1>
					<p class="text-secondary mb-0">Actualiza la presentación, historia y testimonios de la página de Quiénes Somos.</p>
				</div>
				<div class="hero-actions">
					<button class="btn btn-primary" type="button" data-action="guardar-quienes-somos">Guardar cambios</button>
				</div>
			</section>

			<div class="quienes-somos-editor">
				${sectionsMarkup}
				${testimonialMarkup}
			</div>
		`;
	} catch (error) {
		console.error("Error cargando Quiénes Somos:", error);
		refs.contentArea.innerHTML = `
			<section class="hero-panel mb-4">
				<div class="hero-copy">
					<p class="hero-eyebrow mb-2">Dashboard privado</p>
					<h1 class="h3 mb-2">Quiénes Somos</h1>
					<p class="text-danger mb-2">No se pudo cargar la sección de Quiénes Somos.</p>
					<p class="text-secondary mb-0">${escapeHtml(error && error.message ? error.message : "Error desconocido al consultar Supabase.")}</p>
				</div>
			</section>
		`;
	}
}

async function guardarQuienesSomosConfig() {
	const form = refs.contentArea.querySelector("[data-quienes-config-key]");
	if (!form) {
		return;
	}

	const entries = {};
	refs.contentArea.querySelectorAll("[data-quienes-config-key]").forEach((element) => {
		const key = element.dataset.quienesConfigKey;
		if (!key) {
			return;
		}
		entries[key] = element.value;
	});

	try {
		await window.QuienesSomosService.saveConfigEntries(entries);
		showToast("La información de Quiénes Somos se actualizó correctamente.", "success");
		await renderQuienesSomos();
	} catch (error) {
		console.error("Error guardando la configuración de Quiénes Somos:", error);
		showToast("No se pudo guardar la información de Quiénes Somos.", "danger");
	}
}

async function guardarQuienesSomosTestimonio(position) {
	const targetPosition = Number(position || 0);
	if (!targetPosition) {
		return;
	}

	const row = refs.contentArea.querySelector(`[data-quienes-testimonio-position="${targetPosition}"]`);
	if (!row) {
		return;
	}

	const payload = {
		titulo: refs.contentArea.querySelector(`[data-quienes-testimonio-position="${targetPosition}"][data-quienes-testimonio-field="titulo"]`)?.value || "",
		nombre_ubicacion: refs.contentArea.querySelector(`[data-quienes-testimonio-position="${targetPosition}"][data-quienes-testimonio-field="nombre_ubicacion"]`)?.value || "",
		texto: refs.contentArea.querySelector(`[data-quienes-testimonio-position="${targetPosition}"][data-quienes-testimonio-field="texto"]`)?.value || "",
		image_url: refs.contentArea.querySelector(`[data-quienes-testimonio-position="${targetPosition}"][data-quienes-testimonio-field="image_url"]`)?.value || ""
	};

	try {
		await window.QuienesSomosService.saveTestimonial(targetPosition, payload);
		showToast(`El testimonio ${targetPosition} se guardó correctamente.`, "success");
		await renderQuienesSomos();
	} catch (error) {
		console.error("Error guardando testimonio de Quiénes Somos:", error);
		showToast(`No se pudo guardar el testimonio ${targetPosition}.`, "danger");
	}
}

	function getFilteredPublicaciones() {
		const searchTerm = String(stateFilters.search || "").trim().toLowerCase();
		const estadoFilter = String(stateFilters.estado || "todos");

		return state.publicaciones.filter((item) => {
			const titleMatch = !searchTerm || String(item.titulo || "").trim().toLowerCase().includes(searchTerm);
			const estadoMatch = estadoFilter === "todos" || String(item.estado || "").toLowerCase() === estadoFilter;
			return titleMatch && estadoMatch;
		});
	}

	async function onSiteMediaInputChange(event) {
		const target = event.target;
		if (!(target instanceof HTMLInputElement) || !target.matches("[data-site-media-input]")) {
			return;
		}

		const section = target.dataset.section;
		const position = Number(target.dataset.position || 0);
		const file = target.files && target.files[0] ? target.files[0] : null;
		if (!file || !section || !position) {
			target.value = "";
			return;
		}

		try {
			const currentRows = await SiteMediaService.listBySection(section);
			const currentRow = currentRows.find((item) => Number(item.position) === position) || null;
			await SiteMediaService.save(section, position, file, currentRow);
			showToast("La imagen se guardó correctamente.", "success");
			await renderProductos();
		} catch (error) {
			console.error("Error guardando imagen del sitio:", error);
			showToast(error && error.message ? error.message : "No se pudo guardar la imagen.", "danger");
		} finally {
			target.value = "";
		}
	}

	async function onSiteMediaActionClick(event) {
		const target = event.target.closest("[data-site-media-action]");
		if (!target) {
			return;
		}

		const action = target.dataset.siteMediaAction;
		const section = target.dataset.section;
		const position = Number(target.dataset.position || 0);

		if (action === "add") {
			const currentRows = await SiteMediaService.listBySection(section);
			const nextPosition = getNextAvailableSiteMediaPosition(currentRows, 4);
			if (nextPosition === null) {
				showToast("Ya existen 4 imágenes en esta sección. Elimina o reemplaza una para agregar otra.", "warning");
				return;
			}

			const input = document.querySelector(`input[data-site-media-input][data-section="${section}"][data-position="${nextPosition}"]`);
			if (input) {
				input.click();
			}
			return;
		}

		if (!section || !position) {
			return;
		}

		if (action === "replace") {
			const input = document.querySelector(`input[data-site-media-input][data-section="${section}"][data-position="${position}"]`);
			if (input) {
				input.click();
			}
			return;
		}

		if (action === "delete") {
			const currentRows = await SiteMediaService.listBySection(section);
			const currentRow = currentRows.find((item) => Number(item.position) === position) || null;
			if (!currentRow) {
				return;
			}

			const confirmDelete = window.confirm("¿Eliminar esta imagen del sitio? Esta acción solo afecta la imagen seleccionada.");
			if (!confirmDelete) {
				return;
			}

			try {
				await SiteMediaService.remove(section, position, currentRow);
				showToast("La imagen se eliminó correctamente.", "success");
				await renderProductos();
			} catch (error) {
				console.error("Error eliminando imagen del sitio:", error);
				showToast(error && error.message ? error.message : "No se pudo eliminar la imagen.", "danger");
			}
		}
	}

	function onContentInput(event) {
		const target = event.target;
		if (!(target instanceof HTMLElement)) {
			return;
		}

		if (target.matches("[data-role='publication-search']")) {
			stateFilters.search = target.value;
			renderPublicaciones();
			return;
		}

		if (target.matches("[data-role='publication-state-filter']")) {
			stateFilters.estado = target.value;
			renderPublicaciones();
			return;
		}

		if (target.matches("[data-role='product-search']")) {
			productoStateFilters.search = target.value;
			renderProductos();
			return;
		}

		if (target.matches("[data-role='product-state-filter']")) {
			productoStateFilters.estado = target.value;
			renderProductos();
		}
	}

	function getFilteredProductos() {
		const searchTerm = String(productoStateFilters.search || "").trim().toLowerCase();
		const estadoFilter = String(productoStateFilters.estado || "todos");

		return state.productos.filter((item) => {
			const titleMatch = !searchTerm || String(item.titulo || "").trim().toLowerCase().includes(searchTerm);
			const estadoMatch = estadoFilter === "todos" || String(item.estado || "").toLowerCase() === estadoFilter;
			return titleMatch && estadoMatch;
		});
	}

	function getDefaultSiteMediaImage(section, position) {
		if (section === "promo_banner") {
			return DEFAULT_PROMO_BANNER_IMAGE.image_url || DEFAULT_PROMO_BANNER_IMAGES[0]?.image_url || "images/servi.png";
		}

		return "";
	}

	function getNextAvailableSiteMediaPosition(existingRows = [], limit = 4) {
		const occupied = new Set(
			(existingRows || [])
				.map((item) => Number(item.position) || 0)
				.filter((position) => Number.isInteger(position) && position >= 1 && position <= limit)
		);

		for (let position = 1; position <= limit; position += 1) {
			if (!occupied.has(position)) {
				return position;
			}
		}

		return null;
	}

	async function renderSiteMediaManagement() {
		try {
			const [curatedMedia, promoMedia] = await Promise.all([
				SiteMediaService.listBySection("curated_grid"),
				SiteMediaService.listBySection("promo_banner")
			]);

			function buildSlot(section, position, record) {
				const defaultImageUrl = section === "promo_banner" ? getDefaultSiteMediaImage(section, position) : "";
				const preview = record
					? `
						<div class="site-media-image-box">
							<img src="${escapeHtml(record.image_url)}"
								 alt="Imagen ${position}"
								 class="site-media-thumb">
						</div>
					  `
					: section === "promo_banner" && defaultImageUrl
						? `
							<div class="site-media-image-box">
								<img src="${escapeHtml(defaultImageUrl)}"
									 alt="Imagen ${position}"
									 class="site-media-thumb">
							</div>
						  `
						: `<div class="site-media-image-box site-media-empty">Sin imagen</div>`;

				const fileInput = `
					<input type="file" class="d-none" data-site-media-input data-section="${section}" data-position="${position}" accept="image/jpeg,image/png,image/webp">
				`;

				const actionButtons = record
					? `
						<div class="d-flex gap-2 flex-wrap mt-2">
							<button type="button" class="btn btn-outline-primary btn-sm" data-site-media-action="replace" data-section="${section}" data-position="${position}" data-site-media-id="${record.id}">Reemplazar</button>
							<button type="button" class="btn btn-outline-danger btn-sm" data-site-media-action="delete" data-section="${section}" data-position="${position}" data-site-media-id="${record.id}">Eliminar</button>
							${fileInput}
						</div>
					`
					: `
						<div class="d-flex gap-2 flex-wrap mt-2">
							<label class="btn btn-primary btn-sm mb-0 cursor-pointer">
								Seleccionar imagen
								${fileInput}
							</label>
						</div>
					`;

				return `
					<div class="col-12 col-md-6 col-xl-3">
						<div class="card h-100 border-0 shadow-sm">
							<div class="card-body d-flex flex-column gap-2">
								<div class="fw-semibold small text-secondary">Imagen ${position}</div>
								<div class="site-media-preview">${preview}</div>
								${actionButtons}
							</div>
						</div>
					</div>
				`;
			}

			const curatedByPosition = new Map();
			(curatedMedia || []).forEach((item) => {
				const position = Number(item.position);
				if (!Number.isInteger(position) || position < 1 || position > 4) {
					return;
				}
				if (!curatedByPosition.has(position)) {
					curatedByPosition.set(position, item);
				}
			});
			const curatedSlots = Array.from({ length: 4 }, (_, index) => buildSlot("curated_grid", index + 1, curatedByPosition.get(index + 1) || null)).join("");
			const promoByPosition = new Map();
			(promoMedia || []).forEach((item) => {
				const position = Number(item.position);
				if (!Number.isInteger(position) || position < 1 || position > 4) {
					return;
				}
				if (!promoByPosition.has(position)) {
					promoByPosition.set(position, item);
				}
			});
			const promoSorted = Array.from(promoByPosition.values()).sort((a, b) => Number(a.position || 1) - Number(b.position || 1));
			const promoSlots = promoSorted.length
				? promoSorted.map((item) => buildSlot("promo_banner", Number(item.position) || 1, item)).join("")
				: buildSlot("promo_banner", 1, null);
			const nextPromoPosition = getNextAvailableSiteMediaPosition(promoSorted, 4);
			const showAddPromoButton = nextPromoPosition !== null;
			const addPromoInput = nextPromoPosition !== null ? `
				<input type="file" class="d-none" data-site-media-input data-section="promo_banner" data-position="${nextPromoPosition}" accept="image/jpeg,image/png,image/webp">
			` : "";
			const addPromoButtonMarkup = showAddPromoButton
				? `
					<div class="d-flex justify-content-end mt-3">
						<label class="btn btn-outline-primary btn-sm mb-0 cursor-pointer">
							Agregar otra imagen
							${addPromoInput}
						</label>
					</div>
				`
				: "";

			return `
				<section class="mb-4">
					<div class="hero-panel mb-3">
						<div class="hero-copy">
							<p class="hero-eyebrow mb-2">Imágenes del sitio</p>
							<h2 class="h4 mb-0">Imágenes de servicios</h2>
						</div>
					</div>

					<div class="card border-0 shadow-sm mb-3">
						<div class="card-body">
							<div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
								<h3 class="h5 mb-0">Galería Curated Grid</h3>
								<span class="text-secondary small">Máximo 4 imágenes</span>
							</div>
							<div class="row g-3">${curatedSlots}</div>
						</div>
					</div>

					<div class="card border-0 shadow-sm">
						<div class="card-body">
							<div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
								<h3 class="h5 mb-0">Banner promocional</h3>
								<span class="text-secondary small">${promoSorted.length ? `${promoSorted.length} imagen${promoSorted.length > 1 ? "es" : ""}` : "1 imagen"}</span>
							</div>
							<div class="row g-3">${promoSlots}</div>
							${addPromoButtonMarkup}
						</div>
					</div>
				</section>
			`;
		} catch (error) {
			console.error("Error cargando imágenes del sitio:", error);
			return `
				<section class="mb-4">
					<div class="alert alert-warning mb-0" role="alert"> No se pudieron cargar las imágenes del sitio. Revisa la configuración de Supabase y la tabla <strong>site_media</strong>. </div>
				</section>
			`;
		}
	}

	async function renderProductos() {
		try {
			state.productos = await ProductosService.list();
			const filteredProductos = getFilteredProductos();
			const siteMediaManagementHtml = await renderSiteMediaManagement();
			const rows = filteredProductos.map((item) => `
				<tr data-product-id="${item.id}">
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
					<td>${escapeHtml(String(item.orden ?? 0))}</td>
					<td class="text-end">
						<div class="btn-group btn-group-sm" role="group">
							<button class="btn btn-outline-primary" data-action="edit-product">Editar</button>
							<button class="btn btn-outline-secondary" data-action="toggle-product-estado">Estado</button>
							<button class="btn btn-outline-danger" data-action="delete-product">Eliminar</button>
						</div>
					</td>
				</tr>
			`).join("");

			const tableContent = filteredProductos.length > 0
				? `
					<div class="table-wrap p-2 p-md-3">
						<div class="table-responsive">
							<table class="table align-middle mb-0">
								<thead>
									<tr>
										<th style="width:90px;">Imagen</th>
										<th>Titulo</th>
										<th>Estado</th>
										<th>Orden</th>
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
						<p class="text-secondary text-uppercase small fw-semibold mb-2">Servicios</p>
						<h3 class="h5 mb-2">No se encontraron servicios</h3>
						<p class="text-secondary mb-4">No hay resultados para "${escapeHtml(productoStateFilters.search)}" con el filtro seleccionado.</p>
						<button class="btn btn-primary" data-action="new-product">Crear nuevo servicio</button>
					</div>
				`;

			refs.contentArea.innerHTML = `
				<section class="hero-panel mb-4">
					<div class="hero-copy">
						<p class="hero-eyebrow mb-2">NEXT LEVEL PRODUCCIONES</p>
						<h1 class="h3 mb-2">Servicios</h1>
					</div>
					<div class="hero-actions">
						<button class="btn btn-primary" data-action="new-product">Nuevo servicio</button>
					</div>
				</section>

				<div class="row g-3 mb-4">
					<div class="col-12 col-md-4"><div class="card card-stat h-100"><div class="card-body"><p class="text-secondary mb-2">Total</p><p class="value mb-0">${state.productos.length}</p></div></div></div>
					<div class="col-12 col-md-4"><div class="card card-stat h-100"><div class="card-body"><p class="text-secondary mb-2">Publicados</p><p class="value mb-0 text-success">${state.productos.filter((item) => item.estado === "publicado").length}</p></div></div></div>
					<div class="col-12 col-md-4"><div class="card card-stat h-100"><div class="card-body"><p class="text-secondary mb-2">Borradores</p><p class="value mb-0 text-warning">${state.productos.filter((item) => item.estado === "borrador").length}</p></div></div></div>
				</div>

				<div class="row g-2 mb-3 align-items-end">
					<div class="col-12 col-md-8">
						<label for="productSearch" class="form-label small mb-1 text-secondary">Buscar por titulo</label>
						<input id="productSearch" data-role="product-search" type="text" class="form-control" value="${escapeHtml(productoStateFilters.search)}" placeholder="Escribe el titulo del servicio">
					</div>
					<div class="col-12 col-md-4">
						<label for="productStateFilter" class="form-label small mb-1 text-secondary">Estado</label>
						<select id="productStateFilter" data-role="product-state-filter" class="form-select">
							<option value="todos" ${productoStateFilters.estado === "todos" ? "selected" : ""}>Todos</option>
							<option value="publicado" ${productoStateFilters.estado === "publicado" ? "selected" : ""}>Publicado</option>
							<option value="borrador" ${productoStateFilters.estado === "borrador" ? "selected" : ""}>Borrador</option>
						</select>
					</div>
				</div>

				${siteMediaManagementHtml}
				${tableContent}
			`;
		} catch (error) {
			console.error("Error cargando servicios:", error);
			refs.contentArea.innerHTML = `
				<section class="hero-panel mb-4">
					<div class="hero-copy">
						<p class="hero-eyebrow mb-2">Dashboard privado</p>
						<h1 class="h3 mb-2">Servicios</h1>
						<p class="text-danger mb-2">No se pudo cargar el modulo de servicios.</p>
						<p class="text-secondary mb-0">${escapeHtml(error && error.message ? error.message : "Error desconocido al consultar Supabase.")}</p>
					</div>
					<div class="hero-actions">
						<button class="btn btn-primary" data-action="new-product">Nuevo servicio</button>
					</div>
				</section>
			`;
		}
	}

	function handleProductoModalCloseAttempt() {
		const hasChanges = refs.productoTitulo.value.trim() || refs.productoDescripcion.value.trim() || refs.productoImagen.files && refs.productoImagen.files.length > 0 || refs.productoTextoBadge.value.trim() || refs.productoTextoMeta.value.trim() || refs.productoEstado.value !== "borrador" || refs.productoOrden.value !== "0";
		if (!hasChanges) {
			closeProductoModal();
			return;
		}

		const shouldLeave = window.confirm("Hay cambios sin guardar en el servicio. ¿Deseas salir?");
		if (shouldLeave) {
			closeProductoModal();
		}
	}

	function closeProductoModal() {
		refs.productoForm.reset();
		refs.productoFormError.classList.add("d-none");
		refs.productoFormError.textContent = "";
		refs.productoForm.classList.remove("was-validated");
		refs.productoId.value = "";
		refs.existingProductoImageUrl.value = "";
		refs.productoImagen.value = "";
		refs.productoImagePreview.src = "";
		refs.productoImagePreviewWrapper.classList.add("d-none");
		refs.productoModalLabel.textContent = "Nuevo servicio";
		refs.saveProductoText.textContent = "Guardar servicio";
		resetProductoStyles();
		refs.productoEstado.value = "borrador";
		refs.productoOrden.value = "0";
		productoModal.hide();
	}

	function onProductoImageChange(event) {
		const input = event.target;
		const file = input && input.files && input.files[0] ? input.files[0] : null;
		const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

		if (!file) {
			refs.productoImagePreviewWrapper.classList.add("d-none");
			refs.productoImagePreview.src = "";
			return;
		}

		if (input.files.length > 1) {
			refs.productoFormError.textContent = "Solo se permite una imagen por servicio.";
			refs.productoFormError.classList.remove("d-none");
			input.value = "";
			refs.productoImagePreviewWrapper.classList.add("d-none");
			refs.productoImagePreview.src = "";
			return;
		}

		if (!allowedTypes.includes(file.type)) {
			refs.productoFormError.textContent = "La imagen debe ser JPG, PNG o WebP.";
			refs.productoFormError.classList.remove("d-none");
			input.value = "";
			refs.productoImagePreviewWrapper.classList.add("d-none");
			refs.productoImagePreview.src = "";
			return;
		}

		refs.productoFormError.classList.add("d-none");
		refs.productoFormError.textContent = "";
		const previewUrl = URL.createObjectURL(file);
		refs.productoImagePreview.src = previewUrl;
		refs.productoImagePreviewWrapper.classList.remove("d-none");
	}

	function openProductoModal(producto = null) {
		const isEditing = Boolean(producto && producto.id);
		refs.productoForm.reset();
		refs.productoForm.classList.remove("was-validated");
		refs.productoFormError.classList.add("d-none");
		refs.productoFormError.textContent = "";
		refs.productoId.value = producto ? producto.id : "";
		refs.existingProductoImageUrl.value = producto ? (producto.imagen_url || "") : "";
		refs.productoTitulo.value = producto ? (producto.titulo || "") : "";
		refs.productoDescripcion.value = producto ? (producto.descripcion || "") : "";
		refs.productoImagen.value = "";
		refs.productoImagePreview.src = "";
		refs.productoImagePreviewWrapper.classList.toggle("d-none", !producto?.imagen_url);
		if (producto && producto.imagen_url) {
			refs.productoImagePreview.src = producto.imagen_url;
			refs.productoImagePreviewWrapper.classList.remove("d-none");
		}
		refs.productoTextoBadge.value = producto ? (producto.texto_badge || "") : "";
		refs.productoTextoMeta.value = producto ? (producto.texto_meta || "") : "";
		const estilos = producto && producto.estilos_texto ? producto.estilos_texto : {};
		const tituloEstilos = estilos.titulo || {};
		const descripcionEstilos = estilos.descripcion || {};
		refs.productoTituloFuente.value = tituloEstilos.fuente || "";
		refs.productoTituloAlineacion.value = tituloEstilos.alineacion || "";
		refs.productoTituloTamano.value = tituloEstilos.tamano || "";
		refs.productoTituloPeso.value = tituloEstilos.peso || "";
		refs.productoTituloEstilo.value = tituloEstilos.estilo || "";
		refs.productoTituloColor.value = tituloEstilos.color || "#111827";
		refs.productoDescripcionFuente.value = descripcionEstilos.fuente || "";
		refs.productoDescripcionAlineacion.value = descripcionEstilos.alineacion || "";
		refs.productoDescripcionTamano.value = descripcionEstilos.tamano || "";
		refs.productoDescripcionPeso.value = descripcionEstilos.peso || "";
		refs.productoDescripcionEstilo.value = descripcionEstilos.estilo || "";
		refs.productoDescripcionColor.value = descripcionEstilos.color || "#4b5563";
		refs.productoEstado.value = producto ? (producto.estado || "borrador") : "borrador";
		refs.productoOrden.value = producto ? (String(producto.orden ?? 0)) : "0";
		refs.productoModalLabel.textContent = isEditing ? "Editar servicio" : "Nuevo servicio";
		refs.saveProductoText.textContent = isEditing ? "Actualizar servicio" : "Guardar servicio";
		updateProductoPreview();
		productoModal.show();
	}

	function buildProductoEstilosTexto() {
		const buildSection = (prefix, titleField, descriptionField) => {
			const section = {};
			const values = {
				fuente: document.getElementById(`${prefix}Fuente`)?.value || "",
				alineacion: document.getElementById(`${prefix}Alineacion`)?.value || "",
				tamano: document.getElementById(`${prefix}Tamano`)?.value || "",
				peso: document.getElementById(`${prefix}Peso`)?.value || "",
				estilo: document.getElementById(`${prefix}Estilo`)?.value || "",
				color: document.getElementById(`${prefix}Color`)?.value || ""
			};

			Object.entries(values).forEach(([key, value]) => {
				if (!value) {
					return;
				}
				section[key] = value;
			});

			return Object.keys(section).length > 0 ? section : null;
		};

		const estilosTexto = {};
		const tituloStyles = buildSection("productoTitulo", "titulo", "");
		const descripcionStyles = buildSection("productoDescripcion", "", "descripcion");

		if (tituloStyles) {
			estilosTexto.titulo = tituloStyles;
		}
		if (descripcionStyles) {
			estilosTexto.descripcion = descripcionStyles;
		}

		return Object.keys(estilosTexto).length > 0 ? estilosTexto : null;
	}

	function updateProductoPreview() {
		const title = refs.productoTitulo.value.trim() || "Título de ejemplo";
		const description = refs.productoDescripcion.value.trim() || "Descripción de ejemplo";
		const titleStyles = {
			textAlign: refs.productoTituloAlineacion.value || "left",
			fontFamily: refs.productoTituloFuente.value || "inherit",
			fontSize: refs.productoTituloTamano.value === "small" ? "1rem" : refs.productoTituloTamano.value === "large" ? "1.7rem" : "1.4rem",
			fontWeight: refs.productoTituloPeso.value === "semibold" ? "600" : refs.productoTituloPeso.value === "bold" ? "800" : "400",
			fontStyle: refs.productoTituloEstilo.value === "italic" ? "italic" : "normal",
			color: refs.productoTituloColor.value || "#111827"
		};
		const descriptionStyles = {
			textAlign: refs.productoDescripcionAlineacion.value || "left",
			fontFamily: refs.productoDescripcionFuente.value || "inherit",
			fontSize: refs.productoDescripcionTamano.value === "small" ? "0.85rem" : refs.productoDescripcionTamano.value === "large" ? "1.05rem" : "1rem",
			fontWeight: refs.productoDescripcionPeso.value === "semibold" ? "600" : refs.productoDescripcionPeso.value === "bold" ? "800" : "400",
			fontStyle: refs.productoDescripcionEstilo.value === "italic" ? "italic" : "normal",
			color: refs.productoDescripcionColor.value || "#4b5563"
		};

		Object.assign(refs.productoPreviewTitulo.style, titleStyles);
		refs.productoPreviewTitulo.textContent = title;
		Object.assign(refs.productoPreviewDescripcion.style, descriptionStyles);
		refs.productoPreviewDescripcion.textContent = description;
		refs.productoPreviewDescripcion.style.display = description ? "block" : "none";
	}

	function resetProductoStyles() {
		refs.productoTituloFuente.value = "";
		refs.productoTituloAlineacion.value = "";
		refs.productoTituloTamano.value = "";
		refs.productoTituloPeso.value = "";
		refs.productoTituloEstilo.value = "";
		refs.productoTituloColor.value = "#111827";
		refs.productoDescripcionFuente.value = "";
		refs.productoDescripcionAlineacion.value = "";
		refs.productoDescripcionTamano.value = "";
		refs.productoDescripcionPeso.value = "";
		refs.productoDescripcionEstilo.value = "";
		refs.productoDescripcionColor.value = "#4b5563";
		updateProductoPreview();
	}

	function validateProductoPayload(payload, { imageFile = null, existingImageUrl = "" } = {}) {
		const titulo = String(payload.titulo || "").trim();
		const descripcion = String(payload.descripcion || "").trim();
		const badge = String(payload.texto_badge || "").trim();
		const meta = String(payload.texto_meta || "").trim();
		const estado = String(payload.estado || "").trim();
		const hasExistingImage = Boolean(String(existingImageUrl || "").trim());
		const hasSelectedFile = Boolean(imageFile && imageFile instanceof File);

		if (!titulo || titulo.length < 3 || titulo.length > 160) {
			return "El título del servicio es obligatorio y debe tener entre 3 y 160 caracteres.";
		}

		if (!hasExistingImage && !hasSelectedFile) {
			return "La imagen principal es obligatoria.";
		}

		if (imageFile && !["image/jpeg", "image/png", "image/webp"].includes(imageFile.type)) {
			return "La imagen debe ser JPG, PNG o WebP.";
		}

		if (!badge) {
			return "El texto del badge es obligatorio.";
		}

		if (!meta) {
			return "El texto meta es obligatorio.";
		}

		if (descripcion && descripcion.length > 1200) {
			return "La descripción no puede superar 1200 caracteres.";
		}

		if (estado !== "borrador" && estado !== "publicado") {
			return "El estado debe ser 'borrador' o 'publicado'.";
		}

		return null;
	}

	async function onProductoSubmit(event) {
		event.preventDefault();
		refs.productoFormError.classList.add("d-none");
		refs.productoFormError.textContent = "";

		const productoId = refs.productoId.value.trim();
		const selectedFile = refs.productoImagen && refs.productoImagen.files && refs.productoImagen.files.length > 0
			? refs.productoImagen.files[0]
			: null;
		const existingImageUrl = refs.existingProductoImageUrl.value.trim();
		const payload = {
			titulo: refs.productoTitulo.value,
			descripcion: refs.productoDescripcion.value,
			texto_badge: refs.productoTextoBadge.value.trim() || null,
			texto_meta: refs.productoTextoMeta.value.trim() || null,
			estilos_texto: buildProductoEstilosTexto(),
			estado: refs.productoEstado.value,
			orden: Number(refs.productoOrden.value || 0)
		};

		const validationError = validateProductoPayload(payload, { imageFile: selectedFile, existingImageUrl });
		if (validationError) {
			refs.productoForm.classList.add("was-validated");
			refs.productoFormError.textContent = validationError;
			refs.productoFormError.classList.remove("d-none");
			return;
		}

		refs.saveProductoBtn.disabled = true;
		refs.saveProductoSpinner.classList.remove("d-none");
		refs.saveProductoText.textContent = productoId ? "Actualizando..." : "Guardando...";

		try {
			if (productoId) {
				await ProductosService.update(productoId, payload, selectedFile, existingImageUrl);
				showToast("Servicio actualizado correctamente.", "success");
			} else {
				await ProductosService.create(payload, selectedFile);
				showToast("Servicio creado correctamente.", "success");
			}

			closeProductoModal();
			await renderProductos();
		} catch (error) {
			console.error("Error al guardar producto:", error);
			refs.productoFormError.textContent = error && error.message ? error.message : "No se pudo guardar el servicio.";
			refs.productoFormError.classList.remove("d-none");
			showToast("La operación no se completó. El servicio no se guardó.", "danger");
		} finally {
			refs.saveProductoBtn.disabled = false;
			refs.saveProductoSpinner.classList.add("d-none");
			refs.saveProductoText.textContent = productoId ? "Actualizar servicio" : "Guardar servicio";
		}
	}

	async function toggleProductoEstado(producto) {
		const nextState = producto.estado === "publicado" ? "borrador" : "publicado";
		const label = nextState === "publicado" ? "Publicado" : "Borrador";
		const shouldToggle = window.confirm(`¿Cambiar el estado de "${producto.titulo}" a ${label}?`);
		if (!shouldToggle) {
			return;
		}

		try {
			await ProductosService.toggleEstado(producto.id, producto.estado);
			showToast(`El servicio "${producto.titulo}" cambió a ${label}.`, "success");
			await renderProductos();
		} catch (error) {
			console.error("Error al cambiar estado del producto:", error);
			showToast(`La operación no se completó. No se cambió el estado de "${producto.titulo}".`, "danger");
		}
	}

	async function deleteProducto(producto) {
		const confirmDelete = window.confirm(`Se eliminará el servicio "${producto.titulo}". Esta acción no puede recuperarse. ¿Continuar?`);
		if (!confirmDelete) {
			return;
		}

		try {
			await ProductosService.remove(producto.id, producto.imagen_url);
			showToast(`El servicio "${producto.titulo}" fue eliminado correctamente.`, "success");
			await renderProductos();
		} catch (error) {
			console.error("Error al eliminar producto:", error);
			showToast(`La operación no se completó. El servicio "${producto.titulo}" no se eliminó.`, "danger");
		}
	}

	async function renderInicio() {
    refs.contentArea.classList.remove("inicio-web-view");
    refs.contentArea.innerHTML = `
        <section class="hero-panel admin-home-panel mb-4">
            <div class="hero-copy">
                <p class="hero-eyebrow mb-2">
                    Panel Administrativo privado
                </p>

                <h1 class="h2 mb-3">
                    Bienvenido
                </h1>

                <p class="text-secondary mb-0">
                    Administra y actualiza el contenido de
                    <strong>Next Level Producciones</strong>
                    desde las diferentes secciones disponibles.
                </p>
            </div>
        </section>

        <section class="admin-home-access">
            <div class="row g-3">

                <!-- INICIO WEB -->
                <div class="col-12 col-md-6">
                    <button
                        type="button"
                        class="card admin-access-card h-100 w-100 text-start"
                        data-action="go-inicio-web"
                    >
                        <div class="card-body d-flex flex-column">

                            <div class="admin-access-icon">
                                🌐
                            </div>

                            <h2 class="h5 mb-2">
                                Inicio 
                            </h2>

                            <p class="text-secondary mb-4">
                                Administra y actualiza el contenido
                                de la página principal del sitio web.
                            </p>

                            <span class="admin-access-action mt-auto">
                                Administrar página principal
                                <span aria-hidden="true">→</span>
                            </span>

                        </div>
                    </button>
                </div>

                <!-- PUBLICACIONES -->
                <div class="col-12 col-md-6">
                    <button type="button"
                        class="card admin-access-card h-100 w-100 text-start"
                        data-action="go-publicaciones" >
                        <div class="card-body d-flex flex-column">

                            <div class="admin-access-icon">
                                📋
                            </div>
                            <h2 class="h5 mb-2"> Eventos </h2>
                            <p class="text-secondary mb-4">
                                Administra actividades, eventos y publicaciones.
                            </p>
                            <span class="admin-access-action mt-auto">
                                Administrar Eventos
                                <span aria-hidden="true">→</span>
                            </span>
                        </div>
                    </button>
                </div>

                <!-- SERVICIOS -->
                <div class="col-12 col-md-6">
                    <button type="button"
                        class="card admin-access-card h-100 w-100 text-start"
                        data-action="go-productos" >
                        <div class="card-body d-flex flex-column">
                            <div class="admin-access-icon"> 🎬 </div>
                            <h2 class="h5 mb-2"> Servicios </h2>
                            <p class="text-secondary mb-4">
                                Gestiona los servicios, imágenes y contenido de esta sección.
                            </p>

                            <span class="admin-access-action mt-auto">
                                Administrar servicios
                                <span aria-hidden="true">→</span>
                            </span>

                        </div>
                    </button>
                </div>

                <!-- QUIÉNES SOMOS -->
                <div class="col-12 col-md-6">
                    <button type="button"
                        class="card admin-access-card h-100 w-100 text-start"
                        data-action="go-quienes" >
                        <div class="card-body d-flex flex-column">
                            <div class="admin-access-icon"> 👥 </div>
                            <h2 class="h5 mb-2"> Quiénes Somos </h2>
                            <p class="text-secondary mb-4">
                                Administra la información deNext Level Producciones.
                            </p>

                            <span class="admin-access-action mt-auto">
                                Administrar información
                                <span aria-hidden="true">→</span>
                            </span>
                        </div>
                    </button>
                </div>

            </div>
        </section>

        <div class="section-note mt-4">
            <span class="section-chip">
                Next Level Producciones
            </span>

            <span class="section-chip">
                CMS Administrativo
            </span>
        </div>
    `;
}
async function loadInicioWebSavedTexts() {
    const elementos = [
        "hero_eyebrow",
        "hero_titulo",
        "hero_boton",
        "banner1_tag",
        "banner1_titulo",
        "banner1_descripcion",
        "banner2_tag",
        "banner2_titulo",
        "banner2_descripcion",
        "galeria_titulo"
    ];

    const textos = {};

    for (const elemento of elementos) {
        try {
            const resultado =
                await window.InicioWebService.getText(elemento);

            if (resultado?.contenido) {
                textos[elemento] = resultado.contenido;
            }
        } catch (error) {
            console.error(
                `Error al cargar el texto de Inicio Web (${elemento}):`,
                error
            );
        }
    }

    window.inicioWebSavedTexts = textos;

    return textos;
}

async function renderInicioWeb() {
    refs.contentArea.classList.add("inicio-web-view");
    let galleryImages = [];
    let expertiseItems = [];
    let expertiseError = null;

    try {
        galleryImages = await window.InicioWebService.listGallery();
    } catch (error) {
        console.error("Error cargando galería de Inicio Web:", error);
        galleryImages = [];
    }

    try {
        expertiseItems = await window.InicioWebService.listExpertise();
    } catch (error) {
        console.error("Error cargando expertise de Inicio Web:", error);
        expertiseItems = [];
        expertiseError = error && error.message ? error.message : "No se pudo cargar la sección de Expertise.";
    }

    const galleryItems = (galleryImages || []).map((item) => `
        <div class="col-12 col-md-4 col-xl-3">
            <div class="card h-100 border-0 shadow-sm">
                <div class="position-relative">
                    <img src="${escapeHtml(item.image_url || "")}" alt="Imagen de galería" class="img-fluid w-100" style="height: 220px; object-fit: cover; border-radius: 0.75rem 0.75rem 0 0;">
                </div>
                <div class="card-body d-flex flex-column gap-2">
                    <span class="badge ${item.is_visible ? "text-bg-success" : "text-bg-secondary"} align-self-start">
                        ${item.is_visible ? "Activa" : "Inactiva"}
                    </span>
                    <div class="d-flex gap-2">
                        <button type="button" class="btn btn-sm ${item.is_visible ? "btn-outline-secondary" : "btn-outline-success"} w-100" data-action="inicio-web-gallery-toggle" data-id="${item.id}" data-visible="${String(Boolean(item.is_visible))}">
                            ${item.is_visible ? "Desactivar" : "Activar"}
                        </button>
                        <button type="button" class="btn btn-outline-danger btn-sm" data-action="inicio-web-gallery-delete" data-id="${item.id}" data-storage-path="${escapeHtml(item.storage_path || "")}">
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join("");

    function isValidExpertiseVideoUrl(value) {
        const rawUrl = typeof value === "string" ? value.trim() : "";

        if (!rawUrl) {
            return false;
        }

        try {
            const parsedUrl = new URL(rawUrl, window.location.href);
            const protocol = parsedUrl.protocol.toLowerCase();
            return ["http:", "https:", "blob:", "data:"].includes(protocol);
        } catch (error) {
            return false;
        }
    }

    function buildExpertiseVideoPreviewMarkup(item) {
        const fallbackVideoUrl = "videos/vid.mp4";
        const rawVideoUrl = typeof item?.video_url === "string" ? item.video_url.trim() : "";
        const hasVideoUrl = isValidExpertiseVideoUrl(rawVideoUrl);

        const safeService = window.InicioWebService || {};
        const videoType = hasVideoUrl && typeof safeService.detectExpertiseVideoType === "function"
            ? safeService.detectExpertiseVideoType(rawVideoUrl)
            : "direct-video";
        const safeVideoUrl = escapeHtml(hasVideoUrl ? rawVideoUrl : fallbackVideoUrl);

        try {
            if (videoType === "direct-video") {
                return `
                    <video
                        controls
                        muted
                        playsinline
                        preload="metadata"
                        src="${safeVideoUrl}"
                        class="img-fluid w-100"
                        style="height: 220px; object-fit: cover; border-radius: 0.75rem 0.75rem 0 0; background: #0b1220;"
                    ></video>
                `;
            }

            if (["youtube", "vimeo"].includes(videoType)) {
                const embedUrl = typeof safeService.getExpertiseVideoEmbedUrl === "function"
                    ? safeService.getExpertiseVideoEmbedUrl(rawVideoUrl || fallbackVideoUrl)
                    : "";

                if (embedUrl) {
                    return `
                        <div class="position-relative w-100 overflow-hidden" style="height: 220px; border-radius: 0.75rem 0.75rem 0 0; background: #0b1220;">
                            <iframe
                                src="${escapeHtml(embedUrl)}"
                                class="w-100 h-100 border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowfullscreen
                                loading="lazy"
                                referrerpolicy="strict-origin-when-cross-origin"
                                title="Video de expertise"
                            ></iframe>
                        </div>
                    `;
                }
            }

            if (["tiktok", "instagram", "facebook"].includes(videoType)) {
                const linkValue = escapeHtml(rawVideoUrl || fallbackVideoUrl);
                return `
                    <div class="d-flex align-items-center justify-content-center text-center px-3" style="height: 220px; background: linear-gradient(135deg, #111827, #0b1220); border-radius: 0.75rem 0.75rem 0 0; color: #e5e7eb;">
                        <div>
                            <div class="fw-semibold mb-2">Enlace de video no compatible para vista previa.</div>
                            <a href="${linkValue}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-light">Abrir enlace</a>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error("Error renderizando la vista previa de expertise:", error);
        }

        return `
            <video
                controls
                muted
                playsinline
                preload="metadata"
                src="${safeVideoUrl}"
                class="img-fluid w-100"
                style="height: 220px; object-fit: cover; border-radius: 0.75rem 0.75rem 0 0; background: #0b1220;"
            ></video>
        `;
    }

    const hasCustomVideo = Array.isArray(expertiseItems) && (
        window.InicioWebService &&
        typeof window.InicioWebService.isCustomExpertiseVideo === "function"
            ? expertiseItems.some((item) => window.InicioWebService.isCustomExpertiseVideo(item))
            : false
    );

    let expertiseItemsHtml = "";

    if (expertiseError) {
        expertiseItemsHtml = `
            <div class="col-12">
                <div class="border rounded-3 p-4 text-center text-warning bg-warning-subtle">
                    No se pudo cargar la sección de Expertise. Inténtalo nuevamente más tarde.
                </div>
            </div>
        `;
    } else {
        try {
            expertiseItemsHtml = (expertiseItems || []).map((item) => {
                const isVideo = item && item.media_type === "video";
                const previewUrl = isVideo
                    ? null
                    : (window.InicioWebService && typeof window.InicioWebService.buildExpertisePublicImageUrl === "function"
                        ? window.InicioWebService.buildExpertisePublicImageUrl(item.id)
                        : "");

                const previewMarkup = isVideo
                    ? buildExpertiseVideoPreviewMarkup(item)
                    : `<img src="${escapeHtml(previewUrl)}" alt="${escapeHtml(item.alt_text || "Imagen de expertise")}" class="img-fluid w-100" style="height: 220px; object-fit: cover; border-radius: 0.75rem 0.75rem 0 0;">`;

                return `
                    <div class="col-12 col-md-4 col-xl-3">
                        <div class="card h-100 border-0 shadow-sm">
                            <div class="position-relative">
                                ${previewMarkup}
                            </div>
                            <div class="card-body d-flex flex-column gap-2">
                                <div class="small text-uppercase fw-semibold text-secondary mb-1">
                                    ${isVideo ? "VIDEO PERSONALIZADO" : "IMAGEN"}
                                </div>
                                <div class="d-flex justify-content-between align-items-center gap-2">
                                    <span class="badge ${item.is_visible ? "text-bg-success" : "text-bg-secondary"} align-self-start">
                                        ${item.is_visible ? "Visible" : "Oculto"}
                                    </span>
                                </div>
                                <div class="d-flex gap-2">
                                    <button type="button" class="btn btn-sm ${item.is_visible ? "btn-outline-secondary" : "btn-outline-success"} w-100" data-action="inicio-web-expertise-toggle" data-id="${item.id}" data-visible="${String(Boolean(item.is_visible))}">
                                        ${item.is_visible ? "Ocultar" : "Mostrar"}
                                    </button>
                                    <button type="button" class="btn btn-outline-danger btn-sm" data-action="inicio-web-expertise-delete" data-id="${item.id}" data-media-type="${item.media_type || "image"}">
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join("");
        } catch (error) {
            console.error("Error renderizando la lista de expertise:", error);
            expertiseItemsHtml = `
                <div class="col-12">
                    <div class="border rounded-3 p-4 text-center text-warning bg-warning-subtle">
                        No se pudo renderizar the sección de Expertise por un error de contenido.
                    </div>
                </div>
            `;
        }
    }

    refs.contentArea.innerHTML = `
        <section class="hero-panel mb-4">
            <div class="hero-copy">
                <p class="hero-eyebrow mb-2"> INICIO WEB </p>
                <h1 class="h3 mb-2"> Página principal </h1>
                <p class="text-secondary mb-0"> Personaliza el contenido y estilo visual de la página principal de Next Level Producciones. </p>
            </div>
        </section>

        <section class="card border-0 shadow-sm mb-4">
            <div class="card-body">
                <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
                    <div>
                        <p class="text-secondary text-uppercase small fw-semibold mb-1"> Apariencia </p>
                        <h2 class="h5 mb-1"> Tipografía </h2>
                        <p class="text-secondary small mb-0"> Personaliza la apariencia de los textos de la página principal. </p>
                    </div>
                    <span class="badge text-bg-secondary"> Editor visual </span>
                </div>
                <div class="mb-4">
                    <label for="inicioWebElementoTexto" class="form-label fw-semibold"> Elemento </label>
                    <select id="inicioWebElementoTexto" class="form-select" data-inicio-web-control="elemento">
                        <option value="hero_eyebrow"> Hero · Texto pequeño </option>
                        <option value="hero_titulo"> Hero · Título </option>
                        <option value="hero_boton"> Hero · Botón </option>
                        <option value="banner1_titulo"> Banner 1 · Título </option>
                        <option value="banner1_tag"> Banner 1 · Etiqueta </option>
                        <option value="banner1_descripcion"> Banner 1 · Descripción </option>
                        <option value="banner2_titulo"> Banner 2 · Título </option>
                        <option value="banner2_tag"> Banner 2 · Etiqueta </option>
                        <option value="banner2_descripcion"> Banner 2 · Descripción </option>
                        <option value="galeria_titulo"> Galería · Título </option>
                    </select>
                </div>
                <div class="row g-3">
                    <div class="col-12 col-md-6">
                        <label for="inicioWebFuente" class="form-label"> Fuente </label>
                        <select id="inicioWebFuente" class="form-select" data-inicio-web-control="fuente">
                            <option value="inherit"> Predeterminada del sitio </option>
                            <option value="Inter"> Inter </option>
                            <option value="Poppins"> Poppins </option>
                            <option value="Montserrat"> Montserrat </option>
                            <option value="Roboto"> Roboto </option>
                            <option value="Open Sans"> Open Sans </option>
                            <option value="Lato"> Lato </option>
                            <option value="Playfair Display"> Playfair Display </option>
                            <option value="Oswald"> Oswald </option>
                            <option value="Raleway"> Raleway </option>
                            <option value="Nunito"> Nunito </option>
                        </select>
                    </div>

                    <div class="col-12 col-md-6">
                        <label for="inicioWebPeso" class="form-label"> Peso </label>
                        <select id="inicioWebPeso" class="form-select" data-inicio-web-control="peso">
                            <option value="300">Light</option>
                            <option value="400" selected>Regular</option>
                            <option value="500">Medium</option>
                            <option value="600">SemiBold</option>
                            <option value="700">Bold</option>
                            <option value="800">ExtraBold</option>
                            <option value="900">Black</option>
                        </select>
                    </div>

                    <div class="col-12 col-md-6">
                        <label for="inicioWebTamano" class="form-label"> Tamaño </label>
                        <div class="input-group">
                            <input id="inicioWebTamano" type="number" class="form-control" data-inicio-web-control="tamano" value="48" min="8" max="160" step="1">
                            <span class="input-group-text"> px </span>
                        </div>
                    </div>

                    <div class="col-12 col-md-6">
                        <label for="inicioWebAlineacion" class="form-label"> Alineación </label>
                        <select id="inicioWebAlineacion" class="form-select" data-inicio-web-control="alineacion">
                            <option value="left">Izquierda</option>
                            <option value="center">Centro</option>
                            <option value="right">Derecha</option>
                            <option value="justify">Justificado</option>
                        </select>
                    </div>

                    <div class="col-12 col-md-4">
                        <label for="inicioWebEstilo" class="form-label"> Estilo </label>
                        <select id="inicioWebEstilo" class="form-select" data-inicio-web-control="estilo">
                            <option value="normal">Normal</option>
                            <option value="italic">Cursiva</option>
                        </select>
                    </div>

                    <div class="col-12 col-md-4">
                        <label for="inicioWebTransformacion" class="form-label"> Transformación </label>
                        <select id="inicioWebTransformacion" class="form-select" data-inicio-web-control="transformacion">
                            <option value="none">Normal</option>
                            <option value="uppercase">MAYÚSCULAS</option>
                            <option value="lowercase">minúsculas</option>
                            <option value="capitalize">Tipo título</option>
                        </select>
                    </div>

                    <div class="col-12 col-md-4">
                        <label for="inicioWebColor" class="form-label"> Color </label>
                        <input id="inicioWebColor" type="color" class="form-control form-control-color w-100" data-inicio-web-control="color" value="#ffffff" title="Seleccionar color">
                    </div>

                    <div class="col-12 col-md-6">
                        <label for="inicioWebLineHeight" class="form-label"> Altura de línea </label>
                        <input id="inicioWebLineHeight" type="number" class="form-control" data-inicio-web-control="lineHeight" value="1.2" min="0.8" max="3" step="0.1">
                    </div>

                    <div class="col-12 col-md-6">
                        <label for="inicioWebLetterSpacing" class="form-label"> Espaciado entre letras </label>
                        <div class="input-group">
                            <input id="inicioWebLetterSpacing" type="number" class="form-control" data-inicio-web-control="letterSpacing" value="0" min="-10" max="20" step="0.1">
                            <span class="input-group-text"> px </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="card border-0 shadow-sm mb-4">
            <div class="card-body">
                <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                    <div>
                        <p class="text-secondary text-uppercase small fw-semibold mb-1"> Vista previa </p>
                        <h2 class="h5 mb-0"> Así se verá el texto </h2>
                    </div>
                </div>
                <div id="inicioWebTypographyPreview" class="rounded-3 p-4 p-md-5 text-center" style="min-height:180px; display:flex; align-items:center; justify-content:center; background:rgba(11,18,32,.22);">
                    <div id="inicioWebTypographyPreviewText"> Transforma tus Ideas en Arte Visual. </div>
                </div>
            </div>
        </section>

        <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-outline-secondary" data-action="inicio-web-reset-typography"> Restaurar </button>
            <button type="button" class="btn btn-primary" data-action="inicio-web-save-typography"> Guardar cambios </button>
        </div>

        <section id="inicioWebTextEditor" class="card border-0 shadow-sm mt-4">
            <div class="card-body">
                <div class="mb-4">
                    <p class="text-secondary text-uppercase small fw-semibold mb-1"> Contenido </p>
                    <h2 class="h5 mb-1"> Editar texto </h2>
                    <p class="text-secondary small mb-0"> Modifica el contenido del elemento seleccionado de la página principal. </p>
                </div>

                <div class="mb-3">
                    <label for="inicioWebTextoElemento" class="form-label fw-semibold"> Elemento </label>
                    <select id="inicioWebTextoElemento" class="form-select"></select>
                </div>
                <div class="mb-4">
                    <label for="inicioWebTextoContenido" class="form-label fw-semibold"> Texto </label>
                    <textarea id="inicioWebTextoContenido" class="form-control" rows="6" placeholder="Escribe el texto..."></textarea>
                    <div class="form-text"> Puedes modificar el texto que aparecerá en la página principal. </div>
                </div>
                <div class="d-flex justify-content-end gap-2">
                    <button type="button" class="btn btn-outline-secondary" data-action="inicio-web-close-text"> Cerrar </button>
                    <button type="button" class="btn btn-primary" data-action="inicio-web-save-text"> Guardar texto</button>
                </div>
            </div>
        </section>
		<section>
		</section>
		<section class="card border-0 shadow-sm mb-4">
            <div class="card-body">
                <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
                    <div>
                        <p class="text-secondary text-uppercase small fw-semibold mb-1"> Fondos </p>
                        <h2 class="h5 mb-1"> Fondos de banners </h2>
                        <p class="text-secondary small mb-0"> Ajusta el degradado visual de los banners principales. </p>
                    </div>
                </div>

                <div class="row g-4">
                    <div class="col-12 col-md-6">
                        <div class="border rounded-3 p-3 h-100">
                            <h3 class="h6 mb-3">Banner 1</h3>
                            <div class="mb-3">
                                <label for="banner1BackgroundColor1" class="form-label">Color del degradado 1</label>
                                <input id="banner1BackgroundColor1" type="color" class="form-control form-control-color w-100" value="#090c11" aria-label="Color del degradado 1 del banner 1">
                            </div>
                            <div class="mb-3">
                                <label for="banner1BackgroundColor2" class="form-label">Color del degradado 2</label>
                                <input id="banner1BackgroundColor2" type="color" class="form-control form-control-color w-100" value="#454a52" aria-label="Color del degradado 2 del banner 1">
                            </div>
                            <div class="mb-3">
                                <label for="banner1BackgroundColor3" class="form-label">Color del degradado 3</label>
                                <div class="input-group">
                                    <input id="banner1BackgroundColor3" type="color" class="form-control form-control-color w-100" value="#000080" aria-label="Color del degradado 3 del banner 1">
                                    <input id="banner1BackgroundHex3" type="text" class="form-control" value="#000080" aria-label="HEX del color 3 del banner 1" maxlength="7" pattern="^#[0-9A-Fa-f]{6}$" placeholder="#000080">
                                </div>
                            </div>
                            <button type="button" class="btn btn-primary w-100" data-action="save-banner1-background">Guardar Banner 1</button>
                        </div>
                    </div>

                    <div class="col-12 col-md-6">
                        <div class="border rounded-3 p-3 h-100">
                            <h3 class="h6 mb-3">Banner 2</h3>
                            <div class="mb-3">
                                <label for="banner2BackgroundColor1" class="form-label">Color del degradado 1</label>
                                <input id="banner2BackgroundColor1" type="color" class="form-control form-control-color w-100" value="#090c11" aria-label="Color del degradado 1 del banner 2">
                            </div>
                            <div class="mb-3">
                                <label for="banner2BackgroundColor2" class="form-label">Color del degradado 2</label>
                                <input id="banner2BackgroundColor2" type="color" class="form-control form-control-color w-100" value="#454a52" aria-label="Color del degradado 2 del banner 2">
                            </div>
                            <div class="mb-3">
                                <label for="banner2BackgroundColor3" class="form-label">Color del degradado 3</label>
                                <div class="input-group">
                                    <input id="banner2BackgroundColor3" type="color" class="form-control form-control-color w-100" value="#000080" aria-label="Color del degradado 3 del banner 2">
                                    <input id="banner2BackgroundHex3" type="text" class="form-control" value="#000080" aria-label="HEX del color 3 del banner 2" maxlength="7" pattern="^#[0-9A-Fa-f]{6}$" placeholder="#000080">
                                </div>
                            </div>
                            <button type="button" class="btn btn-primary w-100" data-action="save-banner2-background">Guardar Banner 2</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="card border-0 shadow-sm mb-4">
            <div class="card-body">
                <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
                    <div>
                        <p class="text-secondary text-uppercase small fw-semibold mb-1"> Galería </p>
                        <h2 class="h5 mb-1"> Inicio Web · Galería </h2>
                        <p class="text-secondary small mb-0"> Administra las imágenes activas de la galería principal. </p>
                    </div>
                    <button type="button" class="btn btn-primary btn-sm" data-action="inicio-web-gallery-add">Agregar imagen</button>
                    <input type="file" class="d-none" accept="image/jpeg,image/png,image/webp" multiple data-inicio-web-gallery-input>
                </div>

                <div class="small text-secondary mb-3 d-none" data-inicio-web-gallery-status></div>

                <div class="row g-3" id="inicioWebGalleryList">
                    ${galleryItems || `
                        <div class="col-12">
                            <div class="border rounded-3 p-4 text-center text-secondary">
                                Aún no hay imágenes en la galería. Agrega la primera imagen para comenzar.
                            </div>
                        </div>
                    `}
                </div>
            </div>
        </section>

        <section class="card border-0 shadow-sm mb-4">
            <div class="card-body">
                <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
                    <div>
                        <p class="text-secondary text-uppercase small fw-semibold mb-1"> Expertise </p>
                        <h2 class="h5 mb-1"> Inicio Web · Expertise </h2>
                        <p class="text-secondary small mb-0"> Administra imágenes y videos del slider principal de expertise. </p>
                    </div>
                    <div class="d-flex gap-2 flex-wrap">
                        <button type="button" class="btn btn-primary btn-sm" data-action="inicio-web-expertise-add-image">Agregar imagen</button>
                        ${hasCustomVideo ? "" : `<button type="button" class="btn btn-outline-primary btn-sm" data-action="inicio-web-expertise-add-video">Agregar video</button>`}
                    </div>
                    <input type="file" class="d-none" accept="image/jpeg,image/png,image/webp" multiple data-inicio-web-expertise-image-input>
                    <input type="file" class="d-none" accept="video/mp4,video/webm,video/ogg" data-inicio-web-expertise-video-input>
                </div>

                <div class="small text-secondary mb-3 d-none" data-inicio-web-expertise-status></div>

                <div class="row g-3" id="inicioWebExpertiseList">
                    ${expertiseItemsHtml || `
                        <div class="col-12">
                            <div class="border rounded-3 p-4 text-center text-secondary">
                                Aún no hay elementos en expertise. Agrega la primera imagen o video.
                            </div>
                        </div>
                    `}
                </div>
            </div>
        </section>
    `;

    const typographyConfigSection = refs.contentArea.querySelector("#inicioWebElementoTexto")?.closest("section.card.border-0.shadow-sm.mb-4");
    const typographyPreviewSection = refs.contentArea.querySelector("#inicioWebTypographyPreview")?.closest("section.card.border-0.shadow-sm.mb-4");
    const typographyEditor = document.getElementById("inicioWebTextEditor");
    const typographyActions = refs.contentArea.querySelector("[data-action='inicio-web-save-typography']")?.closest("div.d-flex.justify-content-end.gap-2");

    if (typographyConfigSection && typographyPreviewSection && typographyEditor && typographyActions) {
        const typographyWrapper = document.createElement("div");
        typographyWrapper.className = "inicio-web-accordion-item mb-4";

        const typographyHeader = document.createElement("button");
        typographyHeader.type = "button";
        typographyHeader.className = "btn btn-light border shadow-sm w-100 text-start d-flex align-items-center justify-content-between gap-3 px-3 py-3";
        typographyHeader.dataset.inicioWebAccordionToggle = "true";
        typographyHeader.setAttribute("aria-expanded", "false");
        typographyHeader.innerHTML = `
            <span class="d-flex align-items-start gap-2 flex-grow-1 min-width-0">
                <span class="text-primary fw-bold">✦</span>
                <span class="d-block text-start">
                    <span class="d-block small text-uppercase text-secondary fw-semibold">Apariencia</span>
                    <span class="d-block fw-semibold text-dark">Tipografía</span>
                    <span class="d-block small text-secondary mt-1">Personaliza el texto y la apariencia de la página principal.</span>
                </span>
            </span>
            <span class="accordion-chevron text-secondary fw-bold" aria-hidden="true">›</span>
        `;

        const typographyContent = document.createElement("div");
        typographyContent.className = "inicio-web-accordion-body";
        typographyContent.style.display = "none";

        const typographyLayout = document.createElement("div");
        typographyLayout.className = "inicio-web-typography-layout";

        const typographyConfigGroup = document.createElement("div");
        typographyConfigGroup.className = "inicio-web-typography-group inicio-web-typography-config";

        const typographyEditorGroup = document.createElement("div");
        typographyEditorGroup.className = "inicio-web-typography-group inicio-web-typography-editor";

        const typographyPreviewGroup = document.createElement("div");
        typographyPreviewGroup.className = "inicio-web-typography-group inicio-web-typography-preview";

        const typographyActionsGroup = document.createElement("div");
        typographyActionsGroup.className = "inicio-web-typography-actions";

        const parent = refs.contentArea;
        parent.insertBefore(typographyWrapper, typographyConfigSection);

        typographyConfigGroup.appendChild(typographyConfigSection);
        typographyEditorGroup.appendChild(typographyEditor);
        typographyPreviewGroup.appendChild(typographyPreviewSection);
        typographyActionsGroup.appendChild(typographyActions);

        typographyLayout.appendChild(typographyConfigGroup);
        typographyLayout.appendChild(typographyEditorGroup);
        typographyLayout.appendChild(typographyPreviewGroup);
        typographyLayout.appendChild(typographyActionsGroup);

        typographyContent.appendChild(typographyLayout);
        typographyWrapper.appendChild(typographyHeader);
        typographyWrapper.appendChild(typographyContent);
    }

    const accordionSections = Array.from(refs.contentArea.querySelectorAll("section.card.border-0.shadow-sm.mb-4"));

    accordionSections.forEach((section) => {
        if (section.closest(".inicio-web-accordion-item") || section.closest(".inicio-web-typography-layout")) {
            return;
        }

        const eyebrow = section.querySelector("p.text-secondary.text-uppercase.small.fw-semibold")?.textContent.trim() || "Sección";
        const title = section.querySelector("h2, h3, h4, h5")?.textContent.trim() || "Sección";
        const description = Array.from(section.querySelectorAll("p.text-secondary.small"))
            .map((element) => element.textContent.trim())
            .find((text) => text && text !== eyebrow && text !== title) || "";

        const wrapper = document.createElement("div");
        wrapper.className = "inicio-web-accordion-item mb-4";

        const header = document.createElement("button");
        header.type = "button";
        header.className = "btn btn-light border shadow-sm w-100 text-start d-flex align-items-center justify-content-between gap-3 px-3 py-3";
        header.dataset.inicioWebAccordionToggle = "true";
        header.setAttribute("aria-expanded", "false");
        header.innerHTML = `
            <span class="d-flex align-items-start gap-2 flex-grow-1 min-width-0">
                <span class="text-primary fw-bold">✦</span>
                <span class="d-block text-start">
                    <span class="d-block small text-uppercase text-secondary fw-semibold">${escapeHtml(eyebrow)}</span>
                    <span class="d-block fw-semibold text-dark">${escapeHtml(title)}</span>
                    ${description ? `<span class="d-block small text-secondary mt-1">${escapeHtml(description)}</span>` : ""}
                </span>
            </span>
            <span class="accordion-chevron text-secondary fw-bold" aria-hidden="true">›</span>
        `;

        const content = document.createElement("div");
        content.className = "inicio-web-accordion-body";
        content.style.display = "none";

        const parent = section.parentNode;
        if (parent) {
            parent.insertBefore(wrapper, section);
        }

        wrapper.appendChild(header);
        wrapper.appendChild(content);
        content.appendChild(section);
    });

    const accordionButtons = refs.contentArea.querySelectorAll("[data-inicio-web-accordion-toggle]");

    accordionButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const wrapper = button.closest(".inicio-web-accordion-item");
            const content = wrapper?.querySelector(".inicio-web-accordion-body");
            const chevron = button.querySelector(".accordion-chevron");
            const isOpen = button.getAttribute("aria-expanded") === "true";

            accordionButtons.forEach((otherButton) => {
                const otherWrapper = otherButton.closest(".inicio-web-accordion-item");
                const otherContent = otherWrapper?.querySelector(".inicio-web-accordion-body");
                const otherChevron = otherButton.querySelector(".accordion-chevron");
                otherButton.setAttribute("aria-expanded", "false");
                otherButton.classList.remove("active");
                if (otherContent) {
                    otherContent.style.display = "none";
                }
                if (otherChevron) {
                    otherChevron.textContent = "›";
                }
            });

            if (isOpen) {
                button.setAttribute("aria-expanded", "false");
                button.classList.remove("active");
                if (content) {
                    content.style.display = "none";
                }
                if (chevron) {
                    chevron.textContent = "›";
                }
                return;
            }

            button.setAttribute("aria-expanded", "true");
            button.classList.add("active");
            if (content) {
                content.style.display = "block";
            }
            if (chevron) {
                chevron.textContent = "⌄";
            }
        });
    });

    console.log(
        "[BANNER FLOW DEBUG] renderInicioWeb terminó de generar el HTML"
    );

    const galleryInput = refs.contentArea.querySelector("[data-inicio-web-gallery-input]");
    const addGalleryButton = refs.contentArea.querySelector("[data-action='inicio-web-gallery-add']");
    const galleryStatus = refs.contentArea.querySelector("[data-inicio-web-gallery-status]");
    const galleryList = refs.contentArea.querySelector("#inicioWebGalleryList");

    addGalleryButton?.addEventListener("click", () => {
        galleryInput?.click();
    });

    galleryInput?.addEventListener("change", async (event) => {
        const selectedFiles = Array.from(event.target.files || []).filter((file) => file && file.type && [
            "image/jpeg",
            "image/png",
            "image/webp"
        ].includes(file.type));

        if (!selectedFiles.length) {
            event.target.value = "";
            return;
        }

        const button = refs.contentArea.querySelector("[data-action='inicio-web-gallery-add']");

        if (button) {
            button.disabled = true;
            button.textContent = "Subiendo...";
        }

        if (galleryStatus) {
            galleryStatus.classList.remove("d-none");
            galleryStatus.textContent = `Subiendo ${selectedFiles.length} imagen(es)...`;
        }

        try {
            const result = await window.InicioWebService.uploadGalleryImages(selectedFiles);

            const fileNames = result.failed.length
                ? ` Fallaron: ${result.failed.join(", ")}.`
                : "";

            if (result.failed.length) {
                showToast(
                    `Se agregaron ${result.created.length} imagen(es).${fileNames}`,
                    "warning"
                );
            } else {
                showToast(
                    result.created.length > 1
                        ? `Se agregaron ${result.created.length} imágenes correctamente.`
                        : "La imagen se agregó correctamente.",
                    "success"
                );
            }

            await renderInicioWeb();
        } catch (error) {
            console.error("Error agregando imágenes de la galería:", error);
            showToast(
                error && error.message ? error.message : "No se pudo agregar la imagen.",
                "danger"
            );
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = "Agregar imagen";
            }

            if (galleryStatus) {
                galleryStatus.classList.add("d-none");
                galleryStatus.textContent = "";
            }

            event.target.value = "";
        }
    });

    galleryList?.addEventListener("click", async (event) => {
        const actionButton = event.target.closest("[data-action]");
        if (!actionButton) {
            return;
        }

        const action = actionButton.dataset.action;

        if (action === "inicio-web-gallery-toggle") {
            const id = actionButton.dataset.id;
            const isVisible = actionButton.dataset.visible === "true";

            try {
                await window.InicioWebService.updateGalleryVisibility(id, !isVisible);
                showToast(isVisible ? "La imagen quedó desactivada." : "La imagen quedó activa.", "success");
                await renderInicioWeb();
            } catch (error) {
                console.error("Error cambiando visibilidad de la imagen:", error);
                showToast(error && error.message ? error.message : "No se pudo cambiar el estado de la imagen.", "danger");
            }
            return;
        }

        if (action === "inicio-web-gallery-delete") {
            const id = actionButton.dataset.id;
            const storagePath = actionButton.dataset.storagePath || "";

            const confirmed = window.confirm("¿Eliminar esta imagen de la galería? Esta acción también eliminará el archivo de almacenamiento.");
            if (!confirmed) {
                return;
            }

            try {
                await window.InicioWebService.deleteGalleryImage(id, storagePath);
                showToast("La imagen se eliminó correctamente.", "success");
                await renderInicioWeb();
            } catch (error) {
                console.error("Error eliminando imagen de la galería:", error);
                showToast(error && error.message ? error.message : "No se pudo eliminar la imagen.", "danger");
            }
        }
    });

    const expertiseImageInput = refs.contentArea.querySelector("[data-inicio-web-expertise-image-input]");
    const expertiseVideoInput = refs.contentArea.querySelector("[data-inicio-web-expertise-video-input]");
    const expertiseImageButton = refs.contentArea.querySelector("[data-action='inicio-web-expertise-add-image']");
    const expertiseStatus = refs.contentArea.querySelector("[data-inicio-web-expertise-status]");
    const expertiseList = refs.contentArea.querySelector("#inicioWebExpertiseList");

    expertiseImageButton?.addEventListener("click", () => {
        expertiseImageInput?.click();
    });

    expertiseImageInput?.addEventListener("change", async (event) => {
        const selectedFiles = Array.from(event.target.files || []).filter((file) => file && file.type && ["image/jpeg", "image/png", "image/webp"].includes(file.type));

        if (!selectedFiles.length) {
            event.target.value = "";
            return;
        }

        expertiseImageButton.disabled = true;
        expertiseImageButton.textContent = "Subiendo...";

        if (expertiseStatus) {
            expertiseStatus.classList.remove("d-none");
            expertiseStatus.textContent = `Subiendo ${selectedFiles.length} imagen(es)...`;
        }

        try {
            const result = await window.InicioWebService.uploadExpertiseImages(selectedFiles);
            if (result.failed.length) {
                showToast(`Se agregaron ${result.created.length} imagen(es). Fallaron: ${result.failed.join(", ")}.`, "warning");
            } else {
                showToast(result.created.length > 1 ? `Se agregaron ${result.created.length} imágenes correctamente.` : "La imagen se agregó correctamente.", "success");
            }
            await renderInicioWeb();
        } catch (error) {
            console.error("Error agregando imágenes de expertise:", error);
            showToast(error && error.message ? error.message : "No se pudo agregar la imagen.", "danger");
        } finally {
            expertiseImageButton.disabled = false;
            expertiseImageButton.textContent = "Agregar imagen";
            if (expertiseStatus) {
                expertiseStatus.classList.add("d-none");
                expertiseStatus.textContent = "";
            }
            event.target.value = "";
        }
    });

    expertiseVideoInput?.addEventListener("change", async (event) => {
        const [selectedFile] = Array.from(event.target.files || []);

        if (!selectedFile) {
            event.target.value = "";
            return;
        }

        const maxBytes = 2 * 1024 * 1024;
        if (selectedFile.size > maxBytes) {
            event.target.value = "";
            showToast("El video no puede superar los 2 MB.", "danger");
            return;
        }

        if (expertiseStatus) {
            expertiseStatus.classList.remove("d-none");
            expertiseStatus.textContent = "Subiendo video...";
        }

        try {
            const created = await window.InicioWebService.createExpertiseVideoFile(selectedFile);
            showToast(created ? "El video se agregó correctamente." : "No se pudo agregar el video.", "success");
            await renderInicioWeb();
        } catch (error) {
            console.error("Error creando video de expertise desde archivo:", error);
            showToast(error && error.message ? error.message : "No se pudo crear el video.", "danger");
        } finally {
            if (expertiseStatus) {
                expertiseStatus.classList.add("d-none");
                expertiseStatus.textContent = "";
            }
            event.target.value = "";
        }
    });

    const expertiseVideoChoiceContainer = () => {
        const button = refs.contentArea.querySelector("[data-action='inicio-web-expertise-add-video']");
        const cardBody = button?.closest(".card-body");
        if (!cardBody) {
            return null;
        }

        return cardBody.querySelector("[data-inicio-web-expertise-choice]");
    };

    const removeExpertiseVideoChoice = () => {
        const existing = expertiseVideoChoiceContainer();
        if (existing) {
            existing.remove();
        }
    };

    const showExpertiseVideoChoice = () => {
        const button = refs.contentArea.querySelector("[data-action='inicio-web-expertise-add-video']");
        const cardBody = button?.closest(".card-body");
        if (!cardBody) {
            return;
        }

        removeExpertiseVideoChoice();

        const panel = document.createElement("div");
        panel.dataset.inicioWebExpertiseChoice = "true";
        panel.className = "mt-3 border rounded-3 p-3 bg-light";
        panel.innerHTML = `
            <div class="fw-semibold small text-uppercase text-secondary mb-3">AGREGAR VIDEO</div>
            <div class="d-grid gap-2">
                <button type="button" class="btn btn-outline-primary btn-sm text-start" data-action="inicio-web-expertise-use-url">USAR URL</button>
                <button type="button" class="btn btn-outline-secondary btn-sm text-start" data-action="inicio-web-expertise-upload-file">SUBIR ARCHIVO</button>
                <div class="small text-secondary">Video máximo: 2 MB</div>
            </div>
        `;

        const list = cardBody.querySelector("#inicioWebExpertiseList");
        if (list) {
            list.before(panel);
        }
    };

    const showExpertiseUrlForm = () => {
        const button = refs.contentArea.querySelector("[data-action='inicio-web-expertise-add-video']");
        const cardBody = button?.closest(".card-body");
        if (!cardBody) {
            return;
        }

        removeExpertiseVideoChoice();

        const panel = document.createElement("div");
        panel.className = "mt-3 border rounded-3 p-3 bg-light";
        panel.innerHTML = `
            <div class="fw-semibold small text-uppercase text-secondary mb-3">URL DEL VIDEO</div>
            <input
                type="url"
                class="form-control mb-3"
                placeholder="Pega aquí la URL del video..."
                data-inicio-web-expertise-url-input
            >
            <div class="d-flex gap-2">
                <button type="button" class="btn btn-outline-secondary btn-sm" data-action="inicio-web-expertise-cancel-url">Cancelar</button>
                <button type="button" class="btn btn-primary btn-sm" data-action="inicio-web-expertise-save-url">Guardar video</button>
            </div>
        `;

        const list = cardBody.querySelector("#inicioWebExpertiseList");
        if (list) {
            list.before(panel);
        }
    };

    refs.contentArea.querySelector("[data-action='inicio-web-expertise-add-video']")?.addEventListener("click", () => {
        showExpertiseVideoChoice();
    });

    refs.contentArea.addEventListener("click", async (event) => {
        const actionButton = event.target.closest("[data-action]");
        if (!actionButton) {
            return;
        }

        const action = actionButton.dataset.action;

        if (action === "inicio-web-expertise-use-url") {
            showExpertiseUrlForm();
            return;
        }

        if (action === "inicio-web-expertise-upload-file") {
            removeExpertiseVideoChoice();
            expertiseVideoInput?.click();
            return;
        }

        if (action === "inicio-web-expertise-cancel-url") {
            removeExpertiseVideoChoice();
            return;
        }

        if (action === "inicio-web-expertise-save-url") {
            const form = actionButton.closest(".border.rounded-3.bg-light");
            const urlValue = form ? form.querySelector("[data-inicio-web-expertise-url-input]")?.value || "" : "";
            const trimmedUrl = typeof urlValue === "string" ? urlValue.trim() : "";

            if (!trimmedUrl) {
                showToast("Debes ingresar una URL válida para el video.", "danger");
                return;
            }

            try {
                const parsedUrl = new URL(trimmedUrl);
                if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                    throw new Error("La URL debe empezar con http:// o https://");
                }
            } catch (error) {
                showToast("La URL del video no es válida.", "danger");
                return;
            }

            try {
                const created = await window.InicioWebService.createExpertiseVideo({
                    videoUrl: trimmedUrl,
                    altText: ""
                });

                removeExpertiseVideoChoice();
                showToast(created ? "El video se agregó correctamente." : "No se pudo agregar el video.", "success");
                await renderInicioWeb();
            } catch (error) {
                console.error("Error creando video de expertise por URL:", error);
                showToast(error && error.message ? error.message : "No se pudo crear el video.", "danger");
            }
            return;
        }
    });

    expertiseList?.addEventListener("click", async (event) => {
        const actionButton = event.target.closest("[data-action]");
        if (!actionButton) {
            return;
        }

        const action = actionButton.dataset.action;

        if (action === "inicio-web-expertise-toggle") {
            const id = actionButton.dataset.id;
            const isVisible = actionButton.dataset.visible === "true";

            try {
                await window.InicioWebService.updateExpertiseVisibility(id, !isVisible);
                showToast(isVisible ? "El elemento quedó oculto." : "El elemento quedó visible.", "success");
                await renderInicioWeb();
            } catch (error) {
                console.error("Error cambiando visibilidad de expertise:", error);
                showToast(error && error.message ? error.message : "No se pudo cambiar el estado del elemento.", "danger");
            }
            return;
        }

        if (action === "inicio-web-expertise-delete") {
            const id = actionButton.dataset.id;
            const mediaType = actionButton.dataset.mediaType || "image";
            const confirmed = window.confirm(mediaType === "video" ? "¿Eliminar este video de expertise?" : "¿Eliminar esta imagen de expertise? Esta acción también borrará el archivo del Storage.");

            if (!confirmed) {
                return;
            }

            try {
                const item = (expertiseItems || []).find((entry) => String(entry.id) === String(id));
                if (!item) {
                    throw new Error("No se encontró el elemento a eliminar.");
                }

                await window.InicioWebService.deleteExpertiseItem(item);
                showToast("El elemento de expertise se eliminó correctamente.", "success");
                await renderInicioWeb();
            } catch (error) {
                console.error("Error eliminando elemento de expertise:", error);
                showToast(error && error.message ? error.message : "No se pudo eliminar el elemento de expertise.", "danger");
            }
        }
    });

    bindInicioWebTypographyControls();
    await loadInicioWebSavedTexts();
    updateInicioWebTypographyPreview();

    const resetButton = refs.contentArea.querySelector("[data-action='inicio-web-reset-typography']");
    const saveButton = refs.contentArea.querySelector( "[data-action='inicio-web-save-typography']");
    resetButton?.addEventListener( "click",resetInicioWebTypography );
    saveButton?.addEventListener( "click", saveInicioWebTypography);
    openInicioWebTextEditor();

    console.log(
        "[BANNER FLOW DEBUG] buscando botón Banner 1"
    );
    const banner1SaveButton = refs.contentArea.querySelector("[data-action='save-banner1-background']");
    console.log(
        "[BANNER FLOW DEBUG] banner1SaveButton:",
        banner1SaveButton
    );
    const banner2SaveButton = refs.contentArea.querySelector("[data-action='save-banner2-background']");

    banner1SaveButton?.addEventListener("click", async () => {
        console.log("[BANNER CLICK DEBUG] click recibido en Banner 1");

        await saveInicioWebBannerBackground("banner1_background");
    });
    console.log(
        "[BANNER FLOW DEBUG] listener Banner 1 registrado"
    );

    banner2SaveButton?.addEventListener("click", async () => {
        await saveInicioWebBannerBackground("banner2_background");
    });

    syncBannerBackgroundColorInputs(
        document.getElementById("banner1BackgroundColor3"),
        document.getElementById("banner1BackgroundHex3")
    );
    syncBannerBackgroundColorInputs(
        document.getElementById("banner2BackgroundColor3"),
        document.getElementById("banner2BackgroundHex3")
    );

    loadInicioWebTypographyStyle();
    loadBannerBackgroundStyles();
}


async function loadInicioWebTypographyStyle() { const elemento =
        document.getElementById( "inicioWebElementoTexto"
        )?.value;
    if (!elemento) {
        return;
    }

    try {
        const style =
            await window.InicioWebService.getStyle( elemento );

        const setValue = (selector, value) => {
            const control = document.querySelector(selector);

            if (control) { control.value = value; }
        };

        setValue( "[data-inicio-web-control='fuente']", style.fuente );
        setValue( "[data-inicio-web-control='peso']", String(style.peso));
        setValue( "[data-inicio-web-control='tamano']", style.tamano );
        setValue( "[data-inicio-web-control='alineacion']", style.alineacion );
        setValue( "[data-inicio-web-control='estilo']", style.estilo );
        setValue( "[data-inicio-web-control='transformacion']", style.transformacion );
        setValue( "[data-inicio-web-control='color']", style.color );
        setValue( "[data-inicio-web-control='lineHeight']", style.line_height );
        setValue( "[data-inicio-web-control='letterSpacing']", style.letter_spacing );
        updateInicioWebTypographyPreview();

    } catch (error) { console.error( "Error al cargar estilo de Inicio Web:", error );
        showToast(
            "No se pudo cargar el estilo guardado.", "danger"
        );
    }
}
async function saveInicioWebTypography() {
    const elemento =
        document.getElementById(
            "inicioWebElementoTexto"
        )?.value;

    if (!elemento) {
        return;
    }

    const getValue = (selector, fallback = "") =>
        document.querySelector(selector)?.value ??
        fallback;

    const style = {
        elemento,
        fuente: getValue(
            "[data-inicio-web-control='fuente']", "inherit"
        ),

        peso: Number( getValue("[data-inicio-web-control='peso']", 400) ),
        tamano: Number( getValue("[data-inicio-web-control='tamano']", 48) ),
        alineacion: getValue("[data-inicio-web-control='alineacion']","left"),
        estilo: getValue("[data-inicio-web-control='estilo']","normal" ),
        transformacion: getValue("[data-inicio-web-control='transformacion']", "none" ),
        color: getValue("[data-inicio-web-control='color']", "#ffffff" ),
        line_height: Number( getValue("[data-inicio-web-control='lineHeight']", 1.2)),
        letter_spacing: Number(getValue("[data-inicio-web-control='letterSpacing']", 0))
    };

    try {
        await window.InicioWebService.saveStyle(
            style
        );

        showToast(
            "Cambios de tipografía guardados correctamente.",
            "success"
        );

    } catch (error) {
        console.error("Error al guardar estilo de Inicio Web:", error );
        showToast( "No se pudieron guardar los cambios.", "danger");
    }
}


function isValidBannerHexColor(value) {
    return /^#[0-9a-fA-F]{6}$/.test((value || "").trim());
}

function syncBannerBackgroundColorInputs(colorInput, hexInput) {
    if (!colorInput || !hexInput) {
        return;
    }

    const setExplicitState = (isExplicit) => {
        colorInput.dataset.hasThirdColor = isExplicit ? "true" : "false";
        hexInput.dataset.hasThirdColor = isExplicit ? "true" : "false";
    };

    const syncFromColorInput = () => {
        const value = (colorInput.value || "").trim();
        if (isValidBannerHexColor(value)) {
            hexInput.value = value;
            setExplicitState(true);
            return;
        }

        if (hexInput.value.trim() === "") {
            setExplicitState(false);
        }
    };

    const syncFromHexInput = () => {
        const value = (hexInput.value || "").trim();

        if (value === "") {
            setExplicitState(false);
            return;
        }

        if (isValidBannerHexColor(value)) {
            colorInput.value = value;
            setExplicitState(true);
            return;
        }

        setExplicitState(false);
    };

    colorInput.addEventListener("input", syncFromColorInput);
    colorInput.addEventListener("change", syncFromColorInput);

    hexInput.addEventListener("input", syncFromHexInput);
    hexInput.addEventListener("change", syncFromHexInput);
}

async function loadBannerBackgroundStyles() {
    const bannerMap = {
        banner1_background: {
            color1: document.getElementById("banner1BackgroundColor1"),
            color2: document.getElementById("banner1BackgroundColor2"),
            color3: document.getElementById("banner1BackgroundColor3"),
            hex3: document.getElementById("banner1BackgroundHex3")
        },
        banner2_background: {
            color1: document.getElementById("banner2BackgroundColor1"),
            color2: document.getElementById("banner2BackgroundColor2"),
            color3: document.getElementById("banner2BackgroundColor3"),
            hex3: document.getElementById("banner2BackgroundHex3")
        }
    };

    for (const [elemento, controls] of Object.entries(bannerMap)) {
        try {
            const style = await window.InicioWebService.getStyle(elemento);

            if (controls.color1) {
                controls.color1.value = style.background_color_1 || "#090c11";
            }

            if (controls.color2) {
                controls.color2.value = style.background_color_2 || "#454a52";
            }

            const hasThirdColor = isValidBannerHexColor(style.background_color_3 || "");

            if (controls.color3) {
                controls.color3.value = hasThirdColor ? style.background_color_3 : (controls.color3.value || "#000000");
                controls.color3.dataset.hasThirdColor = hasThirdColor ? "true" : "false";
            }

            if (controls.hex3) {
                controls.hex3.value = hasThirdColor ? style.background_color_3 : "";
                controls.hex3.dataset.hasThirdColor = hasThirdColor ? "true" : "false";
                controls.hex3.placeholder = "#000080";
            }
        } catch (error) {
            console.error(`Error al cargar fondo de ${elemento}:`, error);
        }
    }
}

function getBannerBackgroundControls(elemento) {
    const bannerMap = {
        banner1_background: {
            color1: document.getElementById("banner1BackgroundColor1"),
            color2: document.getElementById("banner1BackgroundColor2"),
            color3: document.getElementById("banner1BackgroundColor3"),
            hex3: document.getElementById("banner1BackgroundHex3"),
            button: document.querySelector("[data-action='save-banner1-background']")
        },
        banner2_background: {
            color1: document.getElementById("banner2BackgroundColor1"),
            color2: document.getElementById("banner2BackgroundColor2"),
            color3: document.getElementById("banner2BackgroundColor3"),
            hex3: document.getElementById("banner2BackgroundHex3"),
            button: document.querySelector("[data-action='save-banner2-background']")
        }
    };

    return bannerMap[elemento] || null;
}

async function saveInicioWebBannerBackground(elemento) {
    const controls = getBannerBackgroundControls(elemento);

    if (!controls) {
        throw new Error(`Elemento de fondo de banner no válido: ${elemento}`);
    }

    const button = controls.button;
    const originalButtonText = button?.textContent || "Guardar";
    const color1 = (controls.color1?.value || "").trim();
    const color2 = (controls.color2?.value || "").trim();
    const hasColor3 = controls.color3?.dataset.hasThirdColor === "true" || controls.hex3?.dataset.hasThirdColor === "true";
    const color3Hex = hasColor3 ? ((controls.hex3?.value || controls.color3?.value || "").trim()) : "";
    const color3 = hasColor3 && isValidBannerHexColor(color3Hex) ? color3Hex : null;

    if (button) {
        button.disabled = true;
        button.textContent = "Guardando...";
    }

    try {
        if (!/^#[0-9a-fA-F]{6}$/.test(color1)) {
            throw new Error("El color principal del degradado no tiene un formato hexadecimal válido.");
        }

        if (!/^#[0-9a-fA-F]{6}$/.test(color2)) {
            throw new Error("El color secundario del degradado no tiene un formato hexadecimal válido.");
        }

        const supabase = window.supabaseClient || window.supabase;

        if (!supabase || typeof supabase.from !== "function") {
            throw new Error("No se encontró un cliente de Supabase activo para guardar el fondo del banner.");
        }

        const payload = {
            elemento,
            background_color_1: color1,
            background_color_2: color2,
            background_color_3: color3
        };

        const { data, error } = await supabase
            .from("inicio_web_styles")
            .upsert(payload, {
                onConflict: "elemento"
            });

        if (error) {
            throw error;
        }

        const label = elemento === "banner1_background" ? "Banner 1" : "Banner 2";
        showToast(`✓ Fondo del ${label} guardado correctamente.`, "success");
        return true;
    } catch (error) {
        const label = elemento === "banner1_background" ? "Banner 1" : "Banner 2";
        console.error("[Inicio Web] Error guardando fondo del banner:", error);
        showToast(`✕ No se pudo guardar el fondo del ${label}: ${error?.message || error || "Error desconocido"}`, "danger");
        return false;
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = originalButtonText;
        }
    }
}

async function saveBannerBackgroundStyle(elemento) {
    return saveInicioWebBannerBackground(elemento);
}

async function resetInicioWebTypography() {
    const elemento =
        document.getElementById(
            "inicioWebElementoTexto"
        )?.value;

    if (!elemento) {
        return;
    }

    try {
        await window.InicioWebService.resetStyle(
            elemento
        );

        await loadInicioWebTypographyStyle();

        showToast("Tipografía restaurada correctamente.","success");

    } catch (error) {
        console.error(
            "Error al restaurar estilo de Inicio Web:",
            error
        );

        showToast(
            "No se pudo restaurar la tipografía.",
            "danger"
        );
    }
}

function openInicioWebTextEditor() {
    const textos = {
		hero_eyebrow: "Texto pequeño del Hero",
        hero_titulo: "Título principal del Hero",
        hero_boton: "Texto del botón del Hero",
        banner1_tag: "Etiqueta del Banner 1",
        banner1_titulo: "Título del Banner 1",
        banner1_descripcion: "Descripción del Banner 1",
        banner2_tag: "Etiqueta del Banner 2",
        banner2_titulo: "Título del Banner 2",
        banner2_descripcion: "Descripción del Banner 2",
        galeria_titulo: "Título de la galería"
    };

    const elemento = document.getElementById( "inicioWebElementoTexto")?.value;
    const contenido = document.getElementById( "inicioWebTextoContenido");
    if (!contenido) {
        return;
    }
    contenido.value = "";

    const editor = document.getElementById( "inicioWebTextEditor" );
    if (!editor) {
        return;
    }
    const select = document.getElementById( "inicioWebTextoElemento" );

    if (select) {
        select.innerHTML = Object.entries(textos)
            .map(
                ([value, label]) =>
                    `<option value="${value}">
                        ${label}
                    </option>`
            )
            .join("");

        if (elemento && textos[elemento]) {
            select.value = elemento;
        }
    }

    editor.classList.remove("d-none");

    loadInicioWebTextContent();
	bindInicioWebTextEditor();
}

function closeInicioWebTextEditor() {
    const editor = document.getElementById("inicioWebTextEditor");

    if (editor) {
        editor.classList.add("d-none");
    }
}

async function loadInicioWebTextContent() {
    const select = document.getElementById( "inicioWebTextoElemento" );
    const contenido = document.getElementById( "inicioWebTextoContenido" );

    if (!select || !contenido) {
        return;
    }

    const elemento = select.value;

    if (!elemento) {
        contenido.value = "";
        return;
    }

    try {
        const resultado =
            await window.InicioWebService.getText(elemento);

        contenido.value = resultado?.contenido || "";

    } catch (error) {
        console.error(
            "Error al cargar el texto de Inicio Web:",
            error
        );

        contenido.value = "";

        showToast(
            "No se pudo cargar el texto seleccionado.",
            "danger"
        );
    }
}

async function saveInicioWebTextContent() {
    const select = document.getElementById(
        "inicioWebTextoElemento"
    );

    const contenido = document.getElementById(
        "inicioWebTextoContenido"
    );

    if (!select || !contenido) {
        return;
    }

    const elemento = select.value;
    const texto = contenido.value.trim();

    if (!elemento) {
        showToast(
            "Selecciona un elemento de texto.",
            "warning"
        );
        return;
    }

    if (!texto) {
        showToast(
            "El texto no puede quedar vacío.",
            "warning"
        );
        return;
    }

    try {
        await window.InicioWebService.saveText(elemento, texto);
		window.inicioWebSavedTexts =
			window.inicioWebSavedTexts || {};
		window.inicioWebSavedTexts[elemento] = texto;
		// Actualizar el contenido del editor
		contenido.value = texto;
		// Actualizar inmediatamente la vista previa con el nuevo texto
		const elementoTipografia = document.getElementById( "inicioWebElementoTexto" )?.value;
		if (elementoTipografia === elemento) {
			 updateInicioWebTypographyPreview();
			}
		const selectorPrincipal = document.getElementById("inicioWebElementoTexto");
		if (selectorPrincipal) {
			const opcion = selectorPrincipal.querySelector(
				`option[value="${elemento}"]`
			);
			if (opcion) {
				opcion.dataset.contenido = texto;
			}
		}
		showToast( "Texto guardado correctamente.","success" );
		closeInicioWebTextEditor();

    } catch (error) {
        console.error( "Error al guardar texto de Inicio Web:", error );
		const mensaje =
        error?.message ||
        error?.details ||
        error?.hint ||
        "Error desconocido";

        showToast(
            `Error al guardar: ${mensaje}`,
            "danger"
        );
    }
}

function bindInicioWebTypographyControls() {
    const elementoSelect = document.getElementById("inicioWebElementoTexto");

    if (elementoSelect && !elementoSelect.dataset.typographyBound) {
        elementoSelect.addEventListener("change", async () => {
            await loadInicioWebTypographyStyle();
            openInicioWebTextEditor();
            updateInicioWebTypographyPreview();
        });
        elementoSelect.dataset.typographyBound = "true";
    }

    document.querySelectorAll("[data-inicio-web-control]").forEach((control) => {
        const controlName = control.dataset.inicioWebControl;

        if (!controlName || controlName === "elemento" || control.dataset.typographyBound === "true") {
            return;
        }

        control.addEventListener("input", updateInicioWebTypographyPreview);
        control.addEventListener("change", updateInicioWebTypographyPreview);
        control.dataset.typographyBound = "true";
    });
}

function bindInicioWebTextEditor() {
    const select = document.getElementById( "inicioWebTextoElemento" );
    const saveButton = document.querySelector( "[data-action='inicio-web-save-text']");

    if (select && !select.dataset.textEditorBound) {
        select.addEventListener( "change", loadInicioWebTextContent );
        select.dataset.textEditorBound = "true";
    }

    if (
        saveButton &&
        !saveButton.dataset.textEditorBound
    ) {
        saveButton.addEventListener( "click", saveInicioWebTextContent);
        saveButton.dataset.textEditorBound = "true";
    }
}

function updateInicioWebTypographyPreview() {
    const preview = document.getElementById(
        "inicioWebTypographyPreviewText"
    );

    if (!preview) {
        return;
    }

    const elemento =
        document.getElementById("inicioWebElementoTexto")?.value ||
        "hero_titulo";

    const previewTexts = {
        hero_eyebrow: "ARTE EN MOVIMIENTO",
        hero_titulo: "Transforma tus Ideas en Arte Visual.",
        hero_boton: "Reserva tu sesión",
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

    /*
     * Primero intenta utilizar el texto guardado
     * que fue cargado desde Supabase.
     */
    const textosGuardados =
        window.inicioWebSavedTexts || {};

    const contenidoEditor =
        document
            .getElementById("inicioWebTextoContenido")
            ?.value
            ?.trim();

    const elementoEditor =
        document.getElementById("inicioWebTextoElemento")
            ?.value;

    let texto;

    /*
     * Si el editor está abierto y corresponde al
     * elemento seleccionado, utiliza su contenido.
     */
    if (
        elementoEditor === elemento &&
        contenidoEditor
    ) {
        texto = contenidoEditor;
    }
    /*
     * Si existe un texto guardado en Supabase,
     * utilizarlo antes que el texto predeterminado.
     */
    else if (
        textosGuardados[elemento]
    ) {
        texto = textosGuardados[elemento];
    }
    /*
     * Finalmente utiliza el texto original como
     * valor predeterminado.
     */
    else {
        texto =
            previewTexts[elemento] ||
            "Transforma tus Ideas en Arte Visual.";
    }

    preview.textContent = texto;

    const fuente =
        document.querySelector(
            "[data-inicio-web-control='fuente']"
        )?.value || "inherit";

    const peso =
        document.querySelector(
            "[data-inicio-web-control='peso']"
        )?.value || "400";

    const tamano =
        document.querySelector(
            "[data-inicio-web-control='tamano']"
        )?.value || "48";

    const alineacion =
        document.querySelector(
            "[data-inicio-web-control='alineacion']"
        )?.value || "left";

    const estilo =
        document.querySelector(
            "[data-inicio-web-control='estilo']"
        )?.value || "normal";

    const color =
        document.querySelector(
            "[data-inicio-web-control='color']"
        )?.value || "#ffffff";

    const transformacion =
        document.querySelector(
            "[data-inicio-web-control='transformacion']"
        )?.value || "none";

    const lineHeight =
        document.querySelector(
            "[data-inicio-web-control='lineHeight']"
        )?.value || "1.2";

    const letterSpacing =
        document.querySelector(
            "[data-inicio-web-control='letterSpacing']"
        )?.value || "0";

    Object.assign(preview.style, {
        fontFamily:
            fuente === "inherit"
                ? "inherit"
                : `"${fuente}", sans-serif`,
        fontWeight: peso,
        fontSize: `${tamano}px`,
        textAlign: alineacion,
        fontStyle: estilo,
        color,
        textTransform: transformacion,
        lineHeight,
        letterSpacing: `${letterSpacing}px`
    });
}
	async function renderPublicaciones() {
		try {
			const [stats, publicaciones] = await Promise.all([
				PublicacionesService.getStats(),
				PublicacionesService.list()
			]);

			state.publicaciones = publicaciones;
			const filteredPublicaciones = getFilteredPublicaciones();
			const rows = filteredPublicaciones.map((item) => `
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
					<td>
					<span class="badge badge-estado ${item.estado === "publicado" ? "text-bg-success" : "text-bg-warning"}">${escapeHtml(capitalize(item.estado))}</span></td>
					<td>${escapeHtml(formatEventDate(item.fecha_evento, item.hora_evento))}</td>
					<td class="text-end">
						<div class="btn-group btn-group-sm" role="group">
							<button class="btn btn-outline-primary" data-action="edit-publication">Editar</button>
							<button class="btn btn-outline-secondary" data-action="toggle-estado">Estado</button>
							<button class="btn btn-outline-danger" data-action="delete-publication">Eliminar</button>
						</div>
					</td>
				</tr>
			`).join("");
			const tableContent = filteredPublicaciones.length > 0
			? `
        <div class="table-wrap p-2 p-md-3">
            <div class="table-responsive">
                <table class="table align-middle mb-0">
                    <thead>
                        <tr>
                            <th style="width:90px;">Imagen</th>
                            <th>Titulo</th>
                            <th>Estado</th>
                            <th>Fecha del evento</th>
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
            <p class="text-secondary text-uppercase small fw-semibold mb-2"> Publicaciones </p>
			<h3 class="h5 mb-2"> No se encontraron publicaciones </h3>
			<p class="text-secondary mb-4">  No hay resultados para "${escapeHtml(stateFilters.search)}" con el filtro seleccionado. </p>
			<button class="btn btn-primary" data-action="new-publication" > Crear nueva publicacion </button>
        </div>
    `;
	refs.contentArea.innerHTML = `
	<section class="hero-panel mb-4">
	<div class="hero-copy"> <p class="hero-eyebrow mb-2">NEXT LEVEL PRODUCCIONES</p><h1 class="h3 mb-2">Publicaciones</h1> </div>
	<div class="hero-actions"> <button class="btn btn-primary" data-action="new-publication">Nueva publicacion</button></div>
	</section>
	<div class="row g-3 mb-4">
	<div class="col-12 col-md-4"><div class="card card-stat h-100"><div class="card-body"><p class="text-secondary mb-2">Total</p><p class="value mb-0">${stats.total}</p></div></div
	></div>
	<div class="col-12 col-md-4"><div class="card card-stat h-100"><div class="card-body"><p class="text-secondary mb-2">Publicadas</p><p class="value mb-0 text-success">${stats.publicadas ?? 0}</p></div></div></div>
	<div class="col-12 col-md-4"><div class="card card-stat h-100"><div class="card-body"><p class="text-secondary mb-2">Borradores</p><p class="value mb-0 text-warning">${stats.borradores ?? 0}</p></div></div></div>
	</div>
	<div class="section-note mb-4">
	<span class="section-chip">Tabla: ${escapeHtml(APP_CONFIG.TABLES.PUBLICACIONES)}</span>
	<span class="section-chip">Bucket: ${escapeHtml(APP_CONFIG.STORAGE.PUBLICACIONES_BUCKET)}</span>
	</div>
	<div class="row g-2 mb-3 align-items-end">
	<div class="col-12 col-md-8">
	<label for="publicationSearch" class="form-label small mb-1 text-secondary">Buscar por titulo</label>
	<input id="publicationSearch" data-role="publication-search" type="text" class="form-control" value="${escapeHtml(stateFilters.search)}" placeholder="Escribe el titulo de la actividad">
	</div>
	<div class="col-12 col-md-4">
	<label for="publicationStateFilter" class="form-label small mb-1 text-secondary">Estado</label>
		<select id="publicationStateFilter" data-role="publication-state-filter" class="form-select">
			<option value="todos" ${stateFilters.estado === "todos" ? "selected" : ""}>Todos</option>
			<option value="publicado" ${stateFilters.estado === "publicado" ? "selected" : ""}>Publicado</option>
			<option value="borrador" ${stateFilters.estado === "borrador" ? "selected" : ""}>Borrador</option>
		</select>
	</div>
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

	async function onContentClick(event) {
		const actionButton = event.target.closest("[data-action]");
		if (!actionButton) {
			return;
		}
		const action = actionButton.dataset.action;

		if (action === "go-inicio-web") { navigate("inicio-web");
			return;
		}
		if (action === "inicio-web-close-text") { 
			closeInicioWebTextEditor();
			return;
		}

		if (action === "go-publicaciones") { navigate("publicaciones");
			return;
		}
		if (action === "go-productos") { navigate("productos");
			return;
		}
		if (action === "go-quienes" || action === "go-quienes-somos") { navigate("quienes-somos");
			return;
		}

		if (action === "guardar-quienes-somos") {
			await guardarQuienesSomosConfig();
			return;
		}

		if (action === "guardar-quienes-somos-testimonio") {
			const position = Number(actionButton.dataset.position || 0);
			await guardarQuienesSomosTestimonio(position);
			return;
		}

		if (action === "new-publication") {
			openPublicationModal();
			return;
		}

		if (action === "new-product") {
			openProductoModal();
			return;
		}

		if (action === "edit-product") {
			const row = actionButton.closest("tr[data-product-id]");
			if (!row) {
				return;
			}
			const producto = state.productos.find((item) => String(item.id) === String(row.dataset.productId));
			if (producto) {
				openProductoModal(producto);
			}
			return;
		}

		if (action === "toggle-product-estado") {
			const row = actionButton.closest("tr[data-product-id]");
			if (!row) {
				return;
			}
			const producto = state.productos.find((item) => String(item.id) === String(row.dataset.productId));
			if (producto) {
				toggleProductoEstado(producto);
			}
			return;
		}

		if (action === "delete-product") {
			const row = actionButton.closest("tr[data-product-id]");
			if (!row) {
				return;
			}
			const producto = state.productos.find((item) => String(item.id) === String(row.dataset.productId));
			if (producto) {
				deleteProducto(producto);
			}
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

	function renderAdditionalImagesSummary() {
		if (!refs.additionalImagesSummary) {
			return;
		}

		const finalExistingCount = currentExistingAdditionalImages.length;
		const newFilesCount = Array.from(refs.imagenAdicionales.files || []).length;
		const pendingDeletionCount = currentOriginalAdditionalImages.filter(
			(url) => !currentExistingAdditionalImages.includes(url)
		).length;

		refs.additionalImagesSummary.textContent = `Imágenes guardadas: ${finalExistingCount} · Nuevas seleccionadas: ${newFilesCount} · En eliminación: ${pendingDeletionCount}`;
		refs.additionalImagesSummary.classList.toggle("text-warning", pendingDeletionCount > 0);
		refs.additionalImagesSummary.classList.toggle("text-danger", pendingDeletionCount > 0);
		refs.additionalImagesSummary.classList.toggle("text-secondary", pendingDeletionCount === 0);
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
		renderAdditionalImagesSummary();
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
		currentOriginalAdditionalImages = publication ? normalizeAdditionalImages(publication.imagenes_adicionales) : [];
		currentExistingAdditionalImages = [...currentOriginalAdditionalImages];

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
		renderAdditionalImagesSummary();
		refs.imagePreview.src = "";
		refs.imagePreviewWrapper.classList.add("d-none");
		updateSaveButtonText(isEditing);

		if (publication && publication.imagen_url) {
			refs.imagePreview.src = publication.imagen_url;
			refs.imagePreviewWrapper.classList.remove("d-none");
		}

		renderAdditionalImagesPreview();

		const savedDraft = loadDraftFromLocalStorage(publication);
		if (savedDraft && savedDraft.titulo) {
			const recoveryMessage = publication
				? `Se encontró un borrador de edición guardado para esta publicación (${formatDraftAgeLabel(savedDraft.updatedAt)}). Las imágenes seleccionadas no pueden recuperarse y deberán elegirse nuevamente. ¿Deseas recuperarlo?`
				: `Se encontró un borrador de creación guardado (${formatDraftAgeLabel(savedDraft.updatedAt)}). Las imágenes seleccionadas no pueden recuperarse y deberán elegirse nuevamente. ¿Deseas recuperarlo?`;
			const shouldRecover = window.confirm(recoveryMessage);
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
		return DRAFT_STORAGE_KEY;
	}

	function isDraftExpired(draft) {
		if (!draft || !draft.updatedAt) {
			return true;
		}

		const updatedAt = Number(draft.updatedAt);
		if (!Number.isFinite(updatedAt)) {
			return true;
		}

		return Date.now() - updatedAt > DRAFT_MAX_AGE_MS;
	}

	function getDraft() {
		try {
			const raw = localStorage.getItem(getDraftKey());
			if (!raw) {
				return null;
			}

			const draft = JSON.parse(raw);
			if (!draft || typeof draft !== "object") {
				return null;
			}

			if (isDraftExpired(draft)) {
				localStorage.removeItem(getDraftKey());
				return null;
			}

			return draft;
		} catch (error) {
			return null;
		}
	}

	function loadDraftFromLocalStorage(publication = null) {
		const draft = getDraft();
		if (!draft) {
			return null;
		}

		const draftType = draft.draftType === "edit" ? "edit" : "create";
		const publicationId = draft.publicationId ? String(draft.publicationId) : "";

		if (publication) {
			if (draftType !== "edit" || publicationId !== String(publication.id)) {
				return null;
			}
		} else if (draftType === "edit") {
			return null;
		}

		return draft;
	}

	function scheduleDraftSave() {
		window.clearTimeout(draftSaveTimer);
		draftSaveTimer = window.setTimeout(() => {
			saveDraftToLocalStorage();
		}, 250);
	}

	function saveDraftToLocalStorage() {
		const publicationId = refs.publicationId.value.trim();
		const draftType = publicationId ? "edit" : "create";
		const draft = {
			draftType,
			publicationId: draftType === "edit" ? publicationId : null,
			updatedAt: Date.now(),
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

	function formatDraftAgeLabel(updatedAt) {
		if (!updatedAt) {
			return "Último guardado recientemente";
		}

		const ageMinutes = Math.max(1, Math.round((Date.now() - Number(updatedAt)) / 60000));
		if (ageMinutes < 60) {
			return `Último guardado hace ${ageMinutes} min`;
		}

		const hours = Math.round(ageMinutes / 60);
		if (hours < 24) {
			return `Último guardado hace ${hours} h`;
		}

		const days = Math.round(hours / 24);
		return `Último guardado hace ${days} día(s)`;
	}

	function discardDraft() {
		clearDraft();
	}

	function handleModalCloseAttempt() {
		const hasChanges = refs.titulo.value.trim() || refs.descripcion.value.trim() || refs.fechaEvento.value || refs.horaEvento.value || refs.videoUrl.value.trim() || refs.estado.value !== "borrador" || refs.imagenPrincipal.files.length > 0 || refs.imagenAdicionales.files.length > 0;
		if (!hasChanges) {
			closePublicationModal();
			return;
		}

		const shouldLeave = window.confirm("Hay cambios sin guardar. ¿Deseas salir? Se conservará el borrador guardado localmente.");
		if (shouldLeave) {
			closePublicationModal();
		}
	}

	function closePublicationModal() {
		if (refs.titulo.value.trim() || refs.descripcion.value.trim() || refs.fechaEvento.value || refs.horaEvento.value || refs.videoUrl.value.trim() || refs.estado.value !== "borrador" || refs.imagenPrincipal.files.length > 0 || refs.imagenAdicionales.files.length > 0) {
			saveDraftToLocalStorage();
		}

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
		window.clearTimeout(draftSaveTimer);
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
		const horaEvento = refs.horaEvento.value || null;
		const videoUrl = refs.videoUrl.value.trim();
		const estado = refs.estado.value;
		const publicationId = refs.publicationId.value.trim();
		const existingImageUrl = refs.existingImageUrl.value.trim();
		const imagePrincipal = refs.imagenPrincipal.files[0] || null;
		const isEditing = Boolean(publicationId);
		const hasExistingImage = Boolean(existingImageUrl);
		const isDraft = estado === "borrador";
		const additionalImages = Array.from(refs.imagenAdicionales.files || []);
		const preservedExistingAdditionalImages = currentExistingAdditionalImages.slice();
		const removedAdditionalImageUrls = currentOriginalAdditionalImages.filter(
			(url) => !preservedExistingAdditionalImages.includes(url)
		);

		if (isEditing && removedAdditionalImageUrls.length > 0) {
			const shouldContinue = window.confirm(
				`Se eliminarán ${removedAdditionalImageUrls.length} imagen(es) adicional(es) guardadas de Storage. Esta acción solo se aplicará al guardar. ¿Deseas continuar?`
			);
			if (!shouldContinue) {
				return;
			}
		}

		const payload = {
			titulo,
			descripcion,
			fecha_evento: fechaEvento || null,
			hora_evento: horaEvento,
			estado,
			video_url: videoUrl || null
		};

		const validationError = validatePublicationPayload(payload, {
			isDraft,
			isEditing,
			hasExistingImage,
			imageSelected: Boolean(imagePrincipal)
		});

		if (validationError) {
			refs.publicationForm.classList.add("was-validated");
			showFormError(validationError);
			return;
		}

		setSaveLoading(true);

		try {

			let result;
			if (isEditing) {
				result = await PublicacionesService.update(
					publicationId,
					payload,
					imagePrincipal,
					existingImageUrl,
					additionalImages,
					preservedExistingAdditionalImages,
					removedAdditionalImageUrls
				);
				showToast("Publicación actualizada correctamente.", "success");
			} else {
				result = await PublicacionesService.create(payload, imagePrincipal, additionalImages);
				showToast("Publicación creada correctamente.", "success");
			}

			clearDraft();
			closePublicationModal();
			await renderPublicaciones();
			return result;
		} catch (error) {
			console.error("Error al guardar publicacion:", error);
			showFormError(error && error.message ? error.message : "No se pudo guardar la publicacion.");
			showToast("La operación no se completó. La publicación no se guardó.", "danger");
		} finally {
			setSaveLoading(false);
		}
	}

	async function toggleEstado(publication) {
		const nextState = publication.estado === "publicado" ? "borrador" : "publicado";
		const label = nextState === "publicado" ? "Publicado" : "Borrador";
		const shouldToggle = window.confirm(`¿Cambiar el estado de "${publication.titulo}" a ${label}?`);
		if (!shouldToggle) {
			return;
		}

		try {
			await PublicacionesService.toggleEstado(publication.id, publication.estado);
			showToast(`La publicación "${publication.titulo}" cambió a ${label}.`, "success");
			await renderPublicaciones();
		} catch (error) {
			console.error("Error al cambiar estado:", error);
			showToast(`La operación no se completó. No se cambió el estado de "${publication.titulo}".`, "danger");
		}
	}

	async function deletePublication(publication) {
		const confirmDelete = window.confirm(`Se eliminará la publicación "${publication.titulo}" y sus imágenes asociadas de Storage. Esta acción no puede recuperarse desde el panel en esta fase. ¿Continuar?`);
		if (!confirmDelete) {
			return;
		}

		try {
			await PublicacionesService.remove(
				publication.id,
				publication.imagen_url,
				normalizeAdditionalImages(publication.imagenes_adicionales)
			);
			showToast(`La publicación "${publication.titulo}" fue eliminada correctamente.`, "success");
			await renderPublicaciones();
		} catch (error) {
			console.error("Error al eliminar publicacion:", error);
			showToast(`La operación no se completó. La publicación "${publication.titulo}" no se eliminó.`, "danger");
		}
	}

	function isValidDateString(value) {
		if (typeof value !== "string") {
			return false;
		}

		const trimmed = value.trim();
		if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
			return false;
		}

		const date = new Date(`${trimmed}T00:00:00`);
		return !Number.isNaN(date.getTime());
	}

	function isValidTimeString(value) {
		if (typeof value !== "string") {
			return false;
		}

		const trimmed = value.trim();
		if (!/^\d{2}:\d{2}$/.test(trimmed)) {
			return false;
		}

		const [hours, minutes] = trimmed.split(":").map(Number);
		if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
			return false;
		}

		return true;
	}

	function isValidVideoUrl(value) {
		if (!value) {
			return true;
		}

		const trimmed = value.trim();
		if (!trimmed) {
			return true;
		}

		try {
			const url = new URL(trimmed);
			return ["http:", "https:"].includes(url.protocol);
		} catch (error) {
			return false;
		}
	}

	function validatePublicationPayload(payload, validationContext = {}) {
		const {
			isDraft = false,
			isEditing = false,
			hasExistingImage = false,
			imageSelected = false
		} = validationContext;

		const title = String(payload.titulo || "").trim();
		const description = String(payload.descripcion || "").trim();
		const estado = String(payload.estado || "").trim();
		const fechaEvento = payload.fecha_evento ? String(payload.fecha_evento).trim() : "";
		const horaEvento = payload.hora_evento ? String(payload.hora_evento).trim() : "";
		const videoUrl = payload.video_url ? String(payload.video_url).trim() : "";
		const imageAvailable = Boolean(imageSelected || hasExistingImage);

		if (!title || title.length < 3 || title.length > 160) {
			return "El título debe tener entre 3 y 160 caracteres.";
		}

		if (estado !== "borrador" && estado !== "publicado") {
			return "El estado debe ser 'borrador' o 'publicado'.";
		}

		if (!isDraft) {
			if (!description || description.length < 10 || description.length > 1200) {
				return "La descripción es obligatoria y debe tener entre 10 y 1200 caracteres para publicar.";
			}

			if (fechaEvento && !isValidDateString(fechaEvento)) {
				return "La fecha del evento no tiene un formato válido. Usa YYYY-MM-DD.";
			}

			if (horaEvento && !isValidTimeString(horaEvento)) {
				return "La hora del evento no tiene un formato válido. Usa HH:mm.";
			}

			if (videoUrl && !isValidVideoUrl(videoUrl)) {
				return "La URL del video no es válida.";
			}

			if (!imageAvailable) {
				return "Debes seleccionar una imagen principal o conservar la existente antes de publicar.";
			}
		}

		if (isDraft) {
			if (title && title.length > 160) {
				return "El título es demasiado largo para un borrador.";
			}

			if (description && description.length > 1200) {
				return "La descripción es demasiado larga para un borrador.";
			}

			if (fechaEvento && !isValidDateString(fechaEvento)) {
				return "La fecha del evento introducida no es válida.";
			}

			if (horaEvento && !isValidTimeString(horaEvento)) {
				return "La hora del evento introducida no es válida.";
			}

			if (videoUrl && !isValidVideoUrl(videoUrl)) {
				return "La URL del video introducida no es válida.";
			}
		}

		if (estado === "publicado") {
			if (!description || description.length < 10) {
				return "Para publicar, la descripción debe tener contenido real y útil.";
			}

			if (!fechaEvento) {
				return "Para publicar, debes indicar la fecha del evento.";
			}

			if (!imageAvailable) {
				return "Para publicar, debes contar con una imagen principal válida.";
			}
		}

		return null;
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

	function formatEventDate(fecha, hora) {
		if (!fecha) {
			return "-";
		}

		const [year, month, day] = String(fecha).split("-");
		const date = new Date(Number(year), Number(month) - 1, Number(day));

		if (Number.isNaN(date.getTime())) {
			return fecha;
		}

		const formattedDate = date.toLocaleDateString("es-SV", { day: "2-digit", month: "short", year: "numeric"
		});

		if (!hora) {
			return formattedDate;
		}

		const [hours, minutes] = String(hora).split(":");
		const time = new Date(2000, 0, 1, Number(hours), Number(minutes));

		if (Number.isNaN(time.getTime())) {
			return formattedDate;
		}

		const formattedTime = time.toLocaleTimeString("es-SV", {
			hour: "2-digit",
			minute: "2-digit"
		});

		return `${formattedDate}, ${formattedTime}`;
	}

	function formatDateInput(value) {
		if (!value) {
			return "";
		}

		if (typeof value === "string") { const trimmed = value.trim();
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
