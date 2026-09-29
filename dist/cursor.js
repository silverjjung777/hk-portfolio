(() => {
  const finePointer = window.matchMedia('(pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!finePointer.matches || reducedMotion.matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'wand-cursor-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) { canvas.remove(); return; }

  const wand = [
    '..1...1.......',
    '...1.1........',
    '.1112111......',
    '...222........',
    '..12221.......',
    '.1.121.1......',
    '....2.........',
    '.....2........',
    '......2.......',
    '.......2......',
    '........3.....',
    '.........3....',
    '..........3...',
    '...........3..'
  ];
  const wandColors = { 1: '#ffffff', 2: '#f4f4f4', 3: '#cfcfcf' };
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

  function drawWand(cx, cy, size = 2) {
    context.save();
    context.translate(Math.round(cx - 7), Math.round(cy - 7));
    context.shadowColor = '#ffffff';
    context.shadowBlur = 7;
    for (let row = 0; row < wand.length; row++) {
      for (let col = 0; col < wand[row].length; col++) {
        if (!wandColors[wand[row][col]]) continue;
        context.fillStyle = '#080808';
        context.fillRect(col * size - 1, row * size - 1, size + 2, size + 2);
      }
    }
    context.shadowBlur = 0;
    for (let row = 0; row < wand.length; row++) {
      for (let col = 0; col < wand[row].length; col++) {
        const color = wandColors[wand[row][col]];
        if (!color) continue;
        context.fillStyle = color;
        context.fillRect(col * size, row * size, size, size);
      }
    }
    context.restore();
  }

  function drawSparkle(p) {
    const size = Math.max(1, Math.round(p.size));
    context.save();
    context.globalAlpha = Math.max(0, p.life);
    context.fillStyle = p.warm ? '#ff3b30' : '#ffffff';
    context.shadowColor = context.fillStyle;
    context.shadowBlur = 6;
    context.fillRect(Math.round(p.x - size * 2), Math.round(p.y), size * 5, size);
    context.fillRect(Math.round(p.x), Math.round(p.y - size * 2), size, size * 5);
    context.restore();
  }

  function animate() {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= .97;
      p.vy += .012;
      p.life -= .035;
      if (p.life <= 0) particles.splice(i, 1);
      else drawSparkle(p);
    }
    if (visible) drawWand(x, y);
    frame = requestAnimationFrame(animate);
  }

  function move(event) {
    x = event.clientX;
    y = event.clientY;
    if (!visible) { lastX = x; lastY = y; visible = true; }
    const distance = Math.hypot(x - lastX, y - lastY);
    const now = performance.now();
    if (distance > 4 && now - lastSpawn > 18) {
      particles.push({
        x: x - 3 + (Math.random() - .5) * 10,
        y: y + 8 + (Math.random() - .5) * 10,
        vx: -.35 - Math.random() * 1.2,
        vy: (Math.random() - .5) * .9,
        size: Math.random() > .72 ? 2 : 1,
        warm: Math.random() > .84,
        life: 1
      });
      if (particles.length > 30) particles.shift();
      lastSpawn = now;
    }
    lastX = x;
    lastY = y;
  }

  resize();
  document.documentElement.classList.add('custom-wand-cursor');
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerleave', () => { visible = false; });
  animate();

  const stop = () => {
    cancelAnimationFrame(frame);
    canvas.remove();
    document.documentElement.classList.remove('custom-wand-cursor');
  };
  reducedMotion.addEventListener('change', (event) => { if (event.matches) stop(); else location.reload(); });
})();