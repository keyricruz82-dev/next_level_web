document.addEventListener("DOMContentLoaded", function(){

function applyResponsiveState(){
  const width = window.innerWidth;
  document.body.classList.toggle('is-mobile', width < 768);
  document.body.classList.toggle('is-tablet', width >= 768 && width < 1100);
  document.documentElement.style.setProperty('--viewport-width', `${width}px`);
  document.documentElement.style.setProperty('--viewport-scale', width < 768 ? '0.98' : '1');

  if (window.visualViewport) {
    document.documentElement.style.setProperty('--viewport-height', `${window.visualViewport.height}px`);
  }
}

applyResponsiveState();
window.addEventListener('resize', applyResponsiveState);

// ========================================
// MENU TOGGLE PARA MÓVIL
// ========================================

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

if(menuToggle && navMenu){
  // Toggle menú al hacer click en el botón
  menuToggle.addEventListener("click", function(){
    const isOpen = navMenu.classList.toggle("active");
    menuToggle.setAttribute("aria-expanded", isOpen);
    menuToggle.textContent = isOpen ? '✕' : '☰';
    document.body.classList.toggle('menu-open', isOpen);
  });

  // Cerrar menú al hacer click en cualquier enlace
  const navLinks = navMenu.querySelectorAll("a");
  navLinks.forEach(link => {
    link.addEventListener("click", function(){
      navMenu.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = '☰';
      document.body.classList.remove('menu-open');
    });
  });

  // Cerrar menú al hacer click fuera de él
  document.addEventListener("click", function(event){
    if(navMenu.classList.contains('active') && !menuToggle.contains(event.target) && !navMenu.contains(event.target)){
      navMenu.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = '☰';
      document.body.classList.remove('menu-open');
    }
  });
}

// ========================================// PROTECCIÓN DE IMÁGENES
// ========================================
/*const allImages = document.querySelectorAll('img');
allImages.forEach(img => {
  img.setAttribute('draggable', 'false');
  img.addEventListener('contextmenu', event => event.preventDefault());
  img.addEventListener('mousedown', event => {
    if (event.button === 2) {
      event.preventDefault();
    }
  });
});*/

// ========================================// SCROLL REVEAL - Animaciones al hacer scroll
// ========================================

function revealOnScroll(){
  const revealElements = document.querySelectorAll('.reveal');
  
  revealElements.forEach(element => {
    const elementTop = element.getBoundingClientRect().top;
    const elementVisible = 150;
    
    if(elementTop < window.innerHeight - elementVisible){
      element.classList.add('active');
    }
  });
}

// Agregar clase reveal a elementos
function addRevealClass(){
  const sections = document.querySelectorAll('section');
  const cards = document.querySelectorAll('.card');
  
  sections.forEach(section => {
    if(!section.classList.contains('reveal')){
      section.classList.add('reveal');
    }
  });
  
  cards.forEach(card => {
    if(!card.classList.contains('reveal')){
      card.classList.add('reveal');
    }
  });
}

// Inicializar reveal
addRevealClass();
revealOnScroll();

// Activar reveal al hacer scroll
window.addEventListener('scroll', revealOnScroll);

// ========================================
// SMOOTH SCROLL para enlaces
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e){
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if(target){
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ========================================
// SLIDER AUTOMÁTICO para galería
// ========================================

function initAutoSlider(){
  const slider = document.querySelector('.slider');
  if(!slider) return;

  const visibleCount = parseInt(slider.dataset.visible, 10) || 4;
  let currentPage = 0;
  const slides = slider.querySelectorAll('.slide');
  const totalSlides = slides.length;
  const totalPages = Math.max(1, Math.ceil(totalSlides / visibleCount));

  const controls = document.createElement('div');
  controls.className = 'slider-controls';
  controls.innerHTML = `
    <button class="slider-btn prev" type="button">‹</button>
    <div class="slider-dots"></div>
    <button class="slider-btn next" type="button">›</button>
  `;

  const dotsContainer = controls.querySelector('.slider-dots');
  for(let i = 0; i < totalPages; i++){
    const dot = document.createElement('span');
    dot.className = 'slider-dot';
    if(i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToPage(i));
    dotsContainer.appendChild(dot);
  }

  slider.appendChild(controls);

  function updateSlider(){
    const offset = -currentPage * 100;
    slider.querySelector('.slides').style.transform = `translateX(${offset}%)`;

    const dots = dotsContainer.querySelectorAll('.slider-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentPage);
    });
  }

  function goToPage(index){
    currentPage = Math.min(Math.max(index, 0), totalPages - 1);
    updateSlider();
  }

  function changePage(direction = 1){
    currentPage = (currentPage + direction + totalPages) % totalPages;
    updateSlider();
  }

  controls.querySelector('.prev').addEventListener('click', () => changePage(-1));
  controls.querySelector('.next').addEventListener('click', () => changePage(1));

  let sliderInterval = setInterval(() => changePage(1), 4000);

  slider.addEventListener('mouseenter', () => clearInterval(sliderInterval));
  slider.addEventListener('mouseleave', () => {
    sliderInterval = setInterval(() => changePage(1), 4000);
  });
}

// Slider manual (sin autoplay) para sección de servicios
function initManualSlider(){
  const slider = document.getElementById('serviciosSlider');
  if(!slider) return;

  let currentSlide = 0;
  const slides = slider.querySelectorAll('.slides > *');
  const totalSlides = slides.length;

  // Crear controles
  const controls = document.createElement('div');
  controls.className = 'slider-controls';
  controls.innerHTML = `
    <button class="slider-btn prev">‹</button>
    <div class="slider-dots"></div>
    <button class="slider-btn next">›</button>
  `;

  const dotsContainer = controls.querySelector('.slider-dots');
  for(let i=0;i<totalSlides;i++){
    const dot = document.createElement('span');
    dot.className = 'slider-dot';
    if(i===0) dot.classList.add('active');
    dot.addEventListener('click', ()=> goToSlide(i));
    dotsContainer.appendChild(dot);
  }

  slider.appendChild(controls);

  function updateSlider(){
    const offset = -currentSlide * 100;
    slider.querySelector('.slides').style.transform = `translateX(${offset}%)`;
    const dots = dotsContainer.querySelectorAll('.slider-dot');
    dots.forEach((d,i)=> d.classList.toggle('active', i===currentSlide));
  }

  function changeSlide(dir){
    currentSlide = (currentSlide + dir + totalSlides) % totalSlides;
    updateSlider();
  }

  function goToSlide(i){
    currentSlide = i;
    updateSlider();
  }

  controls.querySelector('.prev').addEventListener('click', ()=> changeSlide(-1));
  controls.querySelector('.next').addEventListener('click', ()=> changeSlide(1));

  // Soporte teclado
  slider.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowRight') changeSlide(1);
    if(e.key === 'ArrowLeft') changeSlide(-1);
  });

  // Hacer foco para recibir teclas
  slider.tabIndex = 0;
}

