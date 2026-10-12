(() => {
  const scene = document.querySelector('.scene-project');
  if (!scene) return;
  const buttons = [...scene.querySelectorAll('[data-scene-target]')];
  const panels = [...scene.querySelectorAll('.scene-panel')];
  const video = scene.querySelector('.scene-video');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (video && /^https?:$/.test(location.protocol)) {
    const source = new URL(video.src);
    source.searchParams.set('origin', location.origin);
    video.src = source.href;
  }
  const pauseVideo = () => {
    video?.contentWindow?.postMessage(JSON.stringify({
      event: 'command', func: 'pauseVideo', args: []
    }), 'https://www.youtube.com');
  };
  let version = 0;
  buttons.forEach(button => button.addEventListener('click', async () => {
    if (button.getAttribute('aria-pressed') === 'true') return;
    const currentVersion = ++version;
    pauseVideo();
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
  new MutationObserver(() => { if (scene.hidden) pauseVideo(); }).observe(scene, { attributes: true, attributeFilter: ['hidden'] });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseVideo(); });
})();

