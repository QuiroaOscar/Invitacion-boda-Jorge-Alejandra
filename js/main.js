/* ============================================================
   INVITACIÓN — Jorge & Alejandra | main.js v3.0
   FIX: sin duplicación, typewriter con flag único
============================================================ */
const CONFIG = {
  weddingDate:     new Date('2026-08-22T15:00:00'),
  googleScriptURL: 'https://script.google.com/macros/s/AKfycbwsWNj5wkkKCa-5X-Kdy9i9ndtHD8zHHv3KWkg3S32uSjjo5rDe63fqDkl4CUxgApIkXQ/exec',
};

let musicPlaying  = false;
let noteInterval  = null;
let guestsCount   = 1;
let maxGuests     = 99;

// ── FLAGS para evitar doble ejecución ──
let envelopeOpened  = false;
let invitationShown = false;
let heroRunning     = false;
let footerRunning   = false;
let observersInited = false;

/* ═══════════════════════════════════════
   INIT — solo una vez
═══════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  readURLParams();
  initScrollTop();
  document.getElementById('music-btn').addEventListener('click', toggleMusic);
});

/* ═══════════════════════════════════════
   PARÁMETROS URL
═══════════════════════════════════════ */
function readURLParams() {
  const p      = new URLSearchParams(window.location.search);
  const nombre = p.get('n') || 'Familia Invitada';
  const pases  = parseInt(p.get('p') || '1', 10);
  maxGuests   = pases;
  guestsCount = 1;
  setText('guest-name-display',   nombre.replace(/_/g,' '));
  setText('guest-passes-display', String(pases));
  setText('max-guests-num',       String(pases));
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ═══════════════════════════════════════
   SOBRE — abrir con clic en sello
═══════════════════════════════════════ */
function openEnvelope() {
  if (envelopeOpened) return;
  envelopeOpened = true;

  const wrapper = document.getElementById('envelope-wrapper');
  wrapper.classList.add('opened');
  document.querySelector('.click-hint')?.classList.add('ocultar');

  // Corazones
  setTimeout(startHearts, 400);

  // Typewriter carta — solo 1 vez
  setTimeout(runLetterTypewriter, 1500);
}

/* ═══════════════════════════════════════
   TYPEWRITER CARTA (línea por línea)
═══════════════════════════════════════ */
async function runLetterTypewriter() {
  // Limpiar todos los campos para evitar restos anteriores
  const IDS = ['tw-verse','tw-sub','tw-title','tw-name1','tw-amp','tw-name2','tw-date'];
  IDS.forEach(id => setText(id, ''));

  await tw('tw-verse',  '“Con gratitud a Dios, quien escribió nuestra historia y guió nuestros pasos hasta este momento, los invitamos a celebrar con nosotros el inicio de nuestro matrimonio, unidos en su amor y bajo su bendición”',  30);  await ms(100);
  await tw('tw-sub',    'Con mucho amor, les invitamos a',         34);  await ms(80);
  await tw('tw-title',  'Nuestra Boda',                            80);  await ms(100);
  await tw('tw-name1',  'Jorge ',                                  60);  await ms(40);
  await tw('tw-amp',    '& ',                                      60);  await ms(40);
  await tw('tw-name2',  'Alejandra',                               60);  await ms(100);
  await tw('tw-date',   'Sábado, 22 de Agosto de 2026',            38);
}

/* ═══════════════════════════════════════
   ENTRAR A LA INVITACIÓN
═══════════════════════════════════════ */
function enterInvitation() {
  if (invitationShown) return;
  invitationShown = true;

  const envSec  = document.getElementById('envelope-section');
  const mainCnt = document.getElementById('main-content');

  mainCnt.style.display = 'block';
  envSec.classList.add('hide-envelope');

  setTimeout(() => {
    envSec.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'instant' });

    document.getElementById('hero-bg')?.classList.add('active');

    // Iniciar typewriter hero (solo 1 vez)
    runHeroTypewriter();

    // Countdown
    initCountdown();

    // Observers (solo 1 vez)
    if (!observersInited) {
      observersInited = true;
      initRevealObserver();
      initFadeScrollObserver();
      initHeroScrollBehavior();
      initFooterObserver();
      initCoupleObserver();
      initGalleryLightbox();
    }
  }, 950);

  // Música al entrar
  const music = document.getElementById('wedding-music');
  music.volume = 0.35;
  music.play().then(() => {
    musicPlaying = true;
    document.getElementById('icon-play').style.display  = 'none';
    document.getElementById('icon-pause').style.display = 'block';
    startNotes();
  }).catch(() => {});
}

