(() => {
  'use strict';

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------------- Mobile nav ---------------- */
  const toggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
  }

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    mobileMenu.classList.toggle('open', !isOpen);
  });

  mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMenu();
      toggle.focus();
    }
  });

  /* ---------------- Active nav link on scroll ---------------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((section) => navObserver.observe(section));

  /* ---------------- Scroll reveal ---------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion) {
    revealEls.forEach((el) => el.classList.add('in-view'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---------------- Lightbox ---------------- */
  const galleries = {
    skyrelay: [
      { src: 'images/skyrelay-schematic.png', caption: 'SkyRelay — PCB schematic (KiCad)' },
      { src: 'images/skyrelay-pcb-layout.png', caption: 'SkyRelay — PCB layout (routing)' },
    ],
    drone: [
      { src: 'images/drone-full.jpg', caption: 'Autonomous Mail-Retrieval Drone — full assembly' },
      { src: 'images/drone-cad-1.png', caption: 'Autonomous Mail-Retrieval Drone — CAD model' },
      { src: 'images/drone-cad-2.png', caption: 'Autonomous Mail-Retrieval Drone — CAD detail' },
      { src: 'images/drone-gripper-test.png', caption: 'Autonomous Mail-Retrieval Drone — gripper test' },
    ],
    asl: [{ src: 'images/asl-terminal.png', caption: 'Edge-AI Sign Language Translator — terminal output' }],
    xchange: [{ src: 'images/xchange-app.png', caption: 'XChange — app screenshot' }],
    pihole: [{ src: 'images/pihole-dashboard.png', caption: 'Pi-hole dashboard — network-wide blocking stats' }],
    lerobot: [
      { src: 'images/lerobot-training-viz-2.jpg', caption: 'LeRobot SO101 — dataset visualization, pick-and-place task' },
    ],
  };

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const btnClose = document.getElementById('lightbox-close');
  const btnPrev = document.getElementById('lightbox-prev');
  const btnNext = document.getElementById('lightbox-next');

  let currentGroup = null;
  let currentIndex = 0;
  let lastFocused = null;

  function renderLightbox() {
    const group = galleries[currentGroup];
    const item = group[currentIndex];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.caption;
    lightboxCaption.textContent = `${item.caption} — ${currentIndex + 1} / ${group.length}`;
    const multi = group.length > 1;
    btnPrev.style.display = multi ? 'grid' : 'none';
    btnNext.style.display = multi ? 'grid' : 'none';
  }

  function openLightbox(group, index, trigger) {
    currentGroup = group;
    currentIndex = index;
    lastFocused = trigger;
    renderLightbox();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxImg.src = '';
    if (lastFocused) lastFocused.focus();
  }

  function step(delta) {
    const group = galleries[currentGroup];
    currentIndex = (currentIndex + delta + group.length) % group.length;
    renderLightbox();
  }

  document.querySelectorAll('[data-lightbox-group]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const group = btn.getAttribute('data-lightbox-group');
      const index = parseInt(btn.getAttribute('data-lightbox-index'), 10) || 0;
      openLightbox(group, index, btn);
    });
  });

  btnClose.addEventListener('click', closeLightbox);
  btnPrev.addEventListener('click', () => step(-1));
  btnNext.addEventListener('click', () => step(1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'Tab') {
      const focusables = [btnPrev, btnNext, btnClose].filter((el) => el.style.display !== 'none');
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
})();
