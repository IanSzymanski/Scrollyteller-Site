import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/* ============================================================
   CONFIG
   ============================================================ */
const CONFIG = {
  pinStart:       'top top',
  scrub:          1,
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
  const go = () => document.getElementById(id)
    .scrollIntoView({ behavior: 'smooth' });
  dot.addEventListener('click', go);
  dot.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') go(); });
  navEl.appendChild(dot);
});

const dots = navEl.querySelectorAll('.ch-dot');
function setActiveChapter(n) {
  dots.forEach((d, i) => d.classList.toggle('active', i === n));
}

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
   HERO ENTRANCE
   Load animation — not scroll-driven.
   ============================================================ */
gsap.set(['#hero h1', '#hero .hero-subtitle'], { x: -50 });

gsap.timeline({ delay: 0.5 })
  .to('.cloud-Back',  { opacity: 1, y: 0, duration: 1,   ease: 'back' },        '-=0.4')
  .to('.cloud-Front', { opacity: 1, y: 0, duration: 1,   ease: 'back' },        '-=0.9')
  .to('#hero h1',             { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }, '-=0.4')
  .to('#hero .hero-subtitle', { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out' }, '-=0.4')
  .to('.trombone-Case', { opacity: 1, y: 0, duration: 2, transformOrigin: 'left center', rotate: -5, ease: 'back' }, '-=0.4')
  .to('#hero .scroll-cue',    { opacity: 1, duration: 1, scale: 1, ease: 'bounce' }, '+=0.1');

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
        { y: '120vh', opacity: 1 },
        { y: 0, duration: 2.5, ease: 'power2.out' }, 0)
      .fromTo('.bar-Mid',
        { y: '80vh', opacity: 1 },
        { y: 0, duration: 2.5, ease: 'power2.out' }, 0)
      .fromTo('.bar-Front',
        { y: '40vh', opacity: 1 },
        { y: 0, duration: 2.5, ease: 'power2.out' }, 0)

      // ── Text reveals once bars have mostly landed ─────────
      .to(box,     { opacity: 1, y: 0, duration: 0.8 },                    2.0)
      .to(kicker,  { opacity: 1,        duration: 0.6 },                    2.2)
      .to(heading, { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }, 2.6)
      .to(body,    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 3.2)

      // ── Hold — bars remain in view before unpinning ───────
      .to({}, { duration: 1.0 });

  } else {
    tl
      .to(svgEl,   { opacity: 1,        duration: 1.0 },                    0.0)
      .to(box,     { opacity: 1, y: 0, duration: 0.8 },                    0.8)
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
    markers:       true,
  });
});

/* ============================================================
   FOOTER ENTRANCE
   Fires once when footer scrolls into view (not scrubbed).
   ============================================================ */
gsap.timeline({
  scrollTrigger: { trigger: '#footer', start: 'top 70%', once: true }
})
  .to('#footer .footer-label', { opacity: 1, duration: 0.5 })
  .to('#footer h2',            { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.2')
  .to('#footer .footer-body',  { opacity: 1, duration: 0.5 }, '-=0.2');

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
