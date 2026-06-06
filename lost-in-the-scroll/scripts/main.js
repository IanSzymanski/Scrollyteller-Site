/* ============================================================
   THEME SWITCHER
   Precedence: localStorage → system prefers-color-scheme
   ============================================================ */
const THEME = {
  storageKey: 'scrollyteller-theme',
  modes: ['light', 'dark', 'system'],

  icons: { light: '☀︎', dark: '☾', system: '◐' },
  labels: { light: 'Light', dark: 'Dark', system: 'System' },

  normalize(mode) {
    return this.modes.includes(mode) ? mode : 'system';
  },

  /* Resolve 'system' to the actual OS preference */
  resolve(mode) {
    mode = this.normalize(mode);
    if (mode === 'system') {
      return window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light' : 'dark';
    }
    return mode;
  },

  /* Apply theme to <html> and update button chrome */
  apply(mode) {
    const resolved = this.resolve(mode);
    document.documentElement.setAttribute('data-theme', resolved);

    document.getElementById('theme-trigger-icon').textContent  = this.icons[mode];
    document.getElementById('theme-trigger-label').textContent = this.labels[mode];

    document.querySelectorAll('.theme-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.value === mode);
    });
  },

  /* Save choice and apply */
  set(mode) {
    mode = this.normalize(mode);
    localStorage.setItem(this.storageKey, mode);
    this.apply(mode);
  },

  /* Load from storage, fall back to 'system' */
  init() {
    const saved = this.normalize(localStorage.getItem(this.storageKey) || 'system');
    this.apply(saved);

    /* Watch for OS-level changes when mode is 'system' */
    window.matchMedia('(prefers-color-scheme: light)')
      .addEventListener('change', () => {
        const current = localStorage.getItem(this.storageKey) || 'system';
        if (current === 'system') this.apply('system');
      });
  },
};

/* Init immediately (before paint) to avoid flash */
THEME.init();

/* Wire up trigger button */
const triggerBtn  = document.getElementById('theme-trigger');
const dropdown    = document.getElementById('theme-dropdown');

triggerBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = dropdown.classList.toggle('open');
  triggerBtn.setAttribute('aria-expanded', isOpen);
});

/* Wire up each option */
document.querySelectorAll('.theme-option').forEach(btn => {
  btn.addEventListener('click', () => {
    THEME.set(btn.dataset.value);
    dropdown.classList.remove('open');
    triggerBtn.setAttribute('aria-expanded', 'false');
  });
});

/* Close on outside click */
document.addEventListener('click', () => {
  dropdown.classList.remove('open');
  triggerBtn.setAttribute('aria-expanded', 'false');
});

/* Close on Escape */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    dropdown.classList.remove('open');
    triggerBtn.setAttribute('aria-expanded', 'false');
  }
});

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/* ============================================================
     CONFIG
     ============================================================ */
  const CONFIG = {
  pinStart:       'top top',
  scrub:          2,
  gapVh:          0,
  anticipate:     1,
  scrollPxPerSec: 500, // scroll pixels per second of animation — adjust to taste
};
 
  /* ============================================================
     SETUP
     ============================================================ */
  gsap.registerPlugin(ScrollTrigger);

document.querySelectorAll('.section-gap').forEach(gap => {
  gap.style.height = `${CONFIG.gapVh}vh`;
});


ScrollTrigger.addEventListener('refresh', () => {
  document.querySelectorAll('.section-gap').forEach(gap => {
    gap.style.height = `${CONFIG.gapVh}vh`;
  });
});
 
/* ── Progress bar ─────────────────────────────────────────────── */
const progressBar = document.getElementById('progress-bar');
ScrollTrigger.create({
  start:    'top top',
  end:      'max',
  onUpdate: self => {
    progressBar.style.width = (self.progress * 100).toFixed(2) + '%';
  }
});

/* ============================================================
   CHAPTER NAV
   Auto-generates dots for hero + sections + footer.
   ============================================================ */
const CHAPTERS = [
  'hero',
  'section-1', 'section-2', 'section-3', 'section-4', 'section-5',
  'footer'
];
const navEl = document.getElementById('chapter-nav');
if (navEl && navEl.parentNode !== document.body) document.body.appendChild(navEl);

