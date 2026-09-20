(() => {
  const html = document.documentElement;
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.theme-toggle');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const stored = localStorage.getItem('portfolio-theme');
  if (stored === 'light' || stored === 'dark') html.dataset.theme = stored;

  // Round 2 hero refinement: make the first 10 seconds clearer for recruiters,
  // keep the visual drama, and strengthen the interactive system field.
  const heroEyebrow = document.querySelector('.hero .eyebrow');
  const heroTitle = document.querySelector('.hero h1');
  const heroMeta = document.querySelector('.hero-meta');
  if (heroEyebrow) {
    heroEyebrow.innerHTML = '<span class="status-dot"></span> Enterprise Transformation & Delivery Leader';
  }
  if (heroTitle) {
    heroTitle.innerHTML = '<span class="headline-line">From complexity</span><span class="headline-line gradient-text">to flow.</span>';
  }
  if (heroMeta) {
    heroMeta.innerHTML = '<span>Flow</span><i></i><span>DevOps</span><i></i><span>ICF-ACC</span><i></i><span>Pune, India</span>';
  }

  const round2Styles = document.createElement('style');
  round2Styles.dataset.round2 = 'hero';
  round2Styles.textContent = `
    .hero { padding-top: 124px; padding-bottom: 54px; }
    .hero-grid { grid-template-columns: 1.12fr .88fr; gap: 46px; }
    .hero-copy { min-width: 0; }
    .hero .eyebrow { margin-bottom: 18px; font-size: 11px; }
    .hero h1 { font-size: clamp(66px, 6.7vw, 104px); line-height: .91; letter-spacing: -.06em; }
    .headline-line { display: block; white-space: nowrap; }
    .hero-lede { margin-top: 28px; max-width: 640px; font-size: clamp(21px, 2.05vw, 30px); }
    .hero-support { max-width: 610px; font-size: 14px; }
    .hero-actions { margin-top: 27px; }
    .hero-meta { margin-top: 23px; font-size: 10px; }
    #flow-canvas { opacity: .86; filter: saturate(1.15); }
    .hero-glow-one { opacity: .23; right: 2%; top: 9%; }
    .hero-visual { min-height: 555px; }
    .portrait-frame { width: min(430px, 88%); transform: perspective(1200px) rotateY(-4deg) rotateX(1.5deg); }
    .portrait-frame img { aspect-ratio: 1 / 1.08; }
    .orbit-a { width: 535px; height: 535px; }
    .orbit-b { width: 445px; height: 445px; }
    .tag-one { left: -18px; top: 34%; }
    .tag-two { right: -14px; bottom: 16%; }
    .floating-tag { box-shadow: 0 22px 70px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.035); }
    @media (max-width: 1180px) and (min-width: 1051px) {
      .hero-grid { grid-template-columns: 1.08fr .92fr; gap: 34px; }
      .hero h1 { font-size: clamp(64px, 6.55vw, 86px); }
      .portrait-frame { width: min(400px, 90%); }
      .hero-visual { min-height: 520px; }
      .orbit-a { width: 490px; height: 490px; }
      .orbit-b { width: 410px; height: 410px; }
    }
    @media (max-width: 1050px) {
      .hero { padding-top: 124px; }
      .hero-grid { grid-template-columns: 1fr; gap: 28px; }
      .hero h1 { font-size: clamp(64px, 11vw, 96px); }
      .hero-visual { min-height: 520px; }
      .portrait-frame { width: min(500px, 78%); }
    }
    @media (max-width: 780px) {
      .hero { padding-top: 102px; }
      .hero h1 { font-size: clamp(52px, 14.5vw, 78px); }
      .headline-line { white-space: normal; }
      .hero-lede { margin-top: 22px; font-size: 21px; }
      .hero-support { font-size: 13px; }
      .hero-meta { flex-wrap: wrap; row-gap: 7px; }
      .hero-visual { min-height: 440px; }
      .portrait-frame { width: 88%; }
      .tag-one { left: 0; top: 28%; }
      .tag-two { right: 0; bottom: 12%; }
    }
    @media (max-width: 480px) {
      .hero h1 { font-size: clamp(50px, 15vw, 68px); }
      .hero-visual { min-height: 390px; }
      .portrait-frame { width: 95%; }
    }
  `;
  document.head.appendChild(round2Styles);

  toggle?.addEventListener('click', () => {
    const next = html.dataset.theme === 'light' ? 'dark' : 'light';
    html.dataset.theme = next;
    localStorage.setItem('portfolio-theme', next);
  });

  navToggle?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  navLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }));

  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.querySelector('#year').textContent = new Date().getFullYear();

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.13, rootMargin: '0px 0px -40px' });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  class FlowField {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.points = [];
      this.pointer = { x: 0, y: 0 };
      this.rotation = 0;
      this.options = {
        count: options.count || 70,
        spread: options.spread || 500,
        depth: options.depth || 700,
        speed: options.speed || 0.0015,
        maxLink: options.maxLink || 155,
        alpha: options.alpha || 0.65,
        camera: options.camera || 700,
        hueA: options.hueA || [94, 230, 208],
        hueB: options.hueB || [244, 189, 99]
      };
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(canvas);
      this.seed();
      this.bind();
      this.resize();
      this.frame = this.frame.bind(this);
      requestAnimationFrame(this.frame);
    }
    seed() {
      for (let i = 0; i < this.options.count; i++) {
        this.points.push({
          x: (Math.random() - .5) * this.options.spread * 1.7,
          y: (Math.random() - .5) * this.options.spread,
          z: (Math.random() - .5) * this.options.depth,
          r: Math.random() * 1.8 + .55,
          tone: Math.random()
        });
      }
    }
    bind() {
      const target = this.canvas.closest('.hero') || this.canvas;
      target.addEventListener('pointermove', e => {
        const rect = target.getBoundingClientRect();
        this.pointer.x = ((e.clientX - rect.left) / rect.width - .5) * 2;
        this.pointer.y = ((e.clientY - rect.top) / rect.height - .5) * 2;
      }, { passive: true });
      target.addEventListener('pointerleave', () => { this.pointer.x = 0; this.pointer.y = 0; }, { passive: true });
    }
    resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.w = rect.width;
      this.h = rect.height;
    }
    project(p) {
      const cos = Math.cos(this.rotation + this.pointer.x * .08);
      const sin = Math.sin(this.rotation + this.pointer.x * .08);
      const x = p.x * cos - p.z * sin;
      const z = p.x * sin + p.z * cos;
      const y = p.y + this.pointer.y * 28;
      const scale = this.options.camera / (this.options.camera + z + this.options.depth * .65);
      return { x: this.w * .61 + x * scale, y: this.h * .48 + y * scale, z, scale, tone:p.tone, r:p.r };
    }
    frame() {
      const ctx = this.ctx;
      ctx.clearRect(0,0,this.w,this.h);
      this.rotation += this.options.speed;
      const projected = this.points.map(p => this.project(p));
      for (let i = 0; i < projected.length; i++) {
        const a = projected[i];
        for (let j = i + 1; j < projected.length; j++) {
          const b = projected[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx,dy);
          if (d < this.options.maxLink) {
            const fade = (1 - d / this.options.maxLink) * .12 * this.options.alpha;
            ctx.strokeStyle = `rgba(${this.options.hueA.join(',')},${fade})`;
            ctx.lineWidth = .7;
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
          }
        }
      }
      projected.sort((a,b) => b.z - a.z).forEach(p => {
        const c = p.tone > .86 ? this.options.hueB : this.options.hueA;
        const alpha = Math.max(.12, Math.min(.72, (.9 - (p.z + this.options.depth/2) / this.options.depth) * .75)) * this.options.alpha;
        ctx.fillStyle = `rgba(${c.join(',')},${alpha})`;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r * p.scale,0,Math.PI*2); ctx.fill();
        if (p.r > 1.7) {
          ctx.strokeStyle = `rgba(${c.join(',')},${alpha*.22})`;
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r * p.scale + 5,0,Math.PI*2); ctx.stroke();
        }
      });
      requestAnimationFrame(this.frame);
    }
  }

  const heroCanvas = document.querySelector('#flow-canvas');
  if (heroCanvas) new FlowField(heroCanvas, { count: 96, spread: 700, depth: 930, speed: .00135, maxLink: 158, alpha: .92, camera: 830 });
  const connectCanvas = document.querySelector('#connect-canvas');
  if (connectCanvas) new FlowField(connectCanvas, { count: 48, spread: 520, depth: 700, speed: -.0012, maxLink: 132, alpha: .5, camera: 650, hueA:[94,230,208], hueB:[115,140,255] });
})();
