(() => {
  const audio = new Audio('assets/autumn-letters.wav');
  audio.loop = true;
  audio.preload = 'none';
  audio.volume = .35;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'music-toggle';
  button.setAttribute('aria-label', '가을 음악 재생');
  button.setAttribute('aria-pressed', 'false');
  button.innerHTML = '<span class="music-symbol" aria-hidden="true">♫</span><span class="music-label">가을 음악 켜기</span>';
  document.body.appendChild(button);

  function sync() {
    const playing = !audio.paused;
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? '가을 음악 정지' : '가을 음악 재생');
    button.querySelector('.music-label').textContent = playing ? '가을 음악 끄기' : '가을 음악 켜기';
  }

  button.addEventListener('click', async () => {
    if (audio.paused) {
      try { await audio.play(); }
      catch { button.querySelector('.music-label').textContent = '재생할 수 없어요'; }
    } else audio.pause();
    sync();
  });
  audio.addEventListener('play', sync);
  audio.addEventListener('pause', sync);
})();