CHAPTERS.forEach((id, i) => {
  const dot = document.createElement('div');
  dot.className = 'ch-dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', `Go to ${id.replace(/-/g, ' ')}`);
  dot.setAttribute('role', 'button');
  dot.setAttribute('tabindex', '0');
  dot.setAttribute('aria-current', i === 0 ? 'true' : 'false');

  const go = () => document.getElementById(id)
    .scrollIntoView({ behavior: 'smooth' });

  dot.addEventListener('click', go);
  dot.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      go();
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (i + 1) % CHAPTERS.length;
      navEl.querySelectorAll('.ch-dot')[next]?.focus();
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (i - 1 + CHAPTERS.length) % CHAPTERS.length;
      navEl.querySelectorAll('.ch-dot')[prev]?.focus();
    }

    if (e.key === 'Home') {
      e.preventDefault();
      navEl.querySelectorAll('.ch-dot')[0]?.focus();
    }

    if (e.key === 'End') {
      e.preventDefault();
      navEl.querySelectorAll('.ch-dot')[CHAPTERS.length - 1]?.focus();
    }
  });

  navEl.appendChild(dot);
});

const dots = navEl.querySelectorAll('.ch-dot');
function setActiveChapter(n) {
  dots.forEach((d, i) => {
    d.classList.toggle('active', i === n);
    d.setAttribute('aria-current', i === n ? 'true' : 'false');
  });
}

function getCurrentChapterIndex() {
  const midpoint = window.scrollY + window.innerHeight / 2;
  let current = 0;

  CHAPTERS.forEach((id, i) => {
    const section = document.getElementById(id);
    if (!section) return;
    const top = section.offsetTop;
    if (top <= midpoint) current = i;
  });

  return current;
}

function scrollToChapter(index) {
  const id = CHAPTERS[index];
  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

document.addEventListener('keydown', e => {
  const active = document.activeElement;
  if (!active || ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName) || active.isContentEditable) return;

  if (e.key === 'PageDown') {
    e.preventDefault();
    scrollToChapter(Math.min(CHAPTERS.length - 1, getCurrentChapterIndex() + 1));
  }

  if (e.key === 'PageUp') {
    e.preventDefault();
    scrollToChapter(Math.max(0, getCurrentChapterIndex() - 1));
  }

  if (e.key === 'Home') {
    e.preventDefault();
    scrollToChapter(0);
  }

  if (e.key === 'End') {
    e.preventDefault();
    scrollToChapter(CHAPTERS.length - 1);
  }
});

  
  /* ============================================================
   HERO ENTRANCE
   Load animation — not scroll-driven.
   ============================================================ */

gsap.set(['#hero h1', '#hero .hero-subtitle'], { x: -50 });

