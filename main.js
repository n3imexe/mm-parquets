import './style.css';
import { buildQuoteMessage, buildWhatsAppUrl } from './quote.js';

const $ = (selector) => document.querySelector(selector);
const menuButton = $('.menu-toggle');
const navigation = $('#navigation');
const closeMenu = () => {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
  navigation.classList.remove('is-open');
};
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  navigation.classList.toggle('is-open', open);
});
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.header, .site-header')) closeMenu();
});
window.matchMedia('(min-width: 801px)').addEventListener('change', (event) => {
  if (event.matches) closeMenu();
});
$('#year').textContent = new Date().getFullYear();

document.querySelectorAll('#navigation > a').forEach((link) => {
  if (link.getAttribute('href') === window.location.pathname) link.setAttribute('aria-current', 'page');
});

const materials = {
  roble: { name: 'Roble natural', subtitle: 'Tono cálido que deja visible la veta.', tag: 'NATURAL', number: '01' },
  nogal: { name: 'Nogal cálido', subtitle: 'Tono oscuro para un contraste más marcado.', tag: 'OSCURO', number: '02' },
  claro: { name: 'Roble claro', subtitle: 'Tono suave para un acabado más luminoso.', tag: 'CLARO', number: '03' },
};
const tabs = [...document.querySelectorAll('[data-material]')];
function selectMaterial(tab) {
  const key = tab.dataset.material;
  const material = materials[key];
  tabs.forEach((item) => {
    item.setAttribute('aria-selected', String(item === tab));
    item.tabIndex = item === tab ? 0 : -1;
  });
  $('.wood-scene').dataset.tone = key;
  $('#material-name').textContent = material.name;
  $('#material-subtitle').textContent = material.subtitle;
  $('#material-tag').textContent = material.tag;
  $('.material-number').innerHTML = `${material.number} <span>/ 03</span>`;
  $('#material-panel').setAttribute('aria-labelledby', tab.id);
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectMaterial(tab));
  tab.addEventListener('keydown', (event) => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      selectMaterial(tabs[next]);
      tabs[next].focus();
    }
  });
});