/* ═══════════════════════════════════════
   HERO — typewriter + fade scroll + re-escribe al volver
═══════════════════════════════════════ */
function initHeroScrollBehavior() {
  const heroSec = document.getElementById('hero-section');
  const heroCnt = document.getElementById('hero-content');
  if (!heroSec || !heroCnt) return;

  // Fade progresivo al scrollear hacia abajo
  window.addEventListener('scroll', () => {
    const rect = heroSec.getBoundingClientRect();
    const prog = Math.max(0, Math.min(1, -rect.top / (window.innerHeight * 0.55)));
    heroCnt.style.opacity   = String(1 - prog);
    heroCnt.style.transform = `translateY(${prog * -28}px)`;
  }, { passive: true });

  // Re-escribir al volver al hero
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !heroRunning) runHeroTypewriter();
    });
  }, { threshold: 0.4 });
  obs.observe(heroSec);
}

async function runHeroTypewriter() {
  if (heroRunning) return;
  heroRunning = true;
  setText('hero-eyebrow', '');
  setText('hero-names',   '');
  setText('hero-date',    '');
  await ms(200);
  await tw('hero-eyebrow', 'Con todo nuestro amor',        38);  await ms(180);
  await tw('hero-names',   'Jorge y Alejandra',            52);  await ms(180);
  await tw('hero-date',    'Sábado · 22 · Agosto · 2026', 38);
  heroRunning = false;
}

/* ═══════════════════════════════════════
   FOOTER — typewriter fade in/out
═══════════════════════════════════════ */
function initFooterObserver() {
  const sec = document.querySelector('.sec-footer-photo');
  if (!sec) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) runFooterTypewriter();
      else clearFooterText();
    });
  }, { threshold: 0.2 });
  obs.observe(sec);
}

async function runFooterTypewriter() {
  if (footerRunning) return;
  footerRunning = true;
  clearFooterText();
  await ms(200);
  await tw('footer-monogram',  'J  y  A',                                           68);  await ms(130);
  await tw('footer-date-txt',  '22 · 08 · 2026',                                  52);  await ms(130);
  await tw('footer-quote-txt', '“Así que ya no son dos, sino uno solo. De modo que el hombre no debe separar lo que Dios ha unido.”',  36);
  footerRunning = false;
}

function clearFooterText() {
  footerRunning = false;
  ['footer-monogram','footer-date-txt','footer-quote-txt'].forEach(id => setText(id, ''));
}

/* ═══════════════════════════════════════
   SECCIÓN NOVIOS — activar al entrar
═══════════════════════════════════════ */
function initCoupleObserver() {
  const sec = document.getElementById('couple-section');
  const bg  = document.getElementById('couple-bg');
  if (!sec || !bg) return;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) bg.classList.add('active');
  }, { threshold: 0.15 });
  obs.observe(sec);
}

/* ═══════════════════════════════════════
   GALERÍA — lightbox con zoom+giro
═══════════════════════════════════════ */
function initGalleryLightbox() {
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const lb    = document.getElementById('gallery-lightbox');
      const inner = document.getElementById('lightbox-inner');
      inner.style.backgroundImage = item.style.backgroundImage;
      lb.classList.add('open');
    });
  });
  document.getElementById('gallery-lightbox')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeLightbox();
  });
}
function closeLightbox() {
  document.getElementById('gallery-lightbox').classList.remove('open');
}

/* ═══════════════════════════════════════
   CUENTA REGRESIVA
═══════════════════════════════════════ */
function initCountdown() {
  const pad = n => String(n).padStart(2,'0');
  function update() {
    const diff = CONFIG.weddingDate - new Date();
    if (diff <= 0) { ['cd-days','cd-hours','cd-mins','cd-secs'].forEach(id=>setText(id,'00')); return; }
    setText('cd-days',  pad(Math.floor(diff/86400000)));
    setText('cd-hours', pad(Math.floor((diff%86400000)/3600000)));
    setText('cd-mins',  pad(Math.floor((diff%3600000)/60000)));
    setText('cd-secs',  pad(Math.floor((diff%60000)/1000)));
  }
  update(); setInterval(update, 1000);
}

