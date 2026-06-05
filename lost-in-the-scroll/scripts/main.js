import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/* ============================================================
     CONFIG
     Central object — edit values here rather than hunting through code.
     ============================================================ */
  const CONFIG = {
    pinVh:       500,    /* default scroll distance per section (vh units)  */
    scrub:       1,      /* scrub lag in seconds; 0 = instant               */
    gapVh:       30,     /* section-gap height in vh (must match CSS)       */
    anticipate:  1,      /* anticipatePin value for ScrollTrigger           */
  };
 
  /* ============================================================
     SETUP
     ============================================================ */
  gsap.registerPlugin(ScrollTrigger);
 
  /* Apply --pin-vh CSS var to each .pin-wrap so height is correct.
     Reads per-element override first, falls back to CONFIG.pinVh.   */
  document.querySelectorAll('.pin-wrap').forEach(wrap => {
    const override = wrap.style.getPropertyValue('--pin-vh');
    const vh = override ? parseInt(override) : CONFIG.pinVh;
    wrap.style.setProperty('--pin-vh', vh);
    wrap.style.height = `${vh}vh`;
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
  gsap.timeline({ delay: 0.15 })
    .to('#hero .hero-kicker',   { opacity: 1, duration: 0.7, ease: 'power2.out' })
    .to('#hero h1',             { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.3')
    .to('#hero .hero-subtitle', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.4')
    .to('#hero .scroll-cue',    { opacity: 1, duration: 0.5 }, '+=0.1');
 
  /* ============================================================
     SECTION FACTORY
     Builds one ScrollTrigger timeline per .pin-wrap.
 
     Timeline structure (scrubbed 0 → 1 across the pin distance):
       0.00 – 0.20  SVG canvas fades in
       0.05 – 0.15  content-box fades in
       0.08 – 0.30  kicker fades in
       0.14 – 0.45  headline rises in
       0.28 – 0.55  body copy rises in
       0.55 – 1.00  reserved for SVG animations (see block below)
 
     All stored in sectionTimelines[id] so you can push SVG
     tweens into them from the block below.
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
 
    /* Per-section pin distance */
    const vh     = parseFloat(wrap.style.getPropertyValue('--pin-vh')) || CONFIG.pinVh;
    const pinEnd = `+=${vh}vh`;
 
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger:      scene,
        start:        'top top',
        end:          pinEnd,
        pin:          true,
        scrub:        CONFIG.scrub,
        anticipatePin: CONFIG.anticipate,
        /* markers: true, */ /* ← uncomment to debug trigger positions */
      }
    });
 
    /* Entrance sequence */
    tl.to(svgEl,   { opacity: 1, duration: 0.20 }, 0.00)
      .to(box,     { opacity: 1, duration: 0.10 }, 0.05)
      .to(kicker,  { opacity: 1, duration: 0.10 }, 0.08)
      .to(heading, { opacity: 1, y: 0, duration: 0.16, ease: 'power3.out' }, 0.14)
      .to(body,    { opacity: 1, y: 0, duration: 0.14, ease: 'power2.out' }, 0.28);
 
    /* Reserve space for SVG animations (0.55 → 1.0) — add via block below */
    tl.to({}, { duration: 0.45 }, 0.55); /* placeholder keep total = 1 */
 
    sectionTimelines[id] = tl;
  });
 
  /* ============================================================
     SECTION SVG ANIMATIONS
     Add SVG tweens for each section here.
     The total timeline length is 1.0 (scrub maps scroll to 0→1).
     Text entrance occupies 0.0–0.55; use 0.55–1.0 for SVG beats.
 
     Position parameter cheatsheet:
       0.6          — absolute position at 60% of timeline
       '<'          — same start as previous tween
       '<0.1'       — 0.1 after previous tween's start
       '+=0.1'      — 0.1 after previous tween's end
 
     Example (section 1 — uncomment and adapt):
       sectionTimelines['section-1']
         .from('#svg-s1 #my-path',   { drawSVG: '0%',  duration: 0.2 }, 0.55)
         .from('#svg-s1 #my-circle', { scale: 0, transformOrigin: '50% 50%', duration: 0.15 }, '<0.05')
         .to(  '#svg-s1 #my-label',  { opacity: 1,     duration: 0.10 }, '<0.1');
     ============================================================ */
 
  /* Section 1 */
  // sectionTimelines['section-1']
  //   .from('#svg-s1 .my-shape', { opacity: 0, duration: 0.2 }, 0.55);
 
  /* Section 2 */
  // sectionTimelines['section-2']
  //   .from('#svg-s2 .my-shape', { opacity: 0, duration: 0.2 }, 0.55);
 
  /* Section 3 */
  // sectionTimelines['section-3']
  //   .from('#svg-s3 .my-shape', { opacity: 0, duration: 0.2 }, 0.55);
 
  /* Section 4 */
  // sectionTimelines['section-4']
  //   .from('#svg-s4 .my-shape', { opacity: 0, duration: 0.2 }, 0.55);
 
  /* Section 5 */
  // sectionTimelines['section-5']
  //   .from('#svg-s5 .my-shape', { opacity: 0, duration: 0.2 }, 0.55);
 
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