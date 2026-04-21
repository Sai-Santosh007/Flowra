/* =====================================================
   FLOWRA — Premium Animation System
   GSAP + ScrollTrigger · All Sections
   Modular · 60fps · Mobile-aware
   ===================================================== */

'use strict';

/* ══════════════════════════════════════════════════════
   MOTION CONFIG — adjust values here
   ══════════════════════════════════════════════════════ */
const MOTION = {
  reduce:  window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  mobile:  window.matchMedia('(max-width: 768px)').matches,
  dur:     0.75,
  ease:    'power2.out',
  stagger: 0.12,
  tiltMax: 14,       // degrees — increased from 8 for more presence (spec: 12-18)
  tiltPerspective: 1000,
};

// Mobile: lighter animations, no 3D tilt
if (MOTION.mobile) {
  MOTION.tiltMax  = 0;
  MOTION.dur      = MOTION.dur     * 0.8;
  MOTION.stagger  = MOTION.stagger * 0.7;
}

/* ══════════════════════════════════════════════════════
   PLUGIN REGISTRATION
   ══════════════════════════════════════════════════════ */
gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════ */

// Build ScrollTrigger vars object
function st(trigger, extra = {}) {
  return {
    scrollTrigger: {
      trigger,
      start:         'top 85%',
      toggleActions: 'play none none none',
      once:          true,
      ...extra,
    },
  };
}

// Reveal a group with fromTo + ScrollTrigger
function reveal(targets, trigger, { from = {}, to = {}, extra = {} } = {}) {
  return gsap.fromTo(
    targets,
    { opacity: 0, y: 40, ...from },
    { opacity: 1, y: 0, duration: MOTION.dur, ease: MOTION.ease, stagger: MOTION.stagger, ...to, ...st(trigger, extra) }
  );
}

/* ══════════════════════════════════════════════════════
   1. HERO SECTION
   ══════════════════════════════════════════════════════ */
