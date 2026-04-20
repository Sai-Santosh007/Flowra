/* =====================================================
   FLOWRA — Hero Animations
   GSAP entrance · Float loop · Mouse tilt
   ===================================================== */

'use strict';

(function initHeroAnimations() {

  /* ── Collect elements ───────────────────────────── */
  const words       = document.querySelectorAll('.hw');
  const badge       = document.querySelector('.hero-badge');
  const heroBadge   = badge;
  const heroSub     = document.querySelector('.hero-sub');
  const heroActions = document.querySelector('.hero-actions');
  const heroNote    = document.querySelector('.hero-note');
  const heroMockup  = document.getElementById('hero-mockup');
  const mockupWrap  = document.querySelector('.mockup-wrapper');
  const hero        = document.getElementById('hero');

  if (!words.length || !heroMockup) return;

  /* ── Master timeline ────────────────────────────── */
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  // 0. Badge slides in first
  tl.to(heroBadge, {
    opacity: 1,
    y: 0,
    duration: 0.55,
  });

  // 1. Headline words — stagger in one by one (0.8s each, 0.15s apart)
  tl.to(words, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.15,
  }, '-=0.15');

  // 2. Sub-headline, actions row, micro-note — fade up after last word
  tl.to([heroSub, heroActions, heroNote], {
    opacity: 1,
    y: 0,
    duration: 0.6,
    stagger: 0.1,
  }, '-=0.2');

  // 3. Dashboard mockup — scale + fade entrance, starts ~0.3s into timeline
  tl.to(heroMockup, {
    opacity: 1,
    scale: 1,
    duration: 1,
    ease: 'power2.out',
  }, 0.3);

  // 4. Kick off the float loop once the mockup has appeared
  tl.call(() => {
    gsap.to(mockupWrap, {
      y: -8,
      duration: 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });
  });

  /* ── Mouse-tracking perspective tilt ───────────── */
  if (!hero || !mockupWrap) return;

  // Track whether the mockup entrance has completed before allowing tilt
  let tiltReady = false;
  tl.call(() => { tiltReady = true; }, null, 1.0);

  hero.addEventListener('mousemove', (e) => {
    if (!tiltReady) return;

    const rect = hero.getBoundingClientRect();
    // Normalise to -1 … +1 relative to hero centre
    const dx = (e.clientX - (rect.left + rect.width  * 0.5)) / (rect.width  * 0.5);
    const dy = (e.clientY - (rect.top  + rect.height * 0.5)) / (rect.height * 0.5);

    // Max ±8 degrees
    const rotY =  dx * 8;
    const rotX = -dy * 8;

    gsap.to(mockupWrap, {
      rotateX: rotX,
      rotateY: rotY,
      duration: 0.6,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  });

  hero.addEventListener('mouseleave', () => {
    if (!tiltReady) return;
    gsap.to(mockupWrap, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.9,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  });

})();