function initHeroSlider(){
  const slider = document.querySelector('.hero-slider');
  if(!slider) return;

  const slides = slider.querySelectorAll('.hero-slide');
  const totalSlides = slides.length;
  if(totalSlides === 0) return;

  const nav = document.createElement('div');
  nav.className = 'hero-slider-nav';
  const dots = [];

  slides.forEach((slide, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'hero-slider-dot' + (index === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToSlide(index));
    nav.appendChild(dot);
    dots.push(dot);
  });

  slider.parentElement.appendChild(nav);

  let currentSlide = 0;
  let heroInterval = setInterval(nextSlide, 5000);

  function updateSlides(){
    slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === currentSlide);
    });
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlide);
    });
  }

  function nextSlide(){
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSlides();
  }

  function goToSlide(index){
    currentSlide = index;
    updateSlides();
    resetInterval();
  }

  function resetInterval(){
    clearInterval(heroInterval);
    heroInterval = setInterval(nextSlide, 5000);
  }

  slider.addEventListener('mouseenter', () => clearInterval(heroInterval));
  slider.addEventListener('mouseleave', resetInterval);
}

// ========================================
// LAZY LOADING para imágenes
// ========================================

function lazyLoadImages(){
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });
  
  images.forEach(img => {
    imageObserver.observe(img);
  });
}

// ========================================
// FORMULARIO DE CONTACTO
// ========================================

function initContactForm(){
  const form = document.getElementById('contactForm');
  if(!form) return;
  
  form.addEventListener('submit', function(e){
    e.preventDefault();
    
    // Validar formulario
    if(validateForm(form)){
      // Simular envío (en producción usarías fetch/API)
      showMessage('¡Mensaje enviado exitosamente! Te contactaremos pronto.', 'success');
      form.reset();
    }
  });
  
  // Validación en tiempo real
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => clearFieldError(input));
  });
}