/* ═══════════════════════════════════════
   MÚSICA
═══════════════════════════════════════ */
function toggleMusic() {
  const music = document.getElementById('wedding-music');
  if (musicPlaying) {
    music.pause(); musicPlaying = false;
    document.getElementById('icon-play').style.display  = 'block';
    document.getElementById('icon-pause').style.display = 'none';
    stopNotes();
  } else {
    music.play().catch(()=>{}); musicPlaying = true;
    document.getElementById('icon-play').style.display  = 'none';
    document.getElementById('icon-pause').style.display = 'block';
    startNotes();
  }
}
function startNotes() {
  const syms = ['♩','♪','♫','♬','🎵','🎶'];
  noteInterval = setInterval(() => {
    const c = document.getElementById('notes-container');
    const n = document.createElement('span');
    n.className   = 'music-note';
    n.textContent = syms[Math.floor(Math.random()*syms.length)];
    n.style.setProperty('--dx', (Math.random()-.5)*44+'px');
    n.style.left  = (Math.random()*40-10)+'px';
    c.appendChild(n); setTimeout(()=>n.remove(), 3200);
  }, 650);
}
function stopNotes() { clearInterval(noteInterval); }

/* ═══════════════════════════════════════
   CORAZONES CANVAS
═══════════════════════════════════════ */
function startHearts() {
  const canvas = document.getElementById('petals-canvas');
  if (canvas.classList.contains('active')) return; // evitar doble
  canvas.classList.add('active');
  const ctx = canvas.getContext('2d');
  let hearts = [], W, H;
  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
  window.addEventListener('resize', resize, { passive: true }); resize();
  const COLS = ['rgba(210,60,90,.82)','rgba(235,110,130,.75)','rgba(255,150,165,.70)','rgba(190,40,70,.80)','rgba(245,130,155,.72)'];
  const newH = () => ({ x:Math.random()*W, y:-20, s:Math.random()*13+8, color:COLS[Math.random()*COLS.length|0], vy:Math.random()*1.3+.5, vx:(Math.random()-.5)*.9, angle:(Math.random()-.5)*.4, spin:(Math.random()-.5)*.03, wob:Math.random()*Math.PI*2, wobS:Math.random()*.025+.01, op:Math.random()*.35+.65 });
  const drawH = p => {
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.angle); ctx.globalAlpha=p.op; ctx.fillStyle=p.color;
    const s=p.s; ctx.beginPath(); ctx.moveTo(0,s*.25);
    ctx.bezierCurveTo(-s*.05,s*.1,-s*.55,-s*.2,-s*.55,-s*.5);
    ctx.bezierCurveTo(-s*.55,-s*.85,0,-s*.85,0,-s*.5);
    ctx.bezierCurveTo(0,-s*.85,s*.55,-s*.85,s*.55,-s*.5);
    ctx.bezierCurveTo(s*.55,-s*.2,s*.05,s*.1,0,s*.25);
    ctx.closePath(); ctx.fill();
    ctx.globalAlpha=p.op*.28; ctx.fillStyle='white';
    ctx.beginPath(); ctx.ellipse(-s*.2,-s*.55,s*.12,s*.07,-.5,0,Math.PI*2); ctx.fill();
    ctx.restore();
  };
  const anim = () => {
    ctx.clearRect(0,0,W,H);
    if (hearts.length < 65 && Math.random() < .3) hearts.push(newH());
    hearts.forEach((p,i) => { p.wob+=p.wobS; p.x+=p.vx+Math.sin(p.wob)*.5; p.y+=p.vy; p.angle+=p.spin; drawH(p); if(p.y>H+25) hearts.splice(i,1); });
    requestAnimationFrame(anim);
  };
  anim();
}

/* ═══════════════════════════════════════
   REVEAL + FADE SCROLL
═══════════════════════════════════════ */
function initRevealObserver() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: .1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}
function initFadeScrollObserver() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      e.isIntersecting ? e.target.classList.add('visible') : e.target.classList.remove('visible');
    });
  }, { threshold: .15, rootMargin: '-5% 0px -5% 0px' });
  document.querySelectorAll('.fade-scroll').forEach(el => obs.observe(el));
}

/* ═══════════════════════════════════════
   SCROLL TOP
═══════════════════════════════════════ */
function initScrollTop() {
  const btn = document.getElementById('scroll-top-btn');
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400), { passive: true });
}
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

/* ═══════════════════════════════════════
   REGALOS — flip tarjeta
═══════════════════════════════════════ */
function flipCard(el) { el.classList.toggle('flipped'); }

/* ═══════════════════════════════════════
    RSVP DINÁMICO
═══════════════════════════════════════ */
let savedGuestsCount = guestsCount; // Guarda la cantidad inicial configurada

document.addEventListener('DOMContentLoaded', () => {
  const radioButtons = document.querySelectorAll('input[name="rsvp-attend"]');
  radioButtons.forEach(radio => {
    radio.addEventListener('change', handleAttendanceChange);
  });
});

