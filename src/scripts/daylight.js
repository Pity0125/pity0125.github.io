(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const daylight = document.createElement('div');
  daylight.className = 'daylight';
  daylight.setAttribute('aria-hidden', 'true');
  const atmosphere = document.createElement('span');
  atmosphere.className = 'sun-atmosphere';
  daylight.append(atmosphere);
  // 同一雲隙透出的扇形光束，外層負責捲動、內層負責展開。
  [[18, 16, 0.5], [32, 25, 0.65], [48, 13, 0.45], [61, 22, 0.4]].forEach(([angle, width, brightness], i) => {
    const plane = document.createElement('span');
    plane.className = 'sunray-plane';
    for (const [key, value] of Object.entries({ angle: `${angle}deg`, width: `${width}vw`, brightness, delay: `${i * 130}ms`, depth: 0.3 + i * 0.15 })) plane.style.setProperty(`--ray-${key}`, String(value));
    const ray = document.createElement('span');
    ray.className = 'sunray';
    plane.append(ray);
    daylight.append(plane);
  });
  const clouds = document.createElement('span');
  clouds.className = 'sun-clouds';
  daylight.append(clouds);
  document.body.prepend(daylight);
  let frame = 0;
  const isLight = () => root.dataset.theme === 'light';
  const updateScroll = () => {
    frame = 0;
    const range = Math.max(1, root.scrollHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, window.scrollY / range));
    daylight.style.setProperty('--day-scroll', `${reduced.matches ? 0 : progress * 100}px`);
  };
  const queueScroll = () => {
    if (!isLight() || reduced.matches || frame) return;
    frame = window.requestAnimationFrame(updateScroll);
  };
  const arrive = () => {
    if (!isLight()) return;
    updateScroll();
    daylight.classList.add('is-arrived');
  };
  window.addEventListener('portfolio:theme-change', () => {
    daylight.classList.remove('is-arrived');
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
  });
  window.addEventListener('portfolio:theme-ready', arrive);
  window.addEventListener('scroll', queueScroll, { passive: true });
  window.addEventListener('resize', queueScroll, { passive: true });
  reduced.addEventListener('change', updateScroll);
  if (isLight()) arrive();
})();