function validateForm(form){
  let isValid = true;
  const inputs = form.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    if(!validateField(input)){
      isValid = false;
    }
  });
  
  return isValid;
}

function validateField(field){
  const value = field.value.trim();
  let isValid = true;
  let message = '';
  
  // Limpiar errores previos
  clearFieldError(field);
  
  // Validaciones específicas
  switch(field.name){
    case 'name':
      if(value.length < 2){
        message = 'El nombre debe tener al menos 2 caracteres';
        isValid = false;
      }
      break;
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!emailRegex.test(value)){
        message = 'Ingresa un email válido';
        isValid = false;
      }
      break;
    case 'phone':
      const phoneRegex = /^\+?[\d\s\-\(\)]{8,}$/;
      if(!phoneRegex.test(value)){
        message = 'Ingresa un teléfono válido';
        isValid = false;
      }
      break;
    case 'service':
      if(!value){
        message = 'Selecciona un servicio';
        isValid = false;
      }
      break;
    case 'message':
      if(value.length < 10){
        message = 'El mensaje debe tener al menos 10 caracteres';
        isValid = false;
      }
      break;
  }
  
  if(!isValid){
    showFieldError(field, message);
  }
  
  return isValid;
}

function showFieldError(field, message){
  field.style.borderColor = '#ff6b6b';
  
  let errorElement = field.parentElement.querySelector('.error-message');
  if(!errorElement){
    errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.style.color = '#ff6b6b';
    errorElement.style.fontSize = '14px';
    errorElement.style.marginTop = '5px';
    field.parentElement.appendChild(errorElement);
  }
  errorElement.textContent = message;
}

function clearFieldError(field){
  field.style.borderColor = 'var(--border-color)';
  const errorElement = field.parentElement.querySelector('.error-message');
  if(errorElement){
    errorElement.remove();
  }
}

