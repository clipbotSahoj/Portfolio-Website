(() => {
  'use strict';

  document.getElementById('year').textContent = new Date().getFullYear();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* ---------------- Hero circuit background ---------------- */
  function initHeroCircuit() {
    const canvas = document.getElementById('hero-circuit');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');

    const COLORS = { copper: '224, 138, 60', signal: '79, 184, 255' };

    let width = 0;
    let height = 0;
    let dpr = 1;
    let traces = [];
    let mouse = { x: -9999, y: -9999 };
    let rafId = null;
    let running = false;
    let startTime = null;
    let staticFrameQueued = false;

    function pathLength(points) {
      let len = 0;
      for (let i = 1; i < points.length; i++) {
        len += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
      }
      return len;
    }

    function pointAtT(points, t) {
      const total = pathLength(points);
      let target = total * t;
      for (let i = 1; i < points.length; i++) {
        const segLen = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
        if (target <= segLen || i === points.length - 1) {
          const ratio = segLen === 0 ? 0 : target / segLen;
          return {
            x: points[i - 1].x + (points[i].x - points[i - 1].x) * ratio,
            y: points[i - 1].y + (points[i].y - points[i - 1].y) * ratio,
          };
        }
        target -= segLen;
      }
      return points[points.length - 1];
    }

    function distToSegment(px, py, x1, y1, x2, y2) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const lenSq = dx * dx + dy * dy;
      let t = lenSq === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));
      const cx = x1 + t * dx;
      const cy = y1 + t * dy;
      return Math.hypot(px - cx, py - cy);
    }

    function minDistToPolyline(points, px, py) {
      let min = Infinity;
      for (let i = 1; i < points.length; i++) {
        const d = distToSegment(px, py, points[i - 1].x, points[i - 1].y, points[i].x, points[i].y);
        if (d < min) min = d;
      }
      return min;
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      generateTraces();
      if (reduceMotion) queueStaticFrame();
    }

    function generateTraces() {
      traces = [];
      const cellW = Math.max(70, width / Math.max(6, Math.round(width / 110)));
      const cellH = Math.max(60, height / Math.max(4, Math.round(height / 90)));
      const count = Math.min(17, Math.max(9, Math.round((width * height) / 42000)));

      for (let i = 0; i < count; i++) {
        let x = Math.round((Math.random() * width) / cellW) * cellW;
        let y = Math.round((Math.random() * height) / cellH) * cellH;
        const points = [{ x, y }];
        const steps = 3 + Math.floor(Math.random() * 4);
        let horizontal = Math.random() < 0.5;
        for (let s = 0; s < steps; s++) {
          if (horizontal) {
            x += (Math.random() < 0.5 ? -1 : 1) * cellW * (1 + Math.floor(Math.random() * 2));
          } else {
            y += (Math.random() < 0.5 ? -1 : 1) * cellH * (1 + Math.floor(Math.random() * 2));
          }
          x = Math.max(0, Math.min(width, x));
          y = Math.max(0, Math.min(height, y));
          points.push({ x, y });
          horizontal = !horizontal;
        }
        traces.push({
          points,
          color: Math.random() < 0.62 ? 'copper' : 'signal',
          delay: Math.random() * 850,
          drawDur: 1000 + Math.random() * 900,
          pulse: Math.random() < 0.4,
          pulseOffset: Math.random(),
          pulseSpeed: 0.00011 + Math.random() * 0.00013,
        });
      }
    }

    function render(elapsed) {
      ctx.clearRect(0, 0, width, height);

      traces.forEach((tr) => {
        const total = pathLength(tr.points);
        const drawT = reduceMotion ? 1 : Math.max(0, Math.min(1, (elapsed - tr.delay) / tr.drawDur));
        if (drawT <= 0) return;

        const dist = minDistToPolyline(tr.points, mouse.x, mouse.y);
        const glow = Math.max(0, 1 - dist / 160);
        const baseAlpha = 0.18 + glow * 0.55;

        ctx.beginPath();
        let drawn = total * drawT;
        ctx.moveTo(tr.points[0].x, tr.points[0].y);
        for (let i = 1; i < tr.points.length; i++) {
          const segLen = Math.hypot(tr.points[i].x - tr.points[i - 1].x, tr.points[i].y - tr.points[i - 1].y);
          if (drawn >= segLen) {
            ctx.lineTo(tr.points[i].x, tr.points[i].y);
            drawn -= segLen;
          } else if (drawn > 0) {
            const ratio = segLen === 0 ? 0 : drawn / segLen;
            ctx.lineTo(
              tr.points[i - 1].x + (tr.points[i].x - tr.points[i - 1].x) * ratio,
              tr.points[i - 1].y + (tr.points[i].y - tr.points[i - 1].y) * ratio
            );
            drawn = -1;
          }
        }
        ctx.strokeStyle = `rgba(${COLORS[tr.color]}, ${baseAlpha})`;
        ctx.lineWidth = 1.2 + glow * 0.9;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke();

        let seen = 0;
        tr.points.forEach((p, idx) => {
          if (idx === 0) return;
          seen += Math.hypot(p.x - tr.points[idx - 1].x, p.y - tr.points[idx - 1].y);
          if (seen <= total * drawT + 0.5) {
            const vd = Math.hypot(mouse.x - p.x, mouse.y - p.y);
            const vGlow = Math.max(0, 1 - vd / 120);
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.5 + vGlow * 1.6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${COLORS[tr.color]}, ${0.3 + vGlow * 0.55})`;
            ctx.fill();
          }
        });

        if (tr.pulse && !reduceMotion && drawT >= 1) {
          const t = ((elapsed * tr.pulseSpeed) + tr.pulseOffset) % 1;
          const p = pointAtT(tr.points, t);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${COLORS[tr.color]}, 0.95)`;
          ctx.shadowColor = `rgba(${COLORS[tr.color]}, 0.85)`;
          ctx.shadowBlur = 9;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
    }

    function loop(now) {
      if (!startTime) startTime = now;
      render(now - startTime);
      if (running) rafId = requestAnimationFrame(loop);
    }

    function queueStaticFrame() {
      if (staticFrameQueued) return;
      staticFrameQueued = true;
      requestAnimationFrame(() => {
        staticFrameQueued = false;
        render(0);
      });
    }

    function start() {
      if (reduceMotion || running) return;
      running = true;
      startTime = null;
      rafId = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    }

    function isInViewport(el) {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      if (reduceMotion) queueStaticFrame();
    });
    canvas.addEventListener('mouseleave', () => {
      mouse.x = -9999;
      mouse.y = -9999;
      if (reduceMotion) queueStaticFrame();
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) start();
          else stop();
        });
      },
      { threshold: 0.05 }
    );
    io.observe(canvas);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (!reduceMotion && isInViewport(canvas)) start();
    });

    resize();
    if (reduceMotion) queueStaticFrame();
  }

  initHeroCircuit();

  /* ---------------- Starfield backdrop ---------------- */
  function initStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');

    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars = [];
    let shootingStars = [];
    let rafId = null;
    let running = false;
    let lastSpawn = 0;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      generateStars();
    }

    function generateStars() {
      const count = Math.min(220, Math.max(90, Math.round((width * height) / 9000)));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.3 + 0.3,
        baseAlpha: Math.random() * 0.5 + 0.25,
        twinkleSpeed: 0.0004 + Math.random() * 0.0009,
        twinkleOffset: Math.random() * Math.PI * 2,
      }));
    }

    function spawnShootingStar() {
      const x = Math.random() * width * 0.7 + width * 0.15;
      const y = Math.random() * height * 0.35;
      const angle = (35 + Math.random() * 15) * (Math.PI / 180);
      shootingStars.push({
        x, y,
        vx: Math.cos(angle) * 9,
        vy: Math.sin(angle) * 9,
        life: 0,
        maxLife: 40 + Math.random() * 20,
      });
    }

    function render(now) {
      ctx.clearRect(0, 0, width, height);

      stars.forEach((s) => {
        const tw = reduceMotion ? 0 : Math.sin(now * s.twinkleSpeed + s.twinkleOffset) * 0.35;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 237, 243, ${Math.max(0, Math.min(1, s.baseAlpha + tw))})`;
        ctx.fill();
      });

      if (!reduceMotion) {
        shootingStars = shootingStars.filter((s) => s.life < s.maxLife);
        shootingStars.forEach((s) => {
          s.x += s.vx;
          s.y += s.vy;
          s.life += 1;
          const alpha = 1 - s.life / s.maxLife;
          const tailX = s.x - s.vx * 6;
          const tailY = s.y - s.vy * 6;
          const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
          grad.addColorStop(0, 'rgba(79, 184, 255, 0)');
          grad.addColorStop(1, `rgba(232, 237, 243, ${alpha})`);
          ctx.beginPath();
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.4;
          ctx.lineCap = 'round';
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(s.x, s.y);
          ctx.stroke();
        });

        if (now - lastSpawn > 3500 + Math.random() * 3500 && shootingStars.length < 2) {
          lastSpawn = now;
          spawnShootingStar();
        }
      }
    }

    function loop(now) {
      render(now);
      if (running) rafId = requestAnimationFrame(loop);
    }

    function start() {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (!reduceMotion) start();
    });

    resize();
    if (reduceMotion) render(0);
    else start();
  }

  /* ---------------- Scroll progress ---------------- */
  function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    let ticking = false;
    function update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  /* ---------------- Cursor glow ---------------- */
  function initCursorGlow() {
    const glow = document.getElementById('cursor-glow');
    if (!glow || reduceMotion || window.matchMedia('(hover: none)').matches) return;
    let active = false;
    document.addEventListener('mousemove', (e) => {
      glow.style.setProperty('--x', `${e.clientX}px`);
      glow.style.setProperty('--y', `${e.clientY}px`);
      if (!active) {
        active = true;
        glow.classList.add('active');
      }
    }, { passive: true });
    document.addEventListener('mouseleave', () => {
      active = false;
      glow.classList.remove('active');
    });
  }

  /* ---------------- Stat counters ---------------- */
  function initStatCounters() {
    const nums = document.querySelectorAll('.stat-num');
    if (!nums.length) return;

    function animateCount(el) {
      const target = parseInt(el.getAttribute('data-target'), 10) || 0;
      if (reduceMotion) {
        el.textContent = String(target);
        return;
      }
      const duration = 1100;
      const start = performance.now();
      function tick(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = String(Math.round(target * eased));
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    nums.forEach((el) => observer.observe(el));
  }

  /* ---------------- Featured project tilt ---------------- */
  function initFeatureTilt() {
    const card = document.querySelector('.bento-feature');
    if (!card || reduceMotion || window.matchMedia('(hover: none)').matches) return;

    function onMove(e) {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `translateY(-4px) perspective(900px) rotateX(${(-py * 3).toFixed(2)}deg) rotateY(${(px * 3).toFixed(2)}deg)`;
    }

    function onLeave() {
      card.style.transform = '';
    }

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
  }

  initStarfield();
  initScrollProgress();
  initCursorGlow();
  initStatCounters();
  initFeatureTilt();
})();