gsap.timeline({ delay: 0.5 })
  .to('.cloud-Back',  { opacity: 1, y: 0, duration: 1,   ease: 'back' },        '-=0.4')
  .to('.cloud-Front', { opacity: 1, y: 0, duration: 1,   ease: 'back' },        '-=0.9')
  .to('#hero h1',             { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }, '-=0.4')
  .to('#hero .hero-subtitle', { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out' }, '-=0.4')
  .to('.trombone-Case', { opacity: 1, y: 0, duration: 2, transformOrigin: 'left center', rotate: -5, ease: 'back' }, '-=0.9')
  .to('#hero .scroll-cue',    { opacity: 1, duration: 1, scale: 1, ease: 'bounce' }, '-=0.9');
 
  /* ============================================================
   SECTION FACTORY
   Builds one ScrollTrigger + timeline per .pin-wrap.

   Scroll distance is derived from the timeline's total duration:
     end = totalDuration * CONFIG.scrollPxPerSec
   Add, remove, or lengthen tweens and the pinned scroll
   distance updates automatically on the next refresh.

   Section-1 gets a parallax bar entrance before the text.
   All other sections fade their SVG in, then reveal text.
   ============================================================ */
const sectionTimelines = {};

document.querySelectorAll('.pin-wrap').forEach(wrap => {
  const id      = wrap.id;
  const scene   = wrap.querySelector('.sticky-scene');
  const svgEl   = wrap.querySelector('svg');
  const box     = wrap.querySelector('.content-box');
  const kicker  = wrap.querySelector('.kicker');
  const heading = wrap.querySelector('.section-headline');
  const body    = wrap.querySelector('.section-body');

  const tl = gsap.timeline();

  if (id === 'section-1') {
    /* SVG is immediately visible — bars slide in as the transition.
       Each bar starts further below the viewport, so it travels
       more distance in the same time → stronger parallax on bar-Back. */
    gsap.set(svgEl, { opacity: 1 });

  tl
      // ── Parallax bar entrance ─────────────────────────────
      .fromTo('.bar-Back',
        { y: '40vh', opacity: 1 },
        { y: '-65vh', duration: 3, ease: 'power2.out' }, 0)
      .fromTo('.bar-Mid',
        { y: '80vh', opacity: 1 },
        { y: '-65vh', duration: 3, ease: 'power2.out' }, 0)
      .fromTo('.bar-Front',
        { y: '120vh', opacity: 1 },
        { y: '-65vh', duration: 3, ease: 'power2.out' }, 0)

      .to(box,     { opacity: 1, y: 0, duration: 0.8 },                    2.0)
      .to(kicker,  { opacity: 1,        duration: 0.6 },                    2.2)
      .to(heading, { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }, 2.6)
      .to(body,    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 3.2)
      .to('.slide',{ opacity: 1, x: '29vw',duration: 2, ease: 'elastic' }, 2)
      .to('.outer-Slide',{x: '-9vw',duration: 1, ease: 'back' }, 4)
      .to('.outer-Slide',{x: '-5vw',duration: 1, ease: 'back' }, 5)
      .to('.outer-Slide',{x: '-13vw',duration: 1, ease: 'back' }, 6)
      .to('.outer-Slide',{x: '-4vw',duration: 2, ease: 'ease' }, 7)
      .to('.outer-Slide',{x: '-25vw',duration: 2, ease: 'back.out' }, 9)
      .to('.outer-Slide',{opacity: 0, rotate: -30, transformOrigin: 'center', y: '20vw', x: '-70vw', duration: 2, ease: 'ease' }, 9.5)
      .to('.inner-Slide',{opacity: 0, x: '20vw', duration: 1, ease: 'ease' }, 11);

      } else {
    tl
      .to(svgEl,   { opacity: 1,        duration: 1.0 },                    0.0)
      .to(box,     { opacity: 1, y: 0, duration: 0.8 },                    0.0)
      .to(kicker,  { opacity: 1,        duration: 0.6 },                    1.0)
      .to(heading, { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }, 1.4)
      .to(body,    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 2.0)
      .to({}, { duration: 1.0 });
  }

  sectionTimelines[id] = tl;

  ScrollTrigger.create({
    trigger:       scene,
    start:         CONFIG.pinStart,
    end:           () => '+=' + Math.round(tl.totalDuration() * CONFIG.scrollPxPerSec),
    pin:           true,
    scrub:         CONFIG.scrub,
    anticipatePin: CONFIG.anticipate,
    animation:     tl,
  });
});

// Section 2

gsap.timeline()
sectionTimelines['section-2']
  .to('.triangle-Bar',  {x: '0vw', duration: 5, ease: 'back'}, 0.5)
  .to('.row-Triangle',  {y: 0, stagger: 0.2, duration: 1, ease: 'back'}, 0.0)
  .to('.staff-End',  {y: '0.01vh', duration: 0.1, ease: 'ease' }, 0.1)
  .to('.staff-Line', {x: '0vw', stagger: -0.3, duration: 1, ease: 'ease' }, 3.0 )
  .to('.staff-End',  {scale: 1, duration: 1.3, ease: 'ease' }, 4)
  .to('.note',       {opacity: 1, y: 0,stagger: 0.5, duration: 3, ease: 'bounce' }, 3.5);

// Section 3

gsap.timeline()
sectionTimelines['section-3']
  .to('.curtains',  {opacity: 0.8, x: '0vw', transformOrigin: 'center',scaleY: 0.5, duration: 10, ease: 'back'}, 0)
  .to('.mouthpiece',  {rotate: 360, transformOrigin: 'center', scale: 1,x: '30vw', duration: 2, ease: 'back'}, 2)
  .to('.mouthpiece',  {rotate: 0, scale: 0.7, duration: 3, ease: 'bounce.out'}, 4)
  ;

  // Section 4

gsap.timeline()
sectionTimelines['section-4']
  .fromTo('.triangle-Bottom',
        { y: '60vh', opacity: 1 },
        { y: '-55vh', x: '-5vw', duration: 5, ease: 'power2.out' }, 0)
      .fromTo('.triangle-Middle',
        { y: '100vh', opacity: 1 },
        { y: '-55vh', x: '-5vw', duration: 5, ease: 'power2.out' }, 0)
      .fromTo('.triangle-Top',
        { y: '150vh', opacity: 1 },
        { y: '-55vh', x: '-5vw', duration: 5, ease: 'power2.out' }, 0)
  .to('.tuningSlide',  {y: '-2vh', opacity: 1,duration: 2, ease: 'back'}, 0.5)
  .to('.tuningSlide-Outer',  {y: '6vh', duration: 1, ease: 'back'}, 3)
  .to('.tuningSlide-Outer',  {y: '-2vh', duration: 1, ease: 'back'}, 4)
  .to('.tuningSlide-Outer',  {y: '1vh', duration: 1, ease: 'elastic'}, 5)
  .to('.burst',  {scaleX: 1, x: '-1vw', opacity: 1, transformOrigin: 'right', rotate: -10, duration: 3, ease: 'elastic'}, 5.5)
   .to('.triangle-Top',  {x: '-40vw', rotate: 20, duration: 2, ease: 'back.in'}, 4)
   .to('.triangle-Middle',  {x: '-60vw', rotate: 20,duration: 2, ease: 'back.in'}, 4.1)
   .to('.triangle-Bottom',  {x: '-100vw', rotate: 20, duration: 2, ease: 'back.in'}, 4.2)
  ;

  // Section 5
gsap.timeline()
sectionTimelines['section-5']
  .to('.fullBone',  {x: '15vw', rotate: -15, duration: 3, ease: 'back'}, 0.1)
   .to('.top',  {opacity: 1, duration: 0, ease: 'ease'}, 0.0)
   .to('.bottom',  {y: '22vw', scaleX: 1, duration: 9, ease: 'ease'}, 0.1)
   .to('.top',  {y: '30vh', scaleX: 2, duration: 4, ease: 'ease'}, 1)
  .to('.fullSlide',  {x: '-10vw', duration: 1.5, ease: 'back'}, 1.8)
  .to('.fullBone',  {y: '15vh', rotate: 15, duration: 3, ease: 'back'}, 3.1)
  .to('.fullSlide',  {x: '0vw', duration: 1.5, ease: 'back'}, 3.3)
  .to('.fullBone',  {y: '-30vh', x: '30vw', rotate: -50, duration: 4, ease: 'back'}, 6.1)
  .to('.fullSlide',  {x: '-10vw', duration: 1.5, ease: 'back'}, 4.8)
  .to('.top',  {y: '-10vh', duration: 4, ease: 'back.in'}, 5)
  ;

  
/* Chapter dot triggers — created AFTER the factory so pin-spacers
   already exist and section heights are correct when positions are
   calculated. */
CHAPTERS.forEach((id, i) => {
  ScrollTrigger.create({
    trigger:     '#' + id,
    start:       'top 55%',
    end:         'bottom 45%',
    onEnter:     () => setActiveChapter(i),
    onEnterBack: () => setActiveChapter(i),
  });
});

 /* ============================================================
   FOOTER ENTRANCE
   ============================================================ */
gsap.timeline({
  scrollTrigger: { trigger: '#footer', start: 'top 70%', once: true }
})
  .to('#footer .footer-label', { opacity: 1, duration: 0.5 })
  .to('#footer h2',            { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.2')
  .to('#footer .footer-body',  { opacity: 1, duration: 0.5 }, '-=0.2')
  .to('#back-to-top',          { opacity: 1, duration: 0.4 }, '-=0.1');

/* ============================================================
   BACK TO TOP
   1. Kill all ScrollTrigger instances
   2. Reset every animated element to its initial state
   3. Scroll to top
   4. Re-init ScrollTrigger and re-run hero entrance
   ============================================================ */
document.getElementById('back-to-top').addEventListener('click', () => {

  /* Kill all existing ScrollTriggers */
  ScrollTrigger.getAll().forEach(st => st.kill());

  /* Collect every element that was animated and reset it */
  const resetTargets = [
    '#hero .hero-kicker', '#hero h1', '#hero .hero-subtitle', '#hero .scroll-cue',
    '#footer .footer-label', '#footer h2', '#footer .footer-body', '#back-to-top',
    '.content-box', '.kicker', '.section-headline', '.section-body',
  ];

  gsap.set(resetTargets, { clearProps: 'all' });

  /* Re-apply the CSS initial states that GSAP was animating from */
  gsap.set(['#hero h1', '#hero .hero-subtitle'], { opacity: 0, x: -50 });
  gsap.set(['#hero .hero-kicker', '#hero .scroll-cue'], { opacity: 0 });
  gsap.set(['.kicker'], { opacity: 0 });
  gsap.set(['.section-headline', '.section-body'], { opacity: 0, y: 24 });
  gsap.set(['.content-box'], { opacity: 0 });
  gsap.set(['#footer .footer-label', '#footer h2',
            '#footer .footer-body', '#back-to-top'], { opacity: 0 });

  /* Scroll instantly to top */
  window.scrollTo({ top: 0, behavior: 'instant' });

  /* Wait one frame for scroll to settle, then rebuild everything */
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();

    /* Re-run section factory */
    document.querySelectorAll('.pin-wrap').forEach(wrap => {
      const id      = wrap.id;
      const scene   = wrap.querySelector('.sticky-scene');
      const svgEl   = wrap.querySelector('svg');
      const box     = wrap.querySelector('.content-box');
      const kicker  = wrap.querySelector('.kicker');
      const heading = wrap.querySelector('.section-headline');
      const body    = wrap.querySelector('.section-body');

      const pinEnd = wrap.dataset.pinEnd || CONFIG.pinEnd;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger:       scene,
          start:         CONFIG.pinStart,
          end:           pinEnd,
          pin:           true,
          scrub:         CONFIG.scrub,
          anticipatePin: CONFIG.anticipate,
        }
      });

      tl.to(svgEl,   { opacity: 1, duration: 0.20 }, 0.00)
        .to(box,     { opacity: 1, y: 0, duration: 0.10 }, 0.05)
        .to(kicker,  { opacity: 1, duration: 0.10 }, 0.08)
        .to(heading, { opacity: 1, y: 0, duration: 0.16, ease: 'power3.out' }, 0.14)
        .to(body,    { opacity: 1, y: 0, duration: 0.14, ease: 'power2.out' }, 0.28);

      tl.to({}, { duration: 0.45 }, 0.55);
      sectionTimelines[id] = tl;
    });

    /* Re-run footer entrance */
    gsap.timeline({
      scrollTrigger: { trigger: '#footer', start: 'top 70%', once: true }
    })
      .to('#footer .footer-label', { opacity: 1, duration: 0.5 })
      .to('#footer h2',            { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.2')
      .to('#footer .footer-body',  { opacity: 1, duration: 0.5 }, '-=0.2')
      .to('#back-to-top',          { opacity: 1, duration: 0.4 }, '-=0.1');

    /* Re-run progress bar trigger */
    ScrollTrigger.create({
      start:    'top top',
      end:      'max',
      onUpdate: self => {
        progressBar.style.width = (self.progress * 100).toFixed(2) + '%';
      }
    });

    /* Re-run hero entrance */
    gsap.set(['#hero h1', '#hero .hero-subtitle'], { opacity: 0, x: -50 });
    gsap.timeline({ delay: 0.15 })
      .to('#hero .hero-kicker',   { opacity: 1, duration: 0.7, ease: 'power2.out' })
      .to('#hero h1',             { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }, '-=0.3')
      .to('#hero .hero-subtitle', { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out' }, '-=0.4')
      .to('#hero .scroll-cue',    { opacity: 1, duration: 0.5 }, '+=0.1');
  });
});

/* ============================================================
   RESPONSIVE REFRESH
   ============================================================ */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
});

/* ============================================================
   REDUCED MOTION
   ============================================================ */
gsap.matchMedia().add('(prefers-reduced-motion: reduce)', () => {
  ScrollTrigger.getAll().forEach(st => { if (st.vars.scrub) st.vars.scrub = 0; });
  gsap.globalTimeline.timeScale(100);
});
  