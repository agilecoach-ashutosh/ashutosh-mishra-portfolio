(() => {
  const html = document.documentElement;
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.theme-toggle');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const stored = localStorage.getItem('portfolio-theme');
  if (stored === 'light' || stored === 'dark') html.dataset.theme = stored;

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
  if (heroCanvas) new FlowField(heroCanvas, { count: 84, spread: 670, depth: 900, speed: .00125, maxLink: 142, alpha: .72, camera: 820 });
  const connectCanvas = document.querySelector('#connect-canvas');
  if (connectCanvas) new FlowField(connectCanvas, { count: 48, spread: 520, depth: 700, speed: -.0012, maxLink: 132, alpha: .5, camera: 650, hueA:[94,230,208], hueB:[115,140,255] });
})();
