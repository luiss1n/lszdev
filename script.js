(() => {
  const progress = document.querySelector('.reading-progress');
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  };
  addEventListener('scroll', updateProgress, { passive: true });
  addEventListener('resize', updateProgress);
  updateProgress();

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.navigation');
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('open', open);
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
    }
  });

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) revealItems.forEach(item => item.classList.add('is-visible'));
  else {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  }

  const canvas = document.querySelector('.particles');
  const ctx = canvas.getContext('2d');
  const touch = matchMedia('(pointer: coarse)').matches;
  const points = [];
  let width = 0, height = 0, frame = 0, dpr = 1;
  const pointer = { x: -1000, y: -1000 };
  const resize = () => {
    width = innerWidth; height = innerHeight; dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(touch ? 42 : 85, Math.floor(width * height / (touch ? 18000 : 11000)));
    points.length = 0;
    for (let i = 0; i < count; i++) {
      const x = Math.random() * width, y = Math.random() * height;
      points.push({ x, y, bx:x, by:y, vx:0, vy:0, phase:Math.random()*Math.PI*2, size:1+Math.random()*1.1 });
    }
  };
  addEventListener('resize', resize, { passive: true });
  if (!touch) addEventListener('pointermove', event => { pointer.x = event.clientX; pointer.y = event.clientY; }, { passive:true });
  addEventListener('pointerleave', () => { pointer.x = pointer.y = -1000; });
  resize();
  const draw = time => {
    ctx.clearRect(0, 0, width, height);
    points.forEach(p => {
      if (!touch) {
        const dx=p.x-pointer.x, dy=p.y-pointer.y, d=Math.hypot(dx,dy), radius=145;
        if (d < radius && d > 0) { const force=(radius-d)/radius*.85; p.vx += dx/d*force; p.vy += dy/d*force; }
        p.vx += (p.bx-p.x)*.012; p.vy += (p.by-p.y)*.012;
        p.vx *= .91; p.vy *= .91; p.x += p.vx; p.y += p.vy;
      } else { p.x=p.bx+Math.sin(time*.00025+p.phase)*2; p.y=p.by+Math.cos(time*.0002+p.phase)*2; }
    });
    for (let i=0;i<points.length;i++) for (let j=i+1;j<points.length;j++) {
      const a=points[i],b=points[j],d=Math.hypot(a.x-b.x,a.y-b.y);
      if(d<125){ctx.strokeStyle=`rgba(255,45,58,${(1-d/125)*.22})`;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    }
    points.forEach(p=>{ctx.fillStyle=`rgba(255,55,68,${.72+Math.sin(time*.001+p.phase)*.22})`;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();});
    frame=requestAnimationFrame(draw);
  };
  if (!reduced) frame=requestAnimationFrame(draw);
})();