const dialog = $('#detail-dialog');
const content = $('#dialog-content');
function openDialog(html) {
  content.innerHTML = html;
  dialog.showModal();
  document.body.classList.add('dialog-open');
}
dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
$('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});
const services = {
  instalacion: {
    title: 'Instalación de parquet.',
    text: 'Instalación de parquet, laminados y tarimas en viviendas, locales y oficinas. Antes de elegir el material, revisión del soporte, el paso de personas y las necesidades de limpieza del espacio.',
    items: ['Asesoramiento sobre el material y el sistema de colocación.', 'Valoración de la base y su preparación.', 'Definición del patrón, las juntas, los rodapiés y los remates.', 'Planificación según el acceso y el uso de la vivienda o negocio.'],
    value: 'Instalación de parquet',
  },
  restauracion: {
    title: 'Recupera tu parquet.',
    text: 'Un parquet desgastado no siempre necesita cambiarse. Comprobación del tipo de parquet, el espesor útil de madera y los daños para saber si puede lijarse y renovarse.',
    items: ['Revisión del estado y viabilidad de la restauración.', 'Lijado y preparación de la madera apta.', 'Reparación de piezas y desperfectos cuando sea posible.', 'Barnizado o aceitado, con indicaciones de secado y uso.'],
    value: 'Restauración de parquet',
  },
  acabados: {
    title: 'Pulir y barnizar.',
    text: 'Lijado progresivo para eliminar marcas y desgaste, seguido de barniz o aceite para proteger la madera. El acabado influye en el aspecto, el tacto y los cuidados del parquet.',
    items: ['Lijado progresivo y preparación de la superficie.', 'Barniz al agua mate, satinado o brillo, o aceite para un tacto natural.', 'Reparación de marcas y desgaste antes del acabado.', 'Limpieza y tratamiento protector. Instrucciones de mantenimiento.'],
    value: 'Pulir y barnizar',
  },
};
document.querySelectorAll('[data-service]').forEach((button) => {
  button.addEventListener('click', () => {
    const service = services[button.dataset.service];
    openDialog(`<p class="eyebrow">MM PARQUET / SERVICIOS</p><h2 id="dialog-title">${service.title}</h2><p>${service.text}</p><ul>${service.items.map((item) => `<li>${item}</li>`).join('')}</ul><p>El alcance y la disponibilidad se confirman al valorar tu proyecto.</p><a class="button button-dark" href="#contacto" id="dialog-quote">Consultar mi proyecto <span aria-hidden="true">↗</span></a>`);
    $('#dialog-quote').addEventListener('click', () => {
      dialog.close();
      $('[name="servicio"]').value = service.value;
      setTimeout(() => $('[name="nombre"]').focus({ preventScroll: true }), 350);
    });
  });
});

const samplePhotos = [...document.querySelectorAll('[data-sample-photo]')];
let photoViewer = null;
const photoNumber = (index) => String(index + 1).padStart(2, '0');
document.querySelectorAll('.project-viewer').forEach((viewer) => {
  const photos = [...viewer.querySelectorAll('[data-project-photo]')];
  const image = viewer.querySelector('[data-project-image]');
  const caption = viewer.querySelector('[data-project-caption]');
  const expand = viewer.querySelector('[data-project-expand]');
  let index = 0;
  function selectProject(next) {
    index = next;
    const photo = photos[index];
    const photoImage = photo.querySelector('img');
    image.src = photoImage.currentSrc || photoImage.src;
    image.alt = photoImage.alt;
    if (caption) caption.textContent = `${photoNumber(index)} / ${String(photos.length).padStart(2, '0')} — ${photo.dataset.caption}`;
    photos.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  }
  photos.forEach((button, i) => {
    button.addEventListener('click', () => selectProject(i));
    button.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight') next = (i + 1) % photos.length;
      if (event.key === 'ArrowLeft') next = (i + photos.length - 1) % photos.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = photos.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        selectProject(next);
        photos[next].focus();
      }
    });
  });
  expand.addEventListener('click', () => openPhoto(photos, index, 'Fotografía de una misma instalación de MM Parquet.'));
});
function renderPhoto() {
  const { photos, index } = photoViewer;
  const photo = photos[index];
  const image = photo.querySelector('img');
  $('#viewer-image').src = image.currentSrc || image.src;
  $('#viewer-image').alt = image.alt;
  $('#dialog-title').textContent = photo.dataset.caption;
  $('#viewer-count').textContent = `${photoNumber(index)} / ${String(photos.length).padStart(2, '0')}`;
  const badge = $('#viewer-badge');
  if (badge) {
    const caption = photo.dataset.caption || '';
    const isBefore = /antes/i.test(caption);
    const isAfter = /despu/i.test(caption);
    badge.textContent = isBefore ? 'ANTES' : isAfter ? 'DESPUÉS' : '';
    badge.className = `viewer-badge ${isBefore ? 'viewer-badge-before' : isAfter ? 'viewer-badge-after' : 'viewer-badge-hidden'}`;
  }
}
function stepPhoto(direction) {
  photoViewer.index = (photoViewer.index + direction + photoViewer.photos.length) % photoViewer.photos.length;
  renderPhoto();
}
function openPhoto(photos, index, note) {
  photoViewer = { photos, index };
  dialog.classList.add('photo-dialog');
  openDialog(`<div class="viewer-stage"><img class="viewer-image" id="viewer-image" alt=""><span id="viewer-badge" class="viewer-badge viewer-badge-hidden"></span></div><h2 id="dialog-title"></h2><p class="viewer-note">${note}</p><div class="viewer-controls"><button id="viewer-prev" aria-label="Fotografía anterior">← Anterior</button><span class="viewer-count" id="viewer-count" aria-live="polite"></span><button id="viewer-next" aria-label="Fotografía siguiente">Siguiente →</button></div>`);
  renderPhoto();
  $('#viewer-prev').addEventListener('click', () => stepPhoto(-1));
  $('#viewer-next').addEventListener('click', () => stepPhoto(1));
}
samplePhotos.forEach((button, index) => button.addEventListener('click', () => openPhoto(samplePhotos, index, 'Fotografía de muestras. Confirma la referencia, sus características y disponibilidad antes de elegir.')));
const workPhotos = [...document.querySelectorAll('[data-work-photo]')];
workPhotos.forEach((button, index) => button.addEventListener('click', () => openPhoto(workPhotos, index, 'Fotografías de trabajos reales de MM Parquet.')));
const comparePhotos = [...document.querySelectorAll('[data-compare-photo]')];
comparePhotos.forEach((button, index) => button.addEventListener('click', () => openPhoto(comparePhotos, index, 'Antes y después de una restauración de MM Parquet.')));
document.querySelectorAll('[data-compare-gallery]').forEach((gallery) => {
  const container = gallery.parentElement.querySelector('[data-compare-photos]');
  const imgs = container ? [...container.querySelectorAll('img')] : [];
  if (imgs.length) {
    const photoNodes = imgs.map((img) => ({ querySelector: () => img, dataset: { caption: img.dataset.caption } }));
    gallery.querySelectorAll('[data-compare-open]').forEach((button) => button.addEventListener('click', () => openPhoto(photoNodes, 0, 'Antes y después de una restauración de MM Parquet.')));
  }
  const slider = gallery.querySelector('[data-compare-slider]');
  if (slider) initCompareSlider(slider);
});
document.querySelectorAll('[data-compare-slider]').forEach((slider) => {
  if (!slider.closest('[data-compare-gallery]')) initCompareSlider(slider);
});
function initCompareSlider(slider) {
  const before = slider.querySelector('.compare-slider-before, .compare-before');
  const handle = slider.querySelector('.compare-slider-handle, .compare-handle');
  if (!before || !handle) return;
  let dragging = false;
  let percent = 50;
  function setPos(p) {
    percent = Math.max(0, Math.min(100, p));
    before.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
    handle.style.left = `${percent}%`;
  }
  function pointerPos(e) {
    const rect = slider.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    return (x / rect.width) * 100;
  }
  let startX = 0, startY = 0, locked = false;
  slider.addEventListener('pointerdown', (e) => { dragging = true; setPos(pointerPos(e)); });
  window.addEventListener('pointermove', (e) => { if (dragging) setPos(pointerPos(e)); });
  window.addEventListener('pointerup', () => { dragging = false; });
  slider.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; locked = false; }, { passive: true });
  slider.addEventListener('touchmove', (e) => {
    if (!locked) {
      const dx = Math.abs(e.touches[0].clientX - startX);
      const dy = Math.abs(e.touches[0].clientY - startY);
      if (dx < 8 && dy < 8) return;
      locked = dy > dx;
    }
    if (locked) return;
    setPos(pointerPos(e));
  }, { passive: true });
  setPos(50);
}
dialog.addEventListener('keydown', (event) => {
  if (photoViewer && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault();
    stepPhoto(event.key === 'ArrowRight' ? 1 : -1);
  }
});
dialog.addEventListener('close', () => {
  photoViewer = null;
  dialog.classList.remove('photo-dialog');
});
const projectCarousel = document.querySelector('.project-carousel');
const projectGroups = [...document.querySelectorAll('[data-project-group]')];
const projectPrev = document.querySelector('.project-prev');
const projectNext = document.querySelector('.project-next');
const projectDots = document.querySelector('.project-dots');
let projectCurrent = 0;
function updateProjectDots(index) {
  projectCurrent = index;
  if (projectDots) {
    [...projectDots.children].forEach((dot, i) => {
      dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
  }
}
function scrollToProject(index) {
  const clamped = Math.max(0, Math.min(index, projectGroups.length - 1));
  const target = projectGroups[clamped];
  if (target) {
    const carouselRect = projectCarousel.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    projectCarousel.scrollTo({ left: projectCarousel.scrollLeft + (targetRect.left - carouselRect.left), behavior: 'smooth' });
  }
  updateProjectDots(clamped);
}
if (projectCarousel && projectGroups.length > 0) {
  if (projectDots) {
    projectGroups.forEach((group, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Ir al proyecto ${i + 1}: ${group.dataset.projectTitle}`);
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.addEventListener('click', () => scrollToProject(i));
      projectDots.appendChild(dot);
    });
  }
  if (projectPrev) projectPrev.addEventListener('click', () => scrollToProject(projectCurrent - 1));
  if (projectNext) projectNext.addEventListener('click', () => scrollToProject(projectCurrent + 1));
  let rafId;
  projectCarousel.addEventListener('scroll', () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      const index = Math.round(projectCarousel.scrollLeft / projectCarousel.clientWidth);
      updateProjectDots(index);
      rafId = null;
    });
  }, { passive: true });
}

// Sample carousel: auto-slide + dots
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const sampleCarousel = document.querySelector('.sample-carousel');
const sampleDots = document.querySelector('.sample-dots');
if (sampleCarousel && sampleDots) {
  const cards = [...sampleCarousel.querySelectorAll('.sample-card')];
  let sampleIndex = 0;
  let sampleTimer = null;

  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Ir a la muestra ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => {
      sampleIndex = i;
      sampleCarousel.scrollTo({ left: i * sampleCarousel.clientWidth, behavior: 'smooth' });
      updateDots();
      restartTimer();
    });
    sampleDots.appendChild(dot);
  });

  function updateDots() {
    [...sampleDots.children].forEach((d, i) => {
      d.setAttribute('aria-selected', i === sampleIndex ? 'true' : 'false');
    });
  }

  function nextSample() {
    sampleIndex = (sampleIndex + 1) % cards.length;
    sampleCarousel.scrollTo({ left: sampleIndex * sampleCarousel.clientWidth, behavior: 'smooth' });
    updateDots();
  }

  function restartTimer() {
    if (sampleTimer) clearInterval(sampleTimer);
    if (!reducedMotion.matches) sampleTimer = setInterval(nextSample, 4000);
  }

  sampleCarousel.addEventListener('scroll', () => {
    sampleIndex = Math.round(sampleCarousel.scrollLeft / sampleCarousel.clientWidth);
    updateDots();
  }, { passive: true });

  sampleCarousel.addEventListener('pointerdown', () => { if (sampleTimer) clearInterval(sampleTimer); });
  sampleCarousel.addEventListener('pointerup', restartTimer);

  restartTimer();
}

const cookieBanner = $('#cookie-banner');
if (cookieBanner) {
  const consent = localStorage.getItem('cookie-consent');
  const updateConsent = (granted) => {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: granted ? 'granted' : 'denied' });
    }
  };
  if (consent === 'granted') {
    updateConsent(true);
  } else if (consent !== 'denied') {
    cookieBanner.hidden = false;
  }
  cookieBanner.querySelector('[data-cookie-accept]').addEventListener('click', () => {
    localStorage.setItem('cookie-consent', 'granted');
    updateConsent(true);
    cookieBanner.hidden = true;
  });
  cookieBanner.querySelector('[data-cookie-decline]').addEventListener('click', () => {
    localStorage.setItem('cookie-consent', 'denied');
    updateConsent(false);
    cookieBanner.hidden = true;
  });
}

const legal = {
  aviso: { title: 'Aviso legal', body: '<p>Esta web presenta los servicios de MM Parquet. Contacto: 678 906 586 · info@mmparquet.com.</p><p>La información sobre materiales, tonos y servicios es orientativa. Los trabajos y sus condiciones se concretan en un presupuesto individual. Las fotografías de la escalera corresponden a una misma instalación aportada por la empresa. Los muestrarios se muestran por separado y no equivalen a las simulaciones de tonos del selector.</p><p class="legal-pending">Versión de presentación pendiente de publicación: faltan la razón social o nombre del titular, NIF/CIF, domicilio y, si procede, datos registrales. Este aviso debe completarse y revisarse antes del lanzamiento comercial.</p>' },
  privacidad: { title: 'Tu privacidad importa.', body: '<p>El formulario prepara un mensaje en tu navegador. Esta web no almacena sus campos ni los envía a un servidor propio. No incluyas información sensible.</p><p>Al abrir la consulta en WhatsApp, los datos del mensaje se incorporan al enlace de ese servicio. Tú revisas el texto y decides si lo envías. El tratamiento posterior está sujeto a las condiciones de WhatsApp y a la gestión que haga la empresa de tu consulta. También puedes contactar por teléfono o correo.</p><p>Las fotografías y las tipografías se sirven desde esta web, sin solicitudes a bancos de imágenes externos.</p><p>Usamos Google Analytics para medir visitas, únicamente si aceptas el aviso de cookies. Puedes cambiar tu decisión en cualquier momento borrando las cookies del navegador y volviendo a cargar la página.</p><p class="legal-pending">Antes de publicar hay que identificar al responsable del tratamiento y completar la política con las bases jurídicas, plazos de conservación, destinatarios, transferencias cuando proceda y vías para ejercer tus derechos, incluido reclamar ante la AEPD.</p>' },
  cookies: { title: 'Cookies.', body: '<p>Esta web no instala cookies propias ni usa almacenamiento local salvo para recordar tu decisión sobre este aviso.</p><p>Con tu permiso, usamos Google Analytics (cookies de terceros) para saber cuántas personas visitan la web y qué páginas ven. No se activa hasta que pulsas "Aceptar" en el aviso de cookies; si pulsas "Rechazar", no se cargan.</p><p>Los enlaces a WhatsApp abren un servicio externo que aplica sus propias condiciones y política de cookies.</p><p>Si se añaden mapas, vídeos u otras integraciones, será necesario revisar esta información y el consentimiento correspondiente.</p>' },
};
document.querySelectorAll('[data-legal]').forEach((button) => {
  button.addEventListener('click', () => {
    const page = legal[button.dataset.legal];
    openDialog(`<p class="eyebrow">MM PARQUET / INFORMACIÓN</p><h2 id="dialog-title">${page.title}</h2>${page.body}`);
  });
});
const form = $('#quote-form');
const readyLink = $('#whatsapp-ready');
const serviceParam = new URLSearchParams(location.search).get('servicio');
const serviceField = document.querySelector('[name="servicio"]');
if (serviceParam && serviceField) serviceField.value = serviceParam;
document.querySelectorAll('[data-prefill-service]').forEach((link) => {
  link.addEventListener('click', () => {
    $('[name="servicio"]').value = link.dataset.prefillService;
  });
});
form?.addEventListener('input', () => {
  readyLink.hidden = true;
  readyLink.removeAttribute('href');
  $('#form-status').textContent = '';
  readyLink.classList.remove('ready-highlight');
});
// Real-time field validation
form?.querySelectorAll('input, select, textarea').forEach((field) => {
  field.addEventListener('blur', () => {
    const errorEl = form.querySelector(`[data-error="${field.name}"]`);
    if (errorEl) errorEl.classList.toggle('visible', field.required && !field.checkValidity());
  });
  field.addEventListener('input', () => {
    const errorEl = form.querySelector(`[data-error="${field.name}"]`);
    if (errorEl && field.checkValidity()) errorEl.classList.remove('visible');
  });
});
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  // Show errors for all invalid required fields
  let firstInvalid = null;
  form?.querySelectorAll('input, select, textarea').forEach((field) => {
    const errorEl = form.querySelector(`[data-error="${field.name}"]`);
    if (errorEl) {
      const invalid = field.required && !field.checkValidity();
      errorEl.classList.toggle('visible', invalid);
      if (invalid && !firstInvalid) firstInvalid = field;
    }
  });
  if (firstInvalid) { firstInvalid.focus(); return; }
  if (!form.reportValidity()) return;
  try {
    const message = buildQuoteMessage(Object.fromEntries(new FormData(form)));
    readyLink.href = buildWhatsAppUrl(message);
    readyLink.hidden = false;
    readyLink.classList.add('ready-highlight');
    $('#form-status').textContent = 'Tu consulta está preparada. Se abre WhatsApp para que revises y envíes el mensaje. Si no se abre, usa el enlace. Todavía no se ha enviado ningún mensaje.';
    readyLink.click();
    readyLink.focus();
  } catch (error) {
    $('#form-status').textContent = error.message;
  }
});
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.body.classList.add('motion-ready');
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
}

// Hide floating WhatsApp when form is visible
const floatWa = document.querySelector('.float-whatsapp');
const formSection = document.querySelector('#contacto');
if (floatWa && formSection && 'IntersectionObserver' in window) {
  const waObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      floatWa.style.opacity = entry.isIntersecting ? '0' : '';
      floatWa.style.pointerEvents = entry.isIntersecting ? 'none' : '';
      floatWa.style.transition = 'opacity .3s ease';
    });
  }, { threshold: 0.15 });
  waObserver.observe(formSection);
}
