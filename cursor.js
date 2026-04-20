/* =====================================================
   FLOWRA — Focus Field Cursor System  (Phase 1)
   Spec coverage: §1 Focus Field · §8 Performance · §9 Mobile

   Architecture:
   • Three independently-lerped layers (dot / ring / field)
     — each at a different speed — create the inertia feel
   • Focus overlay is an oversized (200vw × 200vh) fixed div
     with a radial-gradient mask punched out at its centre.
     Moving it via transform (GPU composited) keeps the
     transparent "spotlight" aligned to the field cursor
     without ever touching the mask-image again after init.
   • All motion uses transform / opacity only → 60fps.
   • Mobile / touch: cursor system skipped entirely;
     tap ripple injected instead.
   ===================================================== */

'use strict';

(function FocusCursor() {

  /* ═══════════════════════════════════════════════════
     DETECTION — exit early on touch / reduced motion
     ═══════════════════════════════════════════════════ */
  const IS_TOUCH   = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  const IS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (IS_TOUCH)   { initTapFeedback(); return; }
  if (IS_REDUCED) return;

  /* ═══════════════════════════════════════════════════
     LERP CONFIG — tweak to adjust inertia feel
     ═══════════════════════════════════════════════════ */
  const CFG = {
    dotLerp:   0.88,   // near-instant (precise)
    ringLerp:  0.28,   // medium — faster than before
    fieldLerp: 0.15,   // inertia feel, spec: 0.12-0.18
    focusR:    260,    // spotlight radius in px
    overlayDim: 0.18,  // max dimming outside focus (0–1)
    speedScale: 0.04,  // ring opacity boost per px/frame of speed
    speedCap:   0.30,  // max additional ring opacity from speed
  };

  /* ═══════════════════════════════════════════════════
     INJECT STYLES — self-contained, no external CSS file
     ═══════════════════════════════════════════════════ */
  const STYLE = document.createElement('style');
  STYLE.textContent = `

    /* ── Kill default cursor sitewide ── */
    *, *::before, *::after { cursor: none !important; }

    /* ── Cursor dot — fast, precise, gold ── */
    .fc-dot {
      position: fixed;
      top: 0; left: 0;
      width: 6px; height: 6px;
      border-radius: 50%;
      background: rgba(245, 166, 35, 0.95);
      box-shadow: 0 0 8px rgba(245, 166, 35, 0.55);
      pointer-events: none;
      z-index: 100000;
      will-change: transform;
      transition: width 0.2s ease, height 0.2s ease,
                  background 0.2s ease, box-shadow 0.2s ease;
    }
    .fc-dot.is-hover {
      width: 10px; height: 10px;
      background: rgba(108, 99, 255, 0.95);
      box-shadow: 0 0 16px rgba(108, 99, 255, 0.7);
    }

    /* ── Cursor ring — medium inertia, indigo ── */
    .fc-ring {
      position: fixed;
      top: 0; left: 0;
      width: 36px; height: 36px;
      border-radius: 50%;
      border: 1.5px solid rgba(108, 99, 255, 0.50);
      pointer-events: none;
      z-index: 99999;
      will-change: transform;
      transition: width 0.3s ease, height 0.3s ease,
                  border-color 0.3s ease;
    }
    .fc-ring.is-hover {
      width: 52px; height: 52px;
      border-color: rgba(245, 166, 35, 0.45);
    }

    /* ── Spotlight glow — slowest layer, ambient ── */
    .fc-spotlight {
      position: fixed;
      top: 0; left: 0;
      width: 380px; height: 380px;
      border-radius: 50%;
      background: radial-gradient(
        circle,
        rgba(108, 99, 255, 0.050) 0%,
        rgba(245, 166, 35, 0.022) 42%,
        transparent 70%
      );
      pointer-events: none;
      z-index: 9995;
      will-change: transform;
    }

    /* ── Focus overlay — dims content outside focus radius ──
       Oversized so translated edges never expose a gap.
       The mask hole lives at the element's own 50% 50%,
       so translating the element moves the hole with it.      */
    .fc-overlay {
      position: fixed;
      top: -50vh;
      left: -50vw;
      width: 200vw;
      height: 200vh;
      background: rgba(8, 8, 16, ${CFG.overlayDim});
      -webkit-mask-image: radial-gradient(
        circle ${CFG.focusR}px at 50% 50%,
        transparent  0%,
        transparent 48%,
        rgba(0,0,0,0.45) 68%,
        rgba(0,0,0,0.88) 100%
      );
      mask-image: radial-gradient(
        circle ${CFG.focusR}px at 50% 50%,
        transparent  0%,
        transparent 48%,
        rgba(0,0,0,0.45) 68%,
        rgba(0,0,0,0.88) 100%
      );
      pointer-events: none;
      z-index: 9990;
      will-change: transform;
    }

    /* ── Click pulse ring — spawned, then removed ── */
    .fc-pulse {
      position: fixed;
      top: 0; left: 0;
      width: 36px; height: 36px;
      border-radius: 50%;
      border: 1.5px solid rgba(108, 99, 255, 0.6);
      pointer-events: none;
      z-index: 99998;
      will-change: transform, opacity;
    }

    /* ── MOBILE: tap ripple ── */
    @keyframes fc-tap {
      from { transform: scale(0); opacity: 0.55; }
      to   { transform: scale(3); opacity: 0;    }
    }
    .fc-tap {
      position: fixed;
      width: 56px; height: 56px;
      margin-left: -28px; margin-top: -28px;
      border-radius: 50%;
      background: radial-gradient(
        circle,
        rgba(108, 99, 255, 0.38) 0%,
        transparent 70%
      );
      pointer-events: none;
      z-index: 99999;
      animation: fc-tap 0.62s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
  `;
  document.head.appendChild(STYLE);

  /* ═══════════════════════════════════════════════════
     CREATE ELEMENTS
     ═══════════════════════════════════════════════════ */
  function mkEl(cls) {
    const el = document.createElement('div');
    el.className = cls;
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('role', 'presentation');
    return el;
  }

  const overlay   = mkEl('fc-overlay');
  const spotlight = mkEl('fc-spotlight');
  const ring      = mkEl('fc-ring');
  const dot       = mkEl('fc-dot');

  // Insert in visual order (overlay first = deepest z)
  document.body.append(overlay, spotlight, ring, dot);

  // Start invisible; fade in on first mouse move
  [overlay, spotlight, ring, dot].forEach(el => { el.style.opacity = '0'; });

  /* ═══════════════════════════════════════════════════
     STATE
     ═══════════════════════════════════════════════════ */
  let mx = window.innerWidth  * 0.5;   // raw mouse X
  let my = window.innerHeight * 0.5;   // raw mouse Y

  let dx = mx, dy = my;   // dot position  (fast)
  let rx = mx, ry = my;   // ring position (medium)
  let fx = mx, fy = my;   // field position (slow — focus field)

  let alive = false;       // has cursor entered the window?

  // Velocity tracking for speed-based response (§5)
  let prevFx = fx, prevFy = fy;  // field position last frame
  let speed  = 0;                 // pixels moved this frame

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

  /* ═══════════════════════════════════════════════════
     CURSOR TRACKING
     ═══════════════════════════════════════════════════ */
  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;

    if (!alive) {
      // Snap all layers on first appearance so there's no
      // "slide in from the centre" artifact.
      dx = rx = fx = mx;
      dy = ry = fy = my;
      alive = true;
      [overlay, spotlight, ring, dot].forEach(el => {
        el.style.transition = 'opacity 0.25s ease';
        el.style.opacity = '1';
        // Remove transition property after it completes so
        // it doesn't slow down RAF-driven opacity snaps.
        setTimeout(() => { el.style.transition = ''; }, 280);
      });
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    alive = false;
    [overlay, spotlight, ring, dot].forEach(el => { el.style.opacity = '0'; });
  });

  document.addEventListener('mouseenter', () => {
    if (alive) return;
    alive = true;
    [overlay, spotlight, ring, dot].forEach(el => { el.style.opacity = '1'; });
  });

  /* ═══════════════════════════════════════════════════
     HOVER STATE — dot + ring react to interactive els
     ═══════════════════════════════════════════════════ */
  const HOVER_SEL = [
    'a', 'button', '[role="button"]',
    '.btn-primary', '.btn-ghost',
    '.glass-card', '.pricing-card',
    'input', 'select', 'textarea', 'label',
  ].join(',');

  document.querySelectorAll(HOVER_SEL).forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.classList.add('is-hover');
      ring.classList.add('is-hover');
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('is-hover');
      ring.classList.remove('is-hover');
    });
  });

  /* ═══════════════════════════════════════════════════
     CLICK PULSE — ephemeral ring that expands & fades
     ═══════════════════════════════════════════════════ */
  document.addEventListener('click', () => {
    if (!alive || typeof gsap === 'undefined') return;

    const pulse = mkEl('fc-pulse');
    document.body.appendChild(pulse);

    gsap.fromTo(pulse,
      { x: rx, y: ry, xPercent: -50, yPercent: -50, scale: 1,   opacity: 0.65 },
      { scale: 2.6, opacity: 0, duration: 0.35, ease: 'power2.out',
        onComplete: () => pulse.remove() }
    );
  });

  /* ═══════════════════════════════════════════════════
     RAF LOOP — 60fps, GPU-only transforms
     ═══════════════════════════════════════════════════ */
  const VW2 = window.innerWidth  * 0.5;  // viewport centre X
  const VH2 = window.innerHeight * 0.5;  // viewport centre Y

  function tick() {
    // Interpolate each layer at its own speed
    dx = lerp(dx, mx, CFG.dotLerp);
    dy = lerp(dy, my, CFG.dotLerp);

    rx = lerp(rx, mx, CFG.ringLerp);
    ry = lerp(ry, my, CFG.ringLerp);

    fx = lerp(fx, mx, CFG.fieldLerp);
    fy = lerp(fy, my, CFG.fieldLerp);

    // ── Speed-based response (§5) ──────────────────
    // Measure how far the field layer moved this frame
    const dFx = fx - prevFx;
    const dFy = fy - prevFy;
    speed = Math.sqrt(dFx * dFx + dFy * dFy);
    prevFx = fx; prevFy = fy;

    // Boost ring border opacity slightly when moving fast
    // (subtle, capped — avoids jitter)
    const speedBoost = clamp(speed * CFG.speedScale, 0, CFG.speedCap);
    const ringOpacity = clamp(0.50 + speedBoost, 0.50, 0.80);
    ring.style.borderColor = `rgba(108, 99, 255, ${ringOpacity})`;

    // ── Apply GPU-composited transforms ───────────
    dot.style.transform       = `translate(${dx}px,${dy}px) translate(-50%,-50%)`;
    ring.style.transform      = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    spotlight.style.transform = `translate(${fx}px,${fy}px) translate(-50%,-50%)`;

    // ── Overlay — normalised translation (§3) ─────
    // Keeping offset as (fx − viewportCentre) ensures the same
    // physical cursor position produces the same response at
    // any screen resolution (-1…1 normalised internally).
    overlay.style.transform  = `translate(${fx - VW2}px,${fy - VH2}px)`;

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);

  /* ═══════════════════════════════════════════════════
     MOBILE — TAP FEEDBACK (runs instead of cursor system)
     ═══════════════════════════════════════════════════ */
  function initTapFeedback() {
    // Inject keyframe for tap ripple
    const s = document.createElement('style');
    s.textContent = `
      @keyframes fc-tap {
        from { transform: scale(0); opacity: 0.55; }
        to   { transform: scale(3); opacity: 0;    }
      }
      .fc-tap {
        position: fixed;
        width: 56px; height: 56px;
        margin-left: -28px; margin-top: -28px;
        border-radius: 50%;
        background: radial-gradient(
          circle, rgba(108,99,255,0.4) 0%, transparent 70%
        );
        pointer-events: none;
        z-index: 99999;
        animation: fc-tap 0.62s cubic-bezier(0.22,1,0.36,1) forwards;
      }
    `;
    document.head.appendChild(s);

    // Spawn a ripple on every touch contact point
    document.addEventListener('touchstart', (e) => {
      Array.from(e.changedTouches).forEach(t => {
        const ripple = document.createElement('div');
        ripple.className  = 'fc-tap';
        ripple.style.left = t.clientX + 'px';
        ripple.style.top  = t.clientY + 'px';
        document.body.appendChild(ripple);
        // Clean up after animation ends
        setTimeout(() => ripple.remove(), 680);
      });
    }, { passive: true });
  }

})();
