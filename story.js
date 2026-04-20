/* =====================================================
   STORY.JS — Flowra Narrative Scroll Experience
   GSAP ScrollTrigger — Character Journey Across Sections
   ===================================================== */

'use strict';

/* -------------------------------------------------------
   Bootstrap: wait for GSAP to be fully available
   ------------------------------------------------------- */
function initNarrative() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    setTimeout(initNarrative, 60);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Guard — character must exist
  const charSvg = document.getElementById('char-svg');
  if (!charSvg) return;

  /* =====================================================
     ELEMENT REFERENCES
     ===================================================== */

  const charWrapper  = document.getElementById('char-wrapper');
  const headGroup    = document.getElementById('char-head-group');
  const armLeft      = document.getElementById('char-arm-left');
  const armRight     = document.getElementById('char-arm-right');
  const charLegs     = document.getElementById('char-legs');
  const charDesk     = document.getElementById('char-desk');
  const lightbulb    = document.getElementById('char-lightbulb');
  const charArrow    = document.getElementById('char-arrow');
  const stressMarks  = document.getElementById('stress-marks');
  const blushL       = document.getElementById('blush-left');
  const blushR       = document.getElementById('blush-right');
  const eyeL         = document.getElementById('char-eye-left');
  const eyeR         = document.getElementById('char-eye-right');

  const mouths = {
    neutral:   document.getElementById('mouth-neutral'),
    smile:     document.getElementById('mouth-smile'),
    frown:     document.getElementById('mouth-frown'),
    grin:      document.getElementById('mouth-grin'),
    surprised: document.getElementById('mouth-surprised'),
  };

  // Scene background layers
  const scenes = {};
  [1, 2, 3, 4, 5, 6].forEach(n => {
    scenes[n] = document.getElementById(`scene${n}-bg`);
  });

  // Floating papers (in story-props)
  const papers = document.querySelectorAll('.story-paper');
  const rocket  = document.getElementById('story-rocket');

  /* =====================================================
     HELPERS
     ===================================================== */

  function setMouth(name, dur = 0.28) {
    Object.entries(mouths).forEach(([key, el]) => {
      if (!el) return;
      gsap.to(el, { opacity: key === name ? 1 : 0, duration: dur, overwrite: 'auto' });
    });
  }

  function killChar() {
    gsap.killTweensOf([headGroup, armLeft, armRight, charLegs, lightbulb, charArrow, charWrapper]);
  }

  // Burst of sparkles at a fixed viewport position
  function spawnSparkle(vx, vy, count = 7) {
    const colors = ['#F5A623', '#6C63FF', '#FFD166', '#9390FF'];
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      dot.className = 'confetti-js';
      const size = 4 + Math.random() * 6;
      dot.style.cssText = `
        width:${size}px; height:${size}px; border-radius:50%;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        left:${vx}px; top:${vy}px;
      `;
      document.body.appendChild(dot);
      const angle = (i / count) * Math.PI * 2;
      const dist  = 22 + Math.random() * 36;
      gsap.fromTo(dot,
        { opacity: 1, scale: 0, x: 0, y: 0 },
        {
          opacity: 0, scale: 1,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          duration: 0.75 + Math.random() * 0.4,
          ease: 'power2.out',
          onComplete: () => dot.remove(),
        }
      );
    }
  }

  // Confetti burst (scene 3, step 3 + CTA)
  function confettiBurst(count = 24) {
    const colors = ['#6C63FF','#F5A623','#FF6B6B','#4ECDC4','#FFD166','#9390FF','#fff'];
    const baseRight = 90 + (parseFloat(getComputedStyle(document.getElementById('story-panel')).width) || 260) / 2;
    for (let i = 0; i < count; i++) {
      const c = document.createElement('div');
      c.className = 'confetti-js';
      const size = 5 + Math.random() * 9;
      c.style.cssText = `
        width:${size}px; height:${size}px;
        border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        background:${colors[i % colors.length]};
        right:${baseRight + (Math.random() - 0.5) * 120}px;
        top:${15 + Math.random() * 50}vh;
      `;
      document.body.appendChild(c);
      gsap.fromTo(c,
        { opacity: 1, y: 0, rotation: 0, scale: 1 },
        {
          opacity: 0,
          y: 160 + Math.random() * 120,
          x: (Math.random() - 0.5) * 90,
          rotation: Math.random() * 720 - 360,
          scale: 0,
          duration: 1.4 + Math.random() * 0.8,
          ease: 'power1.out',
          onComplete: () => c.remove(),
        }
      );
    }
  }

  /* =====================================================
     SCENE 1 — HERO: The Chaos
     Character hidden, papers fall, chaos desk visible
     ===================================================== */

  // ── Initial state ── overwhelmed seated
  gsap.set(charWrapper,  { opacity: 0, x: 40 });                              // hidden off-right
  gsap.set(headGroup,    { rotation: -20, y: 16, transformOrigin: '100px 120px' });
  gsap.set(armLeft,      { rotation: -128, transformOrigin: '68px 182px' });  // hands on head
  gsap.set(armRight,     { rotation:  128, transformOrigin: '132px 182px' }); // hands on head
  gsap.set(charLegs,     { opacity: 0 });
  gsap.set(charDesk,     { opacity: 1 });
  gsap.set(lightbulb,    { opacity: 0, scale: 0, transformOrigin: '100px -60px' });
  gsap.set(charArrow,    { opacity: 0 });
  gsap.set(stressMarks,  { opacity: 1 });
  gsap.set([blushL, blushR], { opacity: 0 });

  // Initial mouth: frown
  Object.values(mouths).forEach(m => m && gsap.set(m, { opacity: 0 }));
  if (mouths.frown) gsap.set(mouths.frown, { opacity: 1 });

  // Papers rain in hero zone
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end:   'bottom top',
    onEnter:     () => papers.forEach(p => { p.style.animationPlayState = 'running'; }),
    onLeave:     () => papers.forEach(p => { p.style.animationPlayState = 'paused';  }),
    onEnterBack: () => papers.forEach(p => { p.style.animationPlayState = 'running'; }),
    onLeaveBack: () => papers.forEach(p => { p.style.animationPlayState = 'paused';  }),
  });
  // Start paused; hero trigger above enables them
  papers.forEach(p => { p.style.animationPlayState = 'paused'; });

  // ── As user scrolls through hero: character looks up, slides in ──
  gsap.timeline({
    scrollTrigger: {
      trigger: '#hero',
      start: '40% top',
      end:   'bottom 30%',
      scrub: 1.4,
    },
  })
  .to(charWrapper,  { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }, 0)
  .to(headGroup,    { rotation: 12, y: 0, duration: 0.6 }, 0.1)
  .to(armLeft,      { rotation: -42, duration: 0.5 }, 0.1)
  .to(armRight,     { rotation:  42, duration: 0.5 }, 0.1)
  .to(eyeL,         { scaleY: 1.35, transformOrigin: '83px 108px', duration: 0.3 }, 0.2)
  .to(eyeR,         { scaleY: 1.35, transformOrigin: '117px 108px', duration: 0.3 }, 0.2)
  .to(mouths.frown, { opacity: 0, duration: 0.2 }, 0.15)
  .to(mouths.surprised, { opacity: 1, duration: 0.25 }, 0.2)
  .to(stressMarks,  { opacity: 0, duration: 0.3 }, 0.1);


  /* =====================================================
     SCENE 2 — FEATURES: The Discovery
     Character stands, excited, points at each card
     ===================================================== */

  const tl2 = gsap.timeline({
    scrollTrigger: {
      trigger: '#features',
      start: 'top 72%',
      end:   'top 10%',
      scrub: 1.5,
    },
  });

  tl2
  .to(scenes[1], { opacity: 0.25, duration: 0.4 }, 0)
  .to(scenes[2], { opacity: 1,    duration: 0.5 }, 0.15)
  // Stand up: legs appear, desk goes
  .to(charLegs,  { opacity: 1, duration: 0.4 }, 0)
  .to(charDesk,  { opacity: 0, duration: 0.3 }, 0)
  // Head tilts with curiosity
  .to(headGroup, { rotation: 10, y: 0, duration: 0.4 }, 0.05)
  // Arms open wide — "what is this?"
  .to(armLeft,   { rotation: -55, duration: 0.4 }, 0.05)
  .to(armRight,  { rotation:  55, duration: 0.4 }, 0.05)
  // Eyes back to normal, happy expression
  .to(eyeL,      { scaleY: 1, duration: 0.3 }, 0.05)
  .to(eyeR,      { scaleY: 1, duration: 0.3 }, 0.05)
  .to(mouths.surprised, { opacity: 0, duration: 0.2 }, 0.08)
  .to(mouths.smile,     { opacity: 1, duration: 0.3 }, 0.12)
  .to([blushL, blushR], { opacity: 0.3, duration: 0.3 }, 0.2)
  .to(stressMarks,      { opacity: 0, duration: 0.2 }, 0)
  // Papers fade out
  .to(papers,           { opacity: 0, duration: 0.3 }, 0)
  // Excited pointing — right arm extends toward cards
  .to(armRight, { rotation: -65, duration: 0.4, ease: 'back.out(2)' }, 0.55)
  .to(headGroup, { rotation: -6, duration: 0.4 }, 0.55);

  // Sparkle + point at each feature card when it enters view
  document.querySelectorAll('.glass-card').forEach((card, idx) => {
    ScrollTrigger.create({
      trigger: card,
      start:   'top 68%',
      once:    true,
      onEnter: () => {
        const rect = card.getBoundingClientRect();
        spawnSparkle(rect.right - 20, rect.top + 28, 8);

        gsap.to(armRight, {
          rotation: -72 + idx * 18,
          duration: 0.55,
          ease: 'back.out(2.5)',
          overwrite: 'auto',
        });
        // Quick head nod toward card
        gsap.to(headGroup, {
          rotation: -8 - idx * 3,
          duration: 0.4,
          overwrite: 'auto',
        });
      },
    });
  });


  /* =====================================================
     SCENE 3 — HOW IT WORKS: The Transformation
     Walking animation, per-step reactions
     ===================================================== */

  const tl3 = gsap.timeline({
    scrollTrigger: {
      trigger: '#how-it-works',
      start: 'top 70%',
      end:   'top 8%',
      scrub: 1.5,
    },
  });

  tl3
  .to(scenes[2], { opacity: 0, duration: 0.35 }, 0)
  .to(scenes[3], { opacity: 1, duration: 0.5  }, 0.12)
  .to(headGroup, { rotation: 0, duration: 0.4  }, 0.05)
  .to(mouths.smile, { opacity: 0, duration: 0.2 }, 0)
  .to(mouths.grin,  { opacity: 1, duration: 0.3 }, 0.08);

  // Add walking CSS class during this section
  let walkTimer = null;
  ScrollTrigger.create({
    trigger: '#how-it-works',
    start: 'top 60%',
    end:   'bottom 40%',
    onEnter:     () => { charWrapper.classList.add('char-walking');    },
    onLeave:     () => { charWrapper.classList.remove('char-walking'); },
    onEnterBack: () => { charWrapper.classList.add('char-walking');    },
    onLeaveBack: () => { charWrapper.classList.remove('char-walking'); },
  });

  // ── Step 1: Typing enthusiastically ──
  ScrollTrigger.create({
    trigger: '#step-1',
    start:   'top 66%',
    once:    true,
    onEnter: () => {
      charWrapper.classList.remove('char-walking');
      gsap.timeline()
        .to(armLeft,   { rotation: -80, duration: 0.4, ease: 'power2.out' })
        .to(armRight,  { rotation:  80, duration: 0.4, ease: 'power2.out' }, '<')
        .to(headGroup, { rotation: -5,  duration: 0.3 }, '<')
        // Rapid alternating typing motion
        .to(armLeft,   { rotation: -70, duration: 0.12, repeat: 7, yoyo: true, ease: 'none' }, '+=0.1')
        .to(armRight,  { rotation:  90, duration: 0.12, repeat: 7, yoyo: true, ease: 'none' }, '<')
        .call(() => charWrapper.classList.add('char-walking'));
    },
  });

  // ── Step 2: Lightbulb! ──
  ScrollTrigger.create({
    trigger: '#step-2',
    start:   'top 66%',
    once:    true,
    onEnter: () => {
      charWrapper.classList.remove('char-walking');
      gsap.timeline()
        // Cup hand to ear pose
        .to(armLeft,   { rotation: -95,  duration: 0.45, ease: 'back.out(2)' })
        .to(armRight,  { rotation:  45,  duration: 0.45, ease: 'power2.out' }, '<')
        .to(headGroup, { rotation: 14,   y: -10, duration: 0.5, ease: 'back.out(2)' }, 0.15)
        // Nod
        .to(headGroup, { rotation: 18,   y: -4,  duration: 0.25 }, '>')
        .to(headGroup, { rotation: 14,   y: -8,  duration: 0.25 }, '>')
        // Lightbulb appears above head
        .to(lightbulb, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(3)' }, 0.55)
        // Expression: surprised → grin
        .to(mouths.grin,  { opacity: 0, duration: 0.15 }, 0.55)
        .to(mouths.surprised, { opacity: 1, duration: 0.15 }, 0.55)
        .to([blushL, blushR], { opacity: 0.45, duration: 0.3 }, 0.6)
        .to(mouths.surprised, { opacity: 0, duration: 0.2 }, 1.5)
        .to(mouths.grin,      { opacity: 1, duration: 0.25 }, 1.5)
        // Bulb fades
        .to(lightbulb, { opacity: 0, scale: 0, duration: 0.4, ease: 'back.in(2)' }, 2.0)
        .call(() => charWrapper.classList.add('char-walking'));
    },
  });

  // ── Step 3: Celebration! ──
  ScrollTrigger.create({
    trigger: '#step-3',
    start:   'top 66%',
    once:    true,
    onEnter: () => {
      charWrapper.classList.remove('char-walking');
      gsap.timeline()
        // Both arms shoot up
        .to(armLeft,   { rotation: -155, duration: 0.5, ease: 'back.out(3)' })
        .to(armRight,  { rotation:  155, duration: 0.5, ease: 'back.out(3)' }, '<')
        .to(headGroup, { rotation: 0, y: -14, duration: 0.4, ease: 'power2.out' }, 0.1)
        // Character bounces up
        .to(charWrapper, { y: -22, duration: 0.28, ease: 'power2.out' }, 0.2)
        .to(charWrapper, { y:   0, duration: 0.55, ease: 'bounce.out' }, '>')
        // Expression
        .to(mouths.grin, { opacity: 0, duration: 0.15 }, 0.15)
        .to(mouths.smile, { opacity: 1, duration: 0.25 }, 0.15)
        .to([blushL, blushR], { opacity: 0.5, duration: 0.3 }, 0.2)
        // Confetti!
        .call(confettiBurst, [], 0.22)
        // Return to walk
        .to(armLeft,  { rotation: -42, duration: 0.5, ease: 'power2.inOut' }, 1.4)
        .to(armRight, { rotation:  42, duration: 0.5, ease: 'power2.inOut' }, '<')
        .call(() => charWrapper.classList.add('char-walking'), [], 1.9);
    },
  });


  /* =====================================================
     SCENE 4 — TESTIMONIALS: Social Proof
     Character faces viewer, confident thumbs up
     Background figures appear and wave
     ===================================================== */

  const tl4 = gsap.timeline({
    scrollTrigger: {
      trigger: '#testimonials',
      start: 'top 70%',
      end:   'top 10%',
      scrub: 1.5,
    },
  });

  tl4
  .to(scenes[3], { opacity: 0,  duration: 0.4 }, 0)
  .to(scenes[4], { opacity: 1,  duration: 0.5 }, 0.12)
  .to(headGroup, { rotation: 0, y: 0, duration: 0.4 }, 0)
  // Confident thumbs-up: right arm extended
  .to(armRight,  { rotation: -95,  duration: 0.5, ease: 'back.out(2)' }, 0.1)
  .to(armLeft,   { rotation: -18,  duration: 0.4 }, 0.1)
  .to(mouths.grin,  { opacity: 0, duration: 0.2 }, 0)
  .to(mouths.smile, { opacity: 1, duration: 0.3 }, 0.08)
  .to([blushL, blushR], { opacity: 0.28, duration: 0.3 }, 0.15);

  // Scene 4 people slide in from the right as testimonials scroll into view
  document.querySelectorAll('.scene4-person').forEach((person, i) => {
    gsap.fromTo(person,
      { opacity: 0, x: 50 },
      {
        opacity: 1, x: 0,
        duration: 0.6,
        ease: 'back.out(2)',
        scrollTrigger: {
          trigger: '#testimonials',
          start: `top ${68 - i * 5}%`,
          once: true,
        },
      }
    );
  });

  // When each testimonial card enters, a person specifically waves
  document.querySelectorAll('.testimonial-card').forEach((card, i) => {
    ScrollTrigger.create({
      trigger: card,
      start:   'top 65%',
      once:    true,
      onEnter: () => {
        const person = document.getElementById(`sp-${i + 1}`);
        if (!person) return;
        const arm = person.querySelector('.person-wave-arm');
        if (!arm) return;
        gsap.timeline()
          .to(arm, { rotation: -40, duration: 0.25, ease: 'power2.out' })
          .to(arm, { rotation:   0, duration: 0.25, ease: 'power2.in'  })
          .to(arm, { rotation: -35, duration: 0.2,  ease: 'power2.out' })
          .to(arm, { rotation:   0, duration: 0.2,  ease: 'power2.in'  });
      },
    });
  });


  /* =====================================================
     SCENE 5 — PRICING: The Decision
     Character walks to middle card, recommends it
     ===================================================== */

  const tl5 = gsap.timeline({
    scrollTrigger: {
      trigger: '#pricing',
      start: 'top 70%',
      end:   'top 10%',
      scrub: 1.5,
    },
  });

  tl5
  .to(scenes[4], { opacity: 0,   duration: 0.4 }, 0)
  .to(scenes[5], { opacity: 1,   duration: 0.5 }, 0.12)
  // Knowing nod head tilt
  .to(headGroup, { rotation: -10, y: 0, duration: 0.4 }, 0.05)
  // Right arm loosely "around" the card — diagonal out & slightly down
  .to(armRight,  { rotation: -52, duration: 0.5, ease: 'back.out(2)' }, 0.1)
  .to(armLeft,   { rotation:  14, duration: 0.4 }, 0.1)
  // Arrow appears pointing down
  .to(charArrow, { opacity: 1, duration: 0.5 }, 0.4)
  .to(mouths.smile, { opacity: 1, duration: 0.2 }, 0.1);

  // Tap animation on popular pricing card (3× nod + arm tap)
  ScrollTrigger.create({
    trigger: '#pricing-pro',
    start:   'top 62%',
    once:    true,
    onEnter: () => {
      gsap.timeline({ repeat: 2, repeatDelay: 0.15 })
        .to(armRight,  { rotation: -40, duration: 0.18, ease: 'power2.inOut' })
        .to(armRight,  { rotation: -58, duration: 0.18, ease: 'power2.inOut' })
        .to(headGroup, { y: -6,  duration: 0.18, ease: 'power2.inOut' }, '<')
        .to(headGroup, { y:  0,  duration: 0.18, ease: 'power2.inOut' });
    },
  });


  /* =====================================================
     SCENE 6 — CTA: The Resolution
     Seated again, relaxed, rocket launch, wave + coffee sip
     ===================================================== */

  const tl6 = gsap.timeline({
    scrollTrigger: {
      trigger: '#final-cta',
      start: 'top 70%',
      end:   'top 15%',
      scrub: 1.5,
    },
  });

  tl6
  .to(scenes[5], { opacity: 0,   duration: 0.4 }, 0)
  .to(scenes[6], { opacity: 1,   duration: 0.5 }, 0.1)
  // Sit back down
  .to(charLegs,  { opacity: 0, duration: 0.35 }, 0)
  .to(charDesk,  { opacity: 1, duration: 0.45 }, 0)
  // Relaxed lean: head tilted back, arms loose
  .to(headGroup, { rotation: 12, y: 6,  duration: 0.5 }, 0.1)
  .to(armLeft,   { rotation: -32,       duration: 0.4 }, 0.1)
  .to(armRight,  { rotation:  32,       duration: 0.4 }, 0.1)
  .to(charArrow, { opacity: 0,          duration: 0.3 }, 0)
  .to(mouths.smile, { opacity: 1, duration: 0.3 }, 0.2)
  .to([blushL, blushR], { opacity: 0.38, duration: 0.3 }, 0.25);

  // ── Rocket launch when CTA button enters view ──
  ScrollTrigger.create({
    trigger: '#final-cta-btn',
    start:   'top 68%',
    once:    true,
    onEnter: () => {
      // Rocket appears and launches
      gsap.set(rocket, { opacity: 1 });
      gsap.to(rocket, {
        y: '-82vh',
        scale: 0.35,
        opacity: 0,
        rotation: 10,
        duration: 2.2,
        ease: 'power2.in',
      });

      // Character looks up and waves cheerfully
      gsap.timeline()
        .to(headGroup, { rotation: 25, y: -12, duration: 0.5, ease: 'back.out(2)' })
        // Wave: right arm goes high
        .to(armRight,  { rotation: -145, duration: 0.45, ease: 'back.out(3)' }, 0.3)
        // Wiggle wave
        .to(armRight, {
          rotation: -110,
          duration: 0.22,
          ease: 'power1.inOut',
          repeat: 4,
          yoyo: true,
        }, '>')
        // Expression
        .to(mouths.smile, { opacity: 0, duration: 0.15 }, 0.3)
        .to(mouths.grin,  { opacity: 1, duration: 0.25 }, 0.3)
        .to([blushL, blushR], { opacity: 0.55, duration: 0.3 }, 0.35)
        // Settle back down after wave
        .to(armRight,  { rotation: 32,  duration: 0.6, ease: 'power2.inOut' }, '+=0.3')
        .to(headGroup, { rotation: 12, y: 6, duration: 0.5, ease: 'power2.inOut' }, '<')
        .call(startCoffeeSipLoop);
    },
  });

  // ── Coffee sip loop — contentment ──
  let coffeeSipLoop   = null;
  let coffeeSipKilled = false;

  function startCoffeeSipLoop() {
    if (coffeeSipLoop || coffeeSipKilled) return;
    coffeeSipLoop = gsap.timeline({ repeat: -1, repeatDelay: 2.8 })
      // Bring left arm up with cup
      .to(armLeft,   { rotation: -82, duration: 0.75, ease: 'power2.inOut' })
      // Head tips back to "sip"
      .to(headGroup, { rotation: 20, y: 4, duration: 0.4, ease: 'power2.inOut' }, 0.45)
      // Sigh / settle
      .to(headGroup, { rotation: 12, y: 6, duration: 0.55, ease: 'power2.inOut' }, '>')
      .to(armLeft,   { rotation: -32,       duration: 0.75, ease: 'power2.inOut' }, '<0.15');
  }

  // Kill sip loop when user scrolls away from CTA
  ScrollTrigger.create({
    trigger: '#final-cta',
    start:   'top 70%',
    onLeaveBack: () => {
      if (coffeeSipLoop) {
        coffeeSipLoop.kill();
        coffeeSipLoop   = null;
        coffeeSipKilled = false;
      }
    },
  });


  /* =====================================================
     SCENE BACKGROUND — initial state
     ==================================================== */
  if (scenes[1]) gsap.set(scenes[1], { opacity: 1 });
  [2, 3, 4, 5, 6].forEach(n => { if (scenes[n]) gsap.set(scenes[n], { opacity: 0 }); });

} // end initNarrative

// Start when DOM is parsed; GSAP CDN is deferred so we poll
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNarrative);
} else {
  initNarrative();
}