function initHero() {
  const words   = document.querySelectorAll('.hw');
  const badge   = document.querySelector('.hero-badge');
  const sub     = document.querySelector('.hero-sub');
  const actions = document.querySelector('.hero-actions');
  const note    = document.querySelector('.hero-note');
  const mockup  = document.getElementById('hero-mockup');
  const wrapper = document.querySelector('.mockup-wrapper');
  const hero    = document.getElementById('hero');

  if (!words.length) return;

  const tl = gsap.timeline({ defaults: { ease: MOTION.ease } });

  tl
    // Badge
    .to(badge,   { opacity: 1, y: 0, duration: 0.55 })
    // Headline words — staggered upward
    .to(words,   { opacity: 1, y: 0, duration: 0.8,  stagger: 0.15 }, '-=0.15')
    // Sub-text, buttons, note
    .to([sub, actions, note], { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, '-=0.2')
    // Mockup entrance — scale + fade (parallel)
    .to(mockup,  { opacity: 1, scale: 1, duration: 1.0, ease: 'power2.out' }, 0.3)
    // Float loop after entrance — reduced amplitude by 20% (8→6px)
    .call(() => {
      gsap.to(wrapper, {
        y: -6, duration: 2.4, ease: 'sine.inOut', repeat: -1, yoyo: true,
      });
    })
    // Primary CTA glow pulse — toned down 20%
    .call(() => {
      gsap.fromTo('#hero-cta-primary',
        { boxShadow: '0 4px 20px rgba(108,99,255,0.30)' },
        { boxShadow: '0 6px 36px rgba(108,99,255,0.55), 0 0 18px rgba(245,166,35,0.20)',
          duration: 2.0, ease: 'sine.inOut', repeat: -1, yoyo: true }
      );
    });

  // Mouse-tracking 3D tilt on dashboard (desktop only)
  let tiltReady = false;
  tl.call(() => { tiltReady = true; }, null, 1.2);

  if (!MOTION.mobile && hero && wrapper) {
    hero.addEventListener('mousemove', (e) => {
      if (!tiltReady) return;
      const r  = hero.getBoundingClientRect();
      // Normalised -1…1 relative to section centre
      const nx = (e.clientX - (r.left + r.width  * 0.5)) / (r.width  * 0.5);
      const ny = (e.clientY - (r.top  + r.height * 0.5)) / (r.height * 0.5);
      gsap.to(wrapper, {
        rotateX: -ny * MOTION.tiltMax,
        rotateY:  nx * MOTION.tiltMax,
        duration: 0.12,       // near real-time (spec: 0.1-0.2s)
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
    hero.addEventListener('mouseleave', () => {
      gsap.to(wrapper, {
        rotateX: 0, rotateY: 0,
        duration: 0.22,       // faster spring-back
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
  }
}

/* ══════════════════════════════════════════════════════
   2. SOCIAL PROOF BAR
   ══════════════════════════════════════════════════════ */
function initSocial() {
  reveal('.logo-item', '#social-proof', {
    from:  { y: 20 },
    to:    { duration: 0.5, stagger: 0.07 },
    extra: { start: 'top 90%' },
  });
}

/* ══════════════════════════════════════════════════════
   3. FEATURES SECTION
   ══════════════════════════════════════════════════════ */
function initFeatures() {
  const sec = '#features';

  // Section header group
  reveal(
    [`${sec} .section-label`, `${sec} .section-headline`, `${sec} .section-sub`],
    sec, { from: { y: 30 }, to: { stagger: 0.1, duration: 0.65 } }
  );

  // Cards — scale + fade, staggered
  gsap.fromTo('.glass-card',
    { opacity: 0, y: 44, scale: 0.96 },
    { opacity: 1, y: 0,  scale: 1,
      duration: MOTION.dur, ease: MOTION.ease, stagger: MOTION.stagger,
      ...st('.features-grid', { start: 'top 80%' }) }
  );

  // Floating icon loops — subtle vertical drift
  document.querySelectorAll('.card-icon-wrap').forEach((icon, i) => {
    gsap.to(icon, {
      y: -5, duration: 2.2 + i * 0.5,
      ease: 'sine.inOut', repeat: -1, yoyo: true, delay: i * 0.25,
    });
  });

  // 3D tilt + cursor glow (desktop)
  if (!MOTION.mobile) {
    document.querySelectorAll('.glass-card').forEach(card => initCardInteraction(card));
  }
}

/* ══════════════════════════════════════════════════════
   4. HOW IT WORKS
   ══════════════════════════════════════════════════════ */
function initHowItWorks() {
  const sec = '#how-it-works';

  reveal(
    [`${sec} .section-label`, `${sec} .section-headline`],
    sec, { from: { y: 30 }, to: { stagger: 0.1, duration: 0.65 } }
  );

  // Step cards — sequential stagger
  reveal('.step-card', '.steps-grid', {
    from:  { y: 42 },
    to:    { duration: 0.7, stagger: 0.18 },
    extra: { start: 'top 80%' },
  });

  // Connecting line — draw effect (scaleX 0 → 1)
  gsap.fromTo('.steps-line-fill',
    { scaleX: 0 },
    { scaleX: 1, duration: 1.4, ease: 'power2.inOut', ...st('.steps-wrapper', { start: 'top 70%' }) }
  );

  // Active step highlight — slight scale when in viewport centre
  document.querySelectorAll('.step-card').forEach(step => {
    ScrollTrigger.create({
      trigger: step,
      start:   'top 65%',
      end:     'bottom 35%',
      onEnter:     () => gsap.to(step, { scale: 1.04, boxShadow: '0 0 32px rgba(108,99,255,0.18)', duration: 0.4, ease: 'back.out(1.5)', overwrite: 'auto' }),
      onLeave:     () => gsap.to(step, { scale: 1,    boxShadow: 'none', duration: 0.4, ease: 'power2.out', overwrite: 'auto' }),
      onEnterBack: () => gsap.to(step, { scale: 1.04, boxShadow: '0 0 32px rgba(108,99,255,0.18)', duration: 0.4, ease: 'back.out(1.5)', overwrite: 'auto' }),
      onLeaveBack: () => gsap.to(step, { scale: 1,    boxShadow: 'none', duration: 0.4, ease: 'power2.out', overwrite: 'auto' }),
    });
  });
}

/* ══════════════════════════════════════════════════════
   5. TESTIMONIALS
   ══════════════════════════════════════════════════════ */
function initTestimonials() {
  const sec = '#testimonials';

  reveal(
    [`${sec} .section-label`, `${sec} .section-headline`],
    sec, { from: { y: 30 }, to: { stagger: 0.1, duration: 0.65 } }
  );

  // Cards slide in from their natural directions with fade
  const xStart = [-50, 0, 50];
  document.querySelectorAll('.testimonial-card').forEach((card, i) => {
    const isFeatured = card.classList.contains('featured');
    gsap.fromTo(card,
      { opacity: 0, y: 30, x: xStart[i] ?? 0, scale: isFeatured ? 1.03 : 1 },
      { opacity: 1, y: 0,  x: 0,              scale: isFeatured ? 1.03 : 1,
        duration: 0.75, ease: MOTION.ease, delay: i * 0.1,
        ...st('.testimonials-grid', { start: 'top 80%' }) }
    );
  });
}

/* ══════════════════════════════════════════════════════
   6. PRICING SECTION
   ══════════════════════════════════════════════════════ */
function initPricing() {
  const sec = '#pricing';

  reveal(
    [`${sec} .section-label`, `${sec} .section-headline`, `${sec} .section-sub`],
    sec, { from: { y: 30 }, to: { stagger: 0.1, duration: 0.65 } }
  );

  // Billing toggle
  gsap.fromTo(`${sec} .pricing-toggle`,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.5, ease: MOTION.ease, delay: 0.35, ...st(sec) }
  );

  // Cards rise from bottom — preserve popular card's scale
  document.querySelectorAll('.pricing-card').forEach((card, i) => {
    const isPopular = card.classList.contains('popular');
    gsap.fromTo(card,
      { opacity: 0, y: 60, scale: isPopular ? 1.04 : 1 },
      { opacity: 1, y: 0,  scale: isPopular ? 1.04 : 1,
        duration: 0.8, ease: MOTION.ease, delay: i * 0.12,
        ...st('.pricing-grid', { start: 'top 80%' }) }
    );
  });

  // Lighter tilt on pricing cards (desktop)
  if (!MOTION.mobile) {
    document.querySelectorAll('.pricing-card').forEach(card => {
      initCardInteraction(card, { maxTilt: 5 });
    });
  }
}

/* ══════════════════════════════════════════════════════
   7. FINAL CTA
   ══════════════════════════════════════════════════════ */
function initFinalCta() {
  const inner = document.querySelector('.cta-inner');
  if (!inner) return;

  gsap.fromTo(inner,
    { opacity: 0, y: 40, scale: 0.97 },
    { opacity: 1, y: 0,  scale: 1, duration: 0.9, ease: MOTION.ease,
      ...st('#final-cta', { start: 'top 75%' }) }
  );

  // Background glow intensifies on scroll into view
  gsap.fromTo('.cta-bg-glow',
    { opacity: 0.5, scale: 0.9 },
    { opacity: 1,   scale: 1.12, ease: 'none',
      scrollTrigger: { trigger: '#final-cta', start: 'top 80%', end: 'bottom 20%', scrub: 1.5 } }
  );

  // Strongest pulse — CTA button
  gsap.fromTo('#final-cta-btn',
    { boxShadow: '0 4px 24px rgba(108,99,255,0.38)' },
    { boxShadow: '0 10px 55px rgba(108,99,255,0.85), 0 0 36px rgba(245,166,35,0.42)',
      duration: 1.8, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 0.8 }
  );
}

/* ══════════════════════════════════════════════════════
   8. CARD 3D INTERACTION — tilt + glow + shine
      Used by Features and Pricing cards
   ══════════════════════════════════════════════════════ */
function initCardInteraction(card, opts = {}) {
  const maxTilt   = opts.maxTilt ?? MOTION.tiltMax;

  // Set perspective on the element itself
  gsap.set(card, { transformPerspective: MOTION.tiltPerspective });

  // Glow blob that follows cursor
  const glow = document.createElement('div');
  glow.className = 'card-glow-blob';
  card.appendChild(glow);

  // Directional shine overlay
  const shine = document.createElement('div');
  shine.className = 'card-shine';
  card.appendChild(shine);

  card.addEventListener('mouseenter', () => {
    gsap.to(glow, { opacity: 1, duration: 0.15, ease: 'power2.out' });
    gsap.to(card, {
      boxShadow: '0 22px 60px rgba(0,0,0,0.45), 0 0 44px rgba(108,99,255,0.22)',
      duration: 0.15, ease: 'power2.out', overwrite: 'auto',
    });
  });

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    // Normalised -1…1 from card centre (§3 — consistent across card sizes)
    const nx   = (e.clientX - (rect.left + rect.width  * 0.5)) / (rect.width  * 0.5);
    const ny   = (e.clientY - (rect.top  + rect.height * 0.5)) / (rect.height * 0.5);
    const pctX = ((e.clientX - rect.left) / rect.width)  * 100;
    const pctY = ((e.clientY - rect.top)  / rect.height) * 100;

    // 3D tilt — near real-time (spec: 0.1-0.2s)
    gsap.to(card, {
      rotateX: -ny * maxTilt,
      rotateY:  nx * maxTilt,
      y: -8,
      duration: 0.12, ease: 'power2.out', overwrite: 'auto',
    });

    // Glow follows cursor
    glow.style.left = `${pctX}%`;
    glow.style.top  = `${pctY}%`;

    // Directional surface shine
    shine.style.background = `radial-gradient(circle at ${pctX}% ${pctY}%, rgba(255,255,255,0.07) 0%, transparent 55%)`;
  });

  card.addEventListener('mouseleave', () => {
    gsap.to(card, {
      rotateX: 0, rotateY: 0, y: 0,
      boxShadow: '',
      duration: 0.22, ease: 'power2.out', overwrite: 'auto', // fast spring-back
    });
    gsap.to(glow, { opacity: 0, duration: 0.2 });
    shine.style.background = '';
  });
}

/* ══════════════════════════════════════════════════════
   9. SUBTLE PARALLAX
   ══════════════════════════════════════════════════════ */
function initParallax() {
  // Hero glow pulse drifts — reduced 25% (80→60px)
  gsap.to('.hero-glow-pulse', {
    y: 60, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1.5 },
  });

  // Hero background glows — reduced ~25%
  gsap.utils.toArray('.hero-glow').forEach((glow, i) => {
    gsap.to(glow, {
      y: i === 0 ? -22 : 17, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 + i * 0.4 },
    });
  });
}

/* ══════════════════════════════════════════════════════
   10. SCROLL PROGRESS BAR
   ══════════════════════════════════════════════════════ */
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.appendChild(bar);

  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end:   'bottom bottom',
    scrub: 0.3,
    onUpdate: (self) => {
      bar.style.width = (self.progress * 100) + '%';
    },
  });
}

/* ══════════════════════════════════════════════════════
   BOOT — initialise everything
   ══════════════════════════════════════════════════════ */
function boot() {
  // Prefers-reduced-motion: reveal everything immediately
  if (MOTION.reduce) {
    const allTargets = [
      '.hw', '.hero-badge', '.hero-sub', '.hero-actions', '.hero-note',
      '#hero-mockup', '.section-label', '.section-headline', '.section-sub',
      '.glass-card', '.step-card', '.testimonial-card', '.pricing-card',
      '.cta-inner', '.logo-item', '.pricing-toggle',
    ].join(',');
    gsap.set(allTargets, { opacity: 1, y: 0, x: 0, scale: 1 });
    return;
  }

  initHero();
  initSocial();
  initFeatures();
  initHowItWorks();
  initTestimonials();
  initPricing();
  initFinalCta();
  initParallax();
  initScrollProgress();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
