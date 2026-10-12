(() => {
  const scene = document.querySelector('.scene-project');
  if (!scene) return;
  const buttons = [...scene.querySelectorAll('[data-scene-target]')];
  const panels = [...scene.querySelectorAll('.scene-panel')];
  const video = scene.querySelector('video');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const wrap = scene.querySelector('.scene-video-wrap');
  const canvas = scene.querySelector('.scene-video-glow');
  const context = canvas.getContext('2d');
  let glowFrame = 0;
  let lastPaint = 0;
  const paintGlow = () => {
    if (context && video.readyState >= 2) context.drawImage(video, 0, 0, canvas.width, canvas.height);
  };
  const stopGlow = () => { cancelAnimationFrame(glowFrame); glowFrame = 0; };
  const tickGlow = now => {
    if (video.paused || video.ended || scene.hidden || document.hidden || reduced.matches) { stopGlow(); return; }
    if (now - lastPaint >= 100) { paintGlow(); lastPaint = now; }
    glowFrame = requestAnimationFrame(tickGlow);
  };
  video.addEventListener('loadedmetadata', () => {
    if (video.videoWidth && video.videoHeight) {
      // 寬高一同受視窗限制，避免只有高度被限制時出現左右填充。
      wrap.style.maxWidth = `${75 * video.videoWidth / video.videoHeight}dvh`;
      canvas.height = Math.max(1, Math.round(canvas.width * video.videoHeight / video.videoWidth));
    }
  });
  video.addEventListener('play', () => { stopGlow(); glowFrame = requestAnimationFrame(tickGlow); });
  ['pause', 'ended'].forEach(event => video.addEventListener(event, () => { stopGlow(); paintGlow(); }));
  ['loadeddata', 'seeked'].forEach(event => video.addEventListener(event, paintGlow));
  let version = 0;
  buttons.forEach(button => button.addEventListener('click', async () => {
    if (button.getAttribute('aria-pressed') === 'true') return;
    const currentVersion = ++version;
    video.pause();
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    const previous = panels.find(panel => !panel.hidden);
    if (previous && !reduced.matches && previous.animate) {
      const opacity = getComputedStyle(previous).opacity;
      previous.getAnimations().forEach(animation => animation.cancel());
      await previous.animate([{ opacity }, { opacity: 0 }], { duration: 220, fill: 'forwards' }).finished.catch(() => {});
    }
    if (currentVersion !== version) return;
    panels.forEach(panel => {
      panel.hidden = panel.id !== button.dataset.sceneTarget;
      panel.getAnimations().forEach(animation => animation.cancel());
      if (!panel.hidden && !reduced.matches && panel.animate) {
        panel.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 1000, easing: 'ease-out' });
      }
    });
  }));
  new MutationObserver(() => { if (scene.hidden) video.pause(); }).observe(scene, { attributes: true, attributeFilter: ['hidden'] });
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
})();
