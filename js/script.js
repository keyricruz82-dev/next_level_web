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
const allImages = document.querySelectorAll('img');
allImages.forEach(img => {
  img.setAttribute('draggable', 'false');
  img.addEventListener('contextmenu', event => event.preventDefault());
  img.addEventListener('mousedown', event => {
    if (event.button === 2) {
      event.preventDefault();
    }
  });
});

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
// INICIALIZACIÓN
// ========================================

initHeroSlider();
initAutoSlider();
initManualSlider();
lazyLoadImages();
initContactForm();
});

//Chatg
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

const galleryImages = document.querySelectorAll('.work-item img');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const closeLightbox = document.getElementById('closeLightbox');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

if (lightbox && lightboxImg && closeLightbox && prevBtn && nextBtn) {
    let currentIndex = 0;

    /* ABRIR */
    function showImage(index){
        currentIndex = index;
        lightbox.style.display = 'flex';
        lightboxImg.src = galleryImages[currentIndex].src;
    }

    /* CLICK IMAGEN */
    galleryImages.forEach((image, index) => {
        image.addEventListener('click', () => {
            showImage(index);
        });
    });

    /* SIGUIENTE */
    function nextImage(){
        currentIndex = (currentIndex + 1) % galleryImages.length;
        lightboxImg.src = galleryImages[currentIndex].src;
    }

    /* ANTERIOR */
    function prevImage(){
        currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        lightboxImg.src = galleryImages[currentIndex].src;
    }

    /* BOTONES */
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        nextImage();
    });

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        prevImage();
    });

    /* CERRAR */
    closeLightbox.addEventListener('click', () => {
        lightbox.style.display = 'none';
    });

    /* CLICK FUERA */
    lightbox.addEventListener('click', (e) => {
        if(e.target === lightbox){
            lightbox.style.display = 'none';
        }
    });

    /* TECLADO */
    document.addEventListener('keydown', (e) => {

        if(lightbox.style.display === 'flex'){

            if(e.key === 'ArrowRight'){
                nextImage();
            }

            if(e.key === 'ArrowLeft'){
                prevImage();
            }

            if(e.key === 'Escape'){
                lightbox.style.display = 'none';
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {

    const slider = document.getElementById("expertiseSlider");
    const hoverLeft = document.getElementById("hoverLeft");
    const hoverRight = document.getElementById("hoverRight");

    if (!slider) return;

    /* CLONAR ELEMENTOS */
    const items = slider.innerHTML;
    slider.innerHTML += items;

    let speed = 1.5;
    let boostSpeed = 5;
    let currentSpeed = speed;
    let direction = 1;

    let animationFrame;

    function animateSlider() {
        slider.scrollLeft += currentSpeed * direction;

        const halfWidth = slider.scrollWidth / 2;

        /* LOOP SUAVE */
        if (slider.scrollLeft >= halfWidth) {
            slider.scrollLeft -= halfWidth;
        }

        if (slider.scrollLeft <= 0) {
            slider.scrollLeft += halfWidth;
        }

        animationFrame = requestAnimationFrame(animateSlider);
    }

    /* DERECHA */
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

    /* IZQUIERDA */
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

    /* PAUSA */
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

    /* POSICIÓN INICIAL IMPORTANTE */
    slider.scrollLeft = 1;

    animateSlider();

});