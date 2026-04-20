/* =====================================================
   FLOWRA — JavaScript (static, no animations)
   Navbar · Hamburger · Pricing Toggle · Ripple ·
   Card Hover Tilt · Logo Hover · Nav Highlight
   ===================================================== */

'use strict';


// ====================================================
// 1. NAVBAR SCROLL EFFECT
// ====================================================

(function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();


// ====================================================
// 2. HAMBURGER MOBILE MENU
// ====================================================

(function initHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('nav-links');
  if (!btn) return;
  let open = false;

  btn.addEventListener('click', () => {
    open = !open;
    if (open) {
      Object.assign(links.style, {
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: '70px', left: '0', right: '0',
        background: 'rgba(8,8,16,0.97)', backdropFilter: 'blur(24px)',
        padding: '24px', gap: '20px', zIndex: '99',
        borderBottom: '1px solid rgba(108,99,255,0.2)',
      });
      btn.children[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      btn.children[1].style.opacity   = '0';
      btn.children[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      links.style.display = 'none';
      btn.children[0].style.transform = '';
      btn.children[1].style.opacity   = '';
      btn.children[2].style.transform = '';
    }
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => { if (open) btn.click(); });
  });
})();


// ====================================================
// 3. PRICING TOGGLE
// ====================================================

(function initPricingToggle() {
  const toggle = document.getElementById('billing-toggle');
  if (!toggle) return;

  const amounts = document.querySelectorAll('.price-amount');

  toggle.addEventListener('change', () => {
    const isAnnual = toggle.checked;
    amounts.forEach(el => {
      const monthly = el.dataset.monthly;
      const annual  = el.dataset.annual;
      if (monthly === undefined || annual === undefined) return;
      el.textContent = isAnnual ? annual : monthly;
    });
  });
})();


// ====================================================
// 4. BUTTON RIPPLE EFFECT
// ====================================================

(function initRipple() {
  const style = document.createElement('style');
  style.textContent = '@keyframes rippleAnim { to { transform: scale(4); opacity: 0; } }';
  document.head.appendChild(style);

  document.querySelectorAll('.btn-primary, .btn-ghost').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:absolute;border-radius:50%;background:rgba(255,255,255,0.22);
        transform:scale(0);animation:rippleAnim 0.6s linear;pointer-events:none;
        width:100px;height:100px;left:${x-50}px;top:${y-50}px;z-index:10;
      `;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });
})();


// ====================================================
// 5. CARD TILT — handled by GSAP in animations.js
// ====================================================
// (removed — animations.js initCardInteraction() manages
//  all 3D tilt, cursor glow and shine with GSAP)



// ====================================================
// 6. ACTIVE NAV LINK HIGHLIGHT
// ====================================================

(function initNavHighlight() {
  const navMap = {
    'features':     document.getElementById('nav-features'),
    'how-it-works': document.getElementById('nav-how'),
    'testimonials': document.getElementById('nav-testimonials'),
    'pricing':      document.getElementById('nav-pricing'),
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = navMap[entry.target.id];
      if (!link) return;
      if (entry.isIntersecting) {
        Object.values(navMap).forEach(l => { if (l) l.style.color = ''; });
        link.style.color = 'var(--indigo-light)';
      }
    });
  }, { threshold: 0.4 });

  Object.keys(navMap).forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
})();


// ====================================================
// 7. LOGO BAR HOVER — gold shimmer
// ====================================================

(function initLogos() {
  document.querySelectorAll('.logo-item').forEach(logo => {
    logo.addEventListener('mouseover', () => {
      logo.style.color = 'rgba(245,166,35,0.8)';
    });
    logo.addEventListener('mouseout', () => {
      logo.style.color = '';
    });
  });
})();