function handleAttendanceChange(e) {
  const isDeclining = e.target.value === 'No puedo';
  const submitBtn = document.getElementById('rsvp-submit-btn');
  const counterBtns = document.querySelectorAll('.counter-btn');

  if (isDeclining) {
    // Si no asistirá, guardar el valor actual y ponerlo en 0
    savedGuestsCount = guestsCount;
    guestsCount = 0;
    setText('rsvp-guests-count', '0');
    
    // Deshabilitar los botones + y - para evitar cambiar el 0
    counterBtns.forEach(btn => btn.disabled = true);

    // Cambiar texto y símbolo del botón de envío
    submitBtn.textContent = 'Confirmar que no Podré asistir ✕';
  } else {
    // Restaurar valor anterior al seleccionar que sí asiste
    guestsCount = savedGuestsCount > 0 ? savedGuestsCount : 1;
    setText('rsvp-guests-count', String(guestsCount));

    // Habilitar de nuevo los botones + y -
    counterBtns.forEach(btn => btn.disabled = false);

    // Restaurar texto del botón
    submitBtn.textContent = 'Confirmar Asistencia ✓';
  }
}

function changeGuests(d) {
  // Solo permitir cambiar números si la opción seleccionada es "Sí asisto"
  const attend = document.querySelector('input[name="rsvp-attend"]:checked')?.value;
  if (attend === 'No puedo') return;

  guestsCount = Math.max(1, Math.min(maxGuests, guestsCount + d));
  savedGuestsCount = guestsCount;
  setText('rsvp-guests-count', String(guestsCount));
}

async function submitRSVP() {
  const name     = document.getElementById('rsvp-name').value.trim();
  const family   = document.getElementById('rsvp-family').value.trim();
  const attend   = document.querySelector('input[name="rsvp-attend"]:checked')?.value || 'Sí asisto';
  const message  = document.getElementById('rsvp-message').value.trim();
  const statusEl = document.getElementById('rsvp-status');
  const btn      = document.getElementById('rsvp-submit-btn');

  if (!name) { 
    statusEl.textContent = '⚠️ Por favor escribe tu nombre.'; 
    statusEl.style.color = '#c0392b'; 
    return; 
  }

  btn.disabled = true; 
  btn.textContent = 'Enviando...'; 
  statusEl.textContent = '';

  const payload = { 
    nombre: name, 
    familia: family || '—', 
    personas: guestsCount, 
    asistencia: attend, 
    mensaje: message || '—', 
    fecha: new Date().toLocaleString('es-GT') 
  };

  try {
    if (CONFIG.googleScriptURL === 'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI') { 
      await ms(1200); 
      showRSVPSuccess(attend); 
      return; 
    }
    
    await fetch(CONFIG.googleScriptURL, { 
      method: 'POST', 
      mode: 'no-cors', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload) 
    });
    
    showRSVPSuccess(attend);
  } catch {
    statusEl.textContent = '❌ Error al enviar. Intenta de nuevo.'; 
    statusEl.style.color = '#c0392b';
    btn.disabled = false; 
    btn.textContent = attend === 'No puedo' ? 'Confirmar que no Podré asistir ✕' : 'Confirmar Asistencia ✓';
  }
}

function showRSVPSuccess(attend) {
  document.getElementById('rsvp-form-container').style.display = 'none';
  const s = document.getElementById('rsvp-success');

  // Personalización del mensaje final según la respuesta
  if (attend === 'No puedo') {
    document.getElementById('success-icon').textContent = '💔';
    document.getElementById('success-title').textContent = '¡Gracias por informar!';
    document.getElementById('success-text').textContent = 'Tu respuesta ha sido recibida. ¡Lamentamos mucho que no puedas asistir!';
  } else {
    document.getElementById('success-icon').textContent = '💌';
    document.getElementById('success-title').textContent = '¡Gracias por confirmar!';
    document.getElementById('success-text').textContent = 'Tu respuesta ha sido recibida. ¡Nos vemos el 22 de Agosto!';
  }

  s.style.display = 'flex'; 
  s.style.flexDirection = 'column'; 
  s.style.alignItems = 'center';
}

/* ═══════════════════════════════════════
   TYPEWRITER UTILS
═══════════════════════════════════════ */
function tw(id, text, speed) {
  return new Promise(resolve => {
    const el = document.getElementById(id);
    if (!el) { resolve(); return; }
    el.textContent = '';          // siempre limpiar antes
    let i = 0;
    const iv = setInterval(() => {
      el.textContent += text[i++];
      if (i >= text.length) { clearInterval(iv); resolve(); }
    }, speed);
  });
}
const ms = t => new Promise(r => setTimeout(r, t));
