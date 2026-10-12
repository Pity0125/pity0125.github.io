(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sky = document.createElement('div');
  sky.className = 'night-sky';
  sky.setAttribute('aria-hidden', 'true');
  // 固定分布避免捲動時跳位，低亮度讓內容保持清楚。
  const stars = [
    [5, 20, 150, 0.45, 0.7], [82, 12, 190, 0.5, 0.4],
    [12, 68, 120, 0.35, 1], [91, 63, 160, 0.4, 0.8],
    [52, 41, 130, 0.22, 0.35], [32, 8, 110, 0.25, 0.6],
    [68, 83, 180, 0.3, 0.9], [37, 91, 100, 0.25, 0.5],
  ];
  stars.forEach(([x, y, length, brightness, depth], i) => {
    const plane = document.createElement('span');
    plane.className = 'meteor-plane';
    for (const [key, value] of Object.entries({ x: `${x}%`, y: `${y}%`, length: `${length}px`, brightness, depth, delay: `${i * 45}ms` })) {
      plane.style.setProperty(`--${key}`, String(value));
    }
    const meteor = document.createElement('span');
    meteor.className = 'meteor';
    plane.append(meteor);
    sky.append(plane);
  });
  document.body.prepend(sky);
  let frame = 0;
  const isDark = () => root.dataset.theme === 'dark';
  const updateScroll = () => {
    frame = 0;
    const range = Math.max(1, root.scrollHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, window.scrollY / range));
    sky.style.setProperty('--sky-scroll', `${reduced.matches ? 0 : progress * 160}px`);
  };
  const queueScroll = () => {
    if (!isDark() || reduced.matches || frame) return;
    frame = window.requestAnimationFrame(updateScroll);
  };
  const arrive = () => {
    if (!isDark()) return;
    updateScroll();
    sky.classList.add('is-arrived');
  };
  window.addEventListener('portfolio:theme-change', () => {
    sky.classList.remove('is-arrived');
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
  });
  // 等 1.5 秒主題暈開完成再滑入，避免進場被畫面快照吃掉。
  window.addEventListener('portfolio:theme-ready', arrive);
  window.addEventListener('scroll', queueScroll, { passive: true });
  window.addEventListener('resize', queueScroll, { passive: true });
  reduced.addEventListener('change', () => { updateScroll(); });
  if (isDark()) arrive();
})();
