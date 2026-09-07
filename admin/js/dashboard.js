(function () {
	const state = {
		user: null,
		publicaciones: [],
		productos: [],
		currentView: "publicaciones"
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
		const toneClass = type === "danger"
			? "text-bg-danger"
			: type === "warning"
				? "text-bg-warning"
				: "text-bg-success";

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
	async function navigate(view) { const validViews = 
		[ "inicio", "publicaciones", "productos", "quienes-somos"
    ];

    const targetView = validViews.includes(view)
        ? view
        : "inicio";

    state.currentView = targetView;
    setActiveNav(targetView);
    refs.sidebar.classList.remove("is-open");

    if (targetView === "inicio") {
        await renderInicio();
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
							<h2 class="h4 mb-0">Imágenes de productos</h2>
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
					<div class="alert alert-warning mb-0" role="alert">
						No se pudieron cargar las imágenes del sitio. Revisa la configuración de Supabase y la tabla <strong>site_media</strong>.
					</div>
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
						<p class="hero-eyebrow mb-2">Panel Administrativo privado</p>
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
    try {
        const [publicationStats, productos] = await Promise.all([
            PublicacionesService.getStats(),
            ProductosService.list()
        ]);

        const totalServicios = Array.isArray(productos)
            ? productos.length
            : 0;

        const serviciosPublicados = Array.isArray(productos)
            ? productos.filter(
                (item) => String(item.estado || "").toLowerCase() === "publicado"
            ).length
            : 0;

        const serviciosBorrador = totalServicios - serviciosPublicados;

        refs.contentArea.innerHTML = `
            <section class="hero-panel mb-4">
                <div class="hero-copy">
                    <p class="hero-eyebrow mb-2">Panel Administrativo privado</p>
                    <h1 class="h3 mb-2">Inicio</h1>
                    <p class="text-secondary mb-0">
                        Bienvenido al panel administrativo de Next Level Producciones.
                        Desde aquí puedes gestionar el contenido de tu sitio web.
                    </p>
                </div>
            </section>

            <div class="row g-3 mb-4">
                <div class="col-12 col-md-4">
                    <div class="card card-stat h-100">
                        <div class="card-body">
                            <p class="text-secondary mb-2">Publicaciones</p>
                            <p class="value mb-1">${publicationStats.total ?? 0}</p>
                            <small class="text-secondary">
                                ${publicationStats.publicadas ?? 0} publicadas ·
                                ${publicationStats.borradores ?? 0} borradores
                            </small>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-md-4">
                    <div class="card card-stat h-100">
                        <div class="card-body">
                            <p class="text-secondary mb-2">Servicios</p>
                            <p class="value mb-1">${totalServicios}</p>
                            <small class="text-secondary">
                                ${serviciosPublicados} publicados ·
                                ${serviciosBorrador} borradores
                            </small>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-md-4">
                    <div class="card card-stat h-100">
                        <div class="card-body">
                            <p class="text-secondary mb-2">Estado del panel</p>
                            <p class="value mb-1 text-success">Activo</p>
                            <small class="text-secondary">
                                Sesión administrativa autorizada
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            <section class="mb-4">
                <div class="d-flex align-items-center justify-content-between mb-3">
                    <div>
                        <p class="hero-eyebrow mb-1">Accesos rápidos</p>
                        <h2 class="h5 mb-0">Gestionar contenido</h2>
                    </div>
                </div>

                <div class="row g-3">
                    <div class="col-12 col-md-6">
                        <div class="card h-100">
                            <div class="card-body d-flex flex-column">
                                <h3 class="h5 mb-2">Publicaciones</h3>
                                <p class="text-secondary mb-4">
                                    Administra las actividades, eventos y publicaciones
                                    que aparecen en el sitio web.
                                </p>
                                <div class="mt-auto">
                                    <button
                                        class="btn btn-primary"
                                        data-action="go-publicaciones"
                                        type="button"
                                    >
                                        Administrar publicaciones
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 col-md-6">
                        <div class="card h-100">
                            <div class="card-body d-flex flex-column">
                                <h3 class="h5 mb-2">Servicios</h3>
                                <p class="text-secondary mb-4">
                                    Gestiona los servicios, imágenes y contenido
                                    que se muestran en la página de servicios.
                                </p>
                                <div class="mt-auto">
                                    <button
                                        class="btn btn-primary"
                                        data-action="go-productos"
                                        type="button"
                                    >
                                        Administrar servicios
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div class="section-note">
                <span class="section-chip">
                    Next Level Producciones
                </span>
                <span class="section-chip">
                    CMS Administrativo
                </span>
            </div>
        `;
    } catch (error) {
        console.error("Error cargando inicio:", error);

        refs.contentArea.innerHTML = `
            <section class="hero-panel">
                <div class="hero-copy">
                    <p class="hero-eyebrow mb-2">Panel Administrativo privado</p>
                    <h1 class="h3 mb-2">Inicio</h1>
                    <p class="text-danger mb-2">
                        No se pudo cargar el resumen del panel.
                    </p>
                    <p class="text-secondary mb-0">
                        ${escapeHtml(
                            error && error.message
                                ? error.message
                                : "Error desconocido."
                        )}
                    </p>
                </div>
            </section>
        `;
    }
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
					<td><span class="badge badge-estado ${item.estado === "publicado" ? "text-bg-success" : "text-bg-warning"}">${escapeHtml(capitalize(item.estado))}</span></td>
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
						<p class="text-secondary text-uppercase small fw-semibold mb-2">Publicaciones</p>
						<h3 class="h5 mb-2">No se encontraron publicaciones</h3>
						<p class="text-secondary mb-4">No hay resultados para "${escapeHtml(stateFilters.search)}" con el filtro seleccionado.</p>
						<button class="btn btn-primary" data-action="new-publication">Crear nueva publicacion</button>
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

			if (fechaEvento && !isValidDateString(fechaEvento)) {
				return "La fecha del evento no es una fecha real.";
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

		const formattedDate = date.toLocaleDateString("es-SV", {
			day: "2-digit",
			month: "short",
			year: "numeric"
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
