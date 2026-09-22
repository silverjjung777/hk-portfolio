(() => {
  const finePointer = window.matchMedia('(pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!finePointer.matches || reducedMotion.matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'leaf-cursor-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) { canvas.remove(); return; }

  const shape = [
    '.....1.....',
    '..1.121.1..',
    '..1222221..',
    '.122332221.',
    '12233332221',
    '.123333321.',
    '..1233321..',
    '.122333221.',
    '1..12321..1',
    '....141....',
    '.....4.....',
    '.....4.....',
  ];
  const colors = { 1: '#8d2f23', 2: '#c74d27', 3: '#e99036', 4: '#6d4831' };
  const particles = [];
  let x = -100, y = -100, lastX = -100, lastY = -100;
  let visible = false, lastSpawn = 0, frame = 0;

  function resize() {
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * scale);
    canvas.height = Math.round(window.innerHeight * scale);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.imageSmoothingEnabled = false;
  }

  function drawLeaf(cx, cy, size, rotation, alpha = 1) {
    context.save();
    context.translate(Math.round(cx), Math.round(cy));
    context.rotate(rotation);
    context.globalAlpha = alpha;
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        const color = colors[shape[row][col]];
        if (color) {
          context.fillStyle = color;
          context.fillRect(Math.round((col - 5) * size), Math.round((row - 5) * size), Math.ceil(size), Math.ceil(size));
        }
      }
    }
    context.restore();
  }

  function animate() {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= .985;
      p.vy += .035;
      p.rotation += p.spin;
      p.life -= .018;
      if (p.life <= 0) particles.splice(i, 1);
      else drawLeaf(p.x, p.y, p.size, p.rotation, p.life * .78);
    }
    if (visible) drawLeaf(x + 8, y + 8, 2.5, -.18);
    frame = requestAnimationFrame(animate);
  }

  function move(event) {
    x = event.clientX;
    y = event.clientY;
    if (!visible) { lastX = x; lastY = y; visible = true; }
    const distance = Math.hypot(x - lastX, y - lastY);
    const now = performance.now();
    if (distance > 5 && now - lastSpawn > 24) {
      particles.push({ x: lastX + 8, y: lastY + 8, vx: (Math.random() - .5) * 1.5, vy: -.35 - Math.random() * .8, rotation: Math.random() * 2, spin: (Math.random() - .5) * .045, size: .7 + Math.random() * .5, life: 1 });
      if (particles.length > 24) particles.shift();
      lastSpawn = now;
    }
    lastX = x;
    lastY = y;
  }

  resize();
  document.documentElement.classList.add('custom-leaf-cursor');
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerleave', () => { visible = false; });
  animate();

  const stop = () => {
    cancelAnimationFrame(frame);
    canvas.remove();
    document.documentElement.classList.remove('custom-leaf-cursor');
  };
  reducedMotion.addEventListener('change', event => { if (event.matches) stop(); else location.reload(); });
})();