function showMessage(message, type){
  // Crear elemento de mensaje
  const messageElement = document.createElement('div');
  messageElement.className = `form-message ${type}`;
  messageElement.textContent = message;
  messageElement.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    animation: slideInRight 0.3s ease;
  `;
  
  if(type === 'success'){
    messageElement.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
  } else {
    messageElement.style.background = 'linear-gradient(135deg, #f44336, #d32f2f)';
  }
  
  document.body.appendChild(messageElement);
  
  // Remover después de 5 segundos
  setTimeout(() => {
    messageElement.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => messageElement.remove(), 300);
  }, 5000);
}

// ========================================
// PROFESSIONAL MOSAIC GALLERY LAYOUT
// ========================================

function initCuratedGalleryMosaic(){
  const workItems = Array.from(document.querySelectorAll('.curated-grid .work-item'));
  if(!workItems.length) return;

  // Patrón profesional de mosaic: large, medium, wide, tall, etc.
  const sizePattern = ['large', 'medium', 'medium', 'wide', 'medium', 'medium', 'large', 'medium', 'medium', 'wide', 'medium', 'medium', 'medium', 'medium', 'large', 'medium'];

  workItems.forEach((item, index) => {
    item.classList.remove('large', 'medium', 'wide', 'tall');
    item.classList.remove('is-last-row');
    item.style.gridColumn = '';
    item.style.justifySelf = '';

    const sizeClass = sizePattern[index % sizePattern.length];
    item.classList.add(sizeClass);
  });

  const columnsPerRow = 4;
  const trailingCount = workItems.length % columnsPerRow;

  if (trailingCount === 0) return;

  const placementsByCount = {
    1: [2],
    2: [2, 3],
    3: [2, 3, 4]
  };

  const lastRowStart = workItems.length - trailingCount;
  const placements = placementsByCount[trailingCount] || [];

  workItems.slice(lastRowStart).forEach((item, offset) => {
    const columnStart = placements[offset] || offset + 1;
    item.classList.add('is-last-row');
    item.style.gridColumn = String(columnStart);
    item.style.justifySelf = 'center';
  });
}

async function loadPublicGallery(){
  const grid = document.querySelector('.curated-grid');
  if(!grid) return;

  const supabase = window.supabaseClient || window.supabase;
  if(!supabase || typeof supabase.from !== 'function'){
    console.error('No se encontró el cliente de Supabase para la galería pública.');
    return;
  }

  try {
    const { data, error } = await supabase
      .from('inicio_web_galeria')
      .select('id, image_url')
      .eq('is_visible', true);

    if (error) {
      throw error;
    }

    grid.innerHTML = '';

    const visibleImages = Array.isArray(data) ? data.filter(item => item && typeof item.image_url === 'string' && item.image_url.trim()) : [];

    visibleImages.forEach((item, index) => {
      const workItem = document.createElement('div');
      workItem.className = 'work-item';

      const image = document.createElement('img');
      image.src = item.image_url;
      image.alt = `Imagen de galería ${index + 1}`;
      image.loading = 'lazy';

      workItem.appendChild(image);
      grid.appendChild(workItem);
    });

    initCuratedGalleryMosaic();
    refreshGalleryImageCollection();
  } catch (error) {
    console.error('Error al cargar la galería pública de Inicio Web:', error);
    grid.innerHTML = '';
  }
}

// TIPOGRAFÍA DINÁMICA - INICIO WEB

async function applyInicioWebTypography() {

    const supabase =
        window.supabaseClient || window.supabase;

    if (!supabase || typeof supabase.from !== "function") {
        console.warn(
            "No se encontró un cliente válido de Supabase para la tipografía."
        );
        return;
    }

    const typographyMap = {
    hero_eyebrow: ".hero-copy .eyebrow",
    hero_titulo: ".hero-copy h1",
    hero_boton: ".hero-copy .cta-btn",

    banner1_tag: "[data-inicio-web-elemento='banner1_tag']",
    banner1_titulo: "[data-inicio-web-elemento='banner1_titulo']",
    banner1_descripcion: "[data-inicio-web-elemento='banner1_descripcion']",

    banner2_tag: "[data-inicio-web-elemento='banner2_tag']",
    banner2_titulo: "[data-inicio-web-elemento='banner2_titulo']",
    banner2_descripcion: "[data-inicio-web-elemento='banner2_descripcion']",

    galeria_titulo: "[data-inicio-web-elemento='galeria_titulo']"
};

    try {

        const { data, error } = await supabase
            .from("inicio_web_styles")
            .select("*");

        if (error) {
            throw error;
        }

        if (!Array.isArray(data)) {
            return;
        }

        const bannerBackgroundMap = {};

        data.forEach((style) => {
            if (!style || !style.elemento) {
                return;
            }

            const color1 = /^#[0-9a-fA-F]{6}$/.test(style.background_color_1 || "")
                ? style.background_color_1
                : "#090c11";

            const color2 = /^#[0-9a-fA-F]{6}$/.test(style.background_color_2 || "")
                ? style.background_color_2
                : "#454a52";

            const color3 = /^#[0-9a-fA-F]{6}$/.test(style.background_color_3 || "")
                ? style.background_color_3
                : null;

            if (style.elemento === "banner1_background") {
                bannerBackgroundMap.banner1_background = {
                    color1,
                    color2,
                    color3
                };
            }

            if (style.elemento === "banner2_background") {
                bannerBackgroundMap.banner2_background = {
                    color1,
                    color2,
                    color3
                };
            }
        });

        document.querySelectorAll(".banner-card").forEach((card) => {
            const key = card.dataset.bannerBackground;
            const selected = bannerBackgroundMap[key] || {
                color1: "#090c11",
                color2: "#454a52",
                color3: null
            };
            const bannerContent = card.querySelector(".banner-content");
            const gradient = selected.color3
                ? `linear-gradient(90deg, ${selected.color1} 0%, ${selected.color2} 50%, ${selected.color3} 100%)`
                : `linear-gradient(90deg, ${selected.color1} 0%, ${selected.color1} 48%, ${selected.color2} 49%, ${selected.color2} 100%)`;

            if (bannerContent) {
                bannerContent.style.background = gradient;
                card.style.background = "transparent";
                return;
            }

            card.style.background = gradient;
        });

        data.forEach(style => {

            const selector =
                typographyMap[style.elemento];

            if (!selector) {
                return;
            }

            const element =
                document.querySelector(selector);

            if (!element) {
                console.warn(
                    `No se encontró el elemento público para: ${style.elemento}`
                );
                return;
            }

            // FUENTE
            if (
                style.fuente &&
                style.fuente !== "inherit"
            ) {
                element.style.fontFamily =
                    `"${style.fuente}", sans-serif`;
            } else {
                element.style.removeProperty(
                    "font-family"
                );
            }

            // PESO
            element.style.fontWeight =
                style.peso ?? "";

            // TAMAÑO
            element.style.fontSize =
                style.tamano != null
                    ? `${style.tamano}px`
                    : "";

            // ESTILO
            element.style.fontStyle =
                style.estilo ?? "normal";

            // ALINEACIÓN
            element.style.textAlign =
                style.alineacion ?? "";

            // COLOR
            element.style.color =
                style.color ?? "";

            // TRANSFORMACIÓN
            element.style.textTransform =
                style.transformacion ?? "none";

            // ALTURA DE LÍNEA
            element.style.lineHeight =
                style.line_height ?? "";

            // ESPACIADO
            element.style.letterSpacing =
                style.letter_spacing != null
                    ? `${style.letter_spacing}px`
                    : "";
        });

    } catch (error) {

        console.error(
            "Error al aplicar la tipografía de Inicio Web:",
            error
        );
    }
}

// INICIALIZACIÓN 

async function loadPublicExpertiseSlider() {
  const slider = document.getElementById("expertiseSlider");
  if (!slider) {
    return;
  }

  try {
    if (!window.InicioWebService || typeof window.InicioWebService.listExpertise !== "function") {
      return;
    }

    const items = await window.InicioWebService.listExpertise();
    const visibleItems = (items || []).filter((item) => item && item.is_visible !== false);

    if (!visibleItems.length) {
      slider.innerHTML = "";
      return;
    }

    const cardsHtml = visibleItems.map((item, index) => {
      const isVideo = item.media_type === "video";
      const altText = item.alt_text || (isVideo ? "Video de expertise" : "Imagen de expertise");

      if (isVideo) {
        const videoUrl = item.video_url || "videos/vid.mp4";
        const detectedType = window.InicioWebService.detectExpertiseVideoType(videoUrl);

        if (detectedType === "direct-video") {
          return `
            <div class="category-card ${index === 0 ? "active" : ""}">
              <video autoplay muted loop playsinline aria-label="${altText}" src="${videoUrl}"></video>
            </div>
          `;
        }

        if (["youtube", "vimeo"].includes(detectedType)) {
          const embedUrl = window.InicioWebService.getExpertiseVideoEmbedUrl(videoUrl);
          if (embedUrl) {
            return `
              <div class="category-card ${index === 0 ? "active" : ""}">
                <iframe
                  src="${embedUrl}"
                  title="${altText}"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                  loading="lazy"
                  referrerpolicy="strict-origin-when-cross-origin"
                  style="width:100%;height:100%;border:0;display:block;"
                ></iframe>
              </div>
            `;
          }
        }

        if (["tiktok", "instagram", "facebook"].includes(detectedType)) {
          return `
            <div class="category-card ${index === 0 ? "active" : ""}">
              <div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#111827;color:#fff;text-align:center;padding:1rem;">
                <div>
                  <div style="font-weight:600;margin-bottom:0.5rem;">Enlace de video no compatible para vista previa.</div>
                  <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" style="color:#fff;text-decoration:underline;">Abrir enlace</a>
                </div>
              </div>
            </div>
          `;
        }

        return `
          <div class="category-card ${index === 0 ? "active" : ""}">
            <video autoplay muted loop playsinline aria-label="${altText}" src="${videoUrl}"></video>
          </div>
        `;
      }

      const imageUrl = window.InicioWebService.buildExpertisePublicImageUrl(item.id);
      return `
        <div class="category-card ${index === 0 ? "active" : ""}">
          <img src="${imageUrl}" alt="${altText}">
        </div>
      `;
    }).join("");

    slider.innerHTML = cardsHtml;
  } catch (error) {
    console.error("Error cargando expertise público:", error);
  }
}

function initExpertiseSlider() {
  const slider = document.getElementById("expertiseSlider");
  const hoverLeft = document.getElementById("hoverLeft");
  const hoverRight = document.getElementById("hoverRight");

  if (!slider || slider.dataset.initialized === "true") {
    return;
  }

  const originalChildren = Array.from(slider.children);
  if (!originalChildren.length) {
    return;
  }

  slider.innerHTML += slider.innerHTML;
  slider.dataset.initialized = "true";

  let speed = 1.5;
  let boostSpeed = 5;
  let currentSpeed = speed;
  let direction = 1;

  function animateSlider() {
    slider.scrollLeft += currentSpeed * direction;

    const halfWidth = slider.scrollWidth / 2;

    if (slider.scrollLeft >= halfWidth) {
      slider.scrollLeft -= halfWidth;
    }

    if (slider.scrollLeft <= 0) {
      slider.scrollLeft += halfWidth;
    }

    requestAnimationFrame(animateSlider);
  }

  if (hoverRight) {
    hoverRight.addEventListener("mouseenter", () => {
      direction = 1;
      currentSpeed = boostSpeed;
    });

    hoverRight.addEventListener("mouseleave", () => {
      direction = 1;
      currentSpeed = speed;
    });
  }

  if (hoverLeft) {
    hoverLeft.addEventListener("mouseenter", () => {
      direction = -1;
      currentSpeed = boostSpeed;
    });

    hoverLeft.addEventListener("mouseleave", () => {
      direction = 1;
      currentSpeed = speed;
    });
  }

  slider.addEventListener("mouseenter", () => {
    currentSpeed = 0;
  });

  slider.addEventListener("mouseleave", () => {
    currentSpeed = speed;
  });

  slider.addEventListener("touchstart", () => {
    currentSpeed = 0;
  });

  slider.addEventListener("touchend", () => {
    currentSpeed = speed;
  });

  slider.scrollLeft = 1;
  animateSlider();
}

initCuratedGalleryMosaic();
loadPublicGallery();
initHeroSlider();
initAutoSlider();
initManualSlider();
lazyLoadImages();
initContactForm();
applyInicioWebTypography();
loadPublicExpertiseSlider().then(() => {
  initExpertiseSlider();
});
});

document.addEventListener("DOMContentLoaded", function(){

    const btnTop = document.getElementById("btnTop");
    if(!btnTop) return;

    btnTop.style.display = "none";

    // Mostrar botón
    window.addEventListener("scroll", function(){
        if(window.scrollY > 300){
            btnTop.style.display = "block";
        } else {
            btnTop.style.display = "none";
        }
    });

    // Subir al inicio
    btnTop.addEventListener("click", function(){
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

});
/* =========================
ANIMACIÓN SUAVE EN TARJETAS
========================= */
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transition = "all 0.4s ease";
    });
});
/* =========================
LIGHTBOX GALERÍA CON NAVEGACIÓN
========================= */

let galleryImages = [];
let currentIndex = 0;

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const closeLightbox = document.getElementById('closeLightbox');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

function refreshGalleryImageCollection(){
    galleryImages = Array.from(document.querySelectorAll('.curated-grid .work-item img'));
    return galleryImages;
}

function showImage(index){
    const activeImages = refreshGalleryImageCollection();
    if (!activeImages.length) {
        return;
    }

    currentIndex = (index + activeImages.length) % activeImages.length;
    if (lightbox && lightboxImg) {
        lightbox.style.display = 'flex';
        lightboxImg.src = activeImages[currentIndex].src;
        lightboxImg.alt = activeImages[currentIndex].alt || 'Vista completa';
    }
}

function nextImage(){
    const activeImages = refreshGalleryImageCollection();
    if (!activeImages.length) {
        return;
    }

    currentIndex = (currentIndex + 1) % activeImages.length;
    if (lightboxImg) {
        lightboxImg.src = activeImages[currentIndex].src;
        lightboxImg.alt = activeImages[currentIndex].alt || 'Vista completa';
    }
}

function prevImage(){
    const activeImages = refreshGalleryImageCollection();
    if (!activeImages.length) {
        return;
    }

    currentIndex = (currentIndex - 1 + activeImages.length) % activeImages.length;
    if (lightboxImg) {
        lightboxImg.src = activeImages[currentIndex].src;
        lightboxImg.alt = activeImages[currentIndex].alt || 'Vista completa';
    }
}

if (lightbox && lightboxImg && closeLightbox && prevBtn && nextBtn) {
    const curatedGrid = document.querySelector('.curated-grid');

    if (curatedGrid) {
        curatedGrid.addEventListener('click', (event) => {
            const clickedImage = event.target.closest('.work-item img');
            if (!clickedImage) {
                return;
            }

            const activeImages = refreshGalleryImageCollection();
            const imageIndex = activeImages.indexOf(clickedImage);
            if (imageIndex >= 0) {
                showImage(imageIndex);
            }
        });
    }

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        nextImage();
    });

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        prevImage();
    });

    closeLightbox.addEventListener('click', () => {
        lightbox.style.display = 'none';
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display !== 'flex') {
            return;
        }

        if (e.key === 'ArrowRight') {
            nextImage();
        }

        if (e.key === 'ArrowLeft') {
            prevImage();
        }

        if (e.key === 'Escape') {
            lightbox.style.display = 'none';
        }
    });
}

refreshGalleryImageCollection();

