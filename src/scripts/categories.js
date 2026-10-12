(() => {
  const section = document.querySelector('.categories');
  if (!section) return;
  const list = section.querySelector('.category-list');
  const buttons = [...section.querySelectorAll('[data-filter]')];
  const projects = [...document.querySelectorAll('[data-category]')];
  const status = document.querySelector('.filter-status');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animateResult = (element, delay = 0) => {
    if (typeof element.animate !== 'function') return;
    element.style.opacity = '0';
    element.getAnimations().forEach((animation) => animation.cancel());
    if (reduced.matches) { element.style.removeProperty('opacity'); return; }
    const animation = element.animate([
      { opacity: 0, transform: 'translateY(16px)', offset: 0 },
      { opacity: 0.15, transform: 'translateY(12px)', offset: 0.3 },
      { opacity: 0.55, transform: 'translateY(5px)', offset: 0.65 },
      { opacity: 1, transform: 'translateY(0)', offset: 1 },
    ], { duration: 1400, delay, easing: 'linear', fill: 'both' });
    animation.pause();
    animation.currentTime = 0;
    element.style.removeProperty('opacity');
    return animation;
  };
  let resultFrame = 0;
  let pendingResults = [];
  const playAfterScroll = () => {
    if (!pendingResults.length) return;
    const started = performance.now();
    let lastY = window.scrollY;
    let stableSince = started;
    const check = (now) => {
      if (Math.abs(window.scrollY - lastY) > 0.5) stableSince = now;
      lastY = window.scrollY;
      // 等平滑捲動停穩，再播放；也涵蓋頁尾無法完全對齊的情況。
      if ((now - started >= 200 && now - stableSince >= 140) || now - started >= 2500) {
        resultFrame = 0;
        pendingResults.forEach((animation) => {
          if (reduced.matches) animation.cancel();
          else animation.play();
        });
        pendingResults = [];
        return;
      }
      resultFrame = requestAnimationFrame(check);
    };
    resultFrame = requestAnimationFrame(check);
  };
  const labels = { all: '全部', layout: '編排', app: 'App', photography: '攝影', game: '遊戲', model: '模型', scene: '3D 場景', film: '影片' };
  let selectionVersion = 0;
  buttons.forEach((button) => button.addEventListener('click', async () => {
    const version = ++selectionVersion;
    cancelAnimationFrame(resultFrame);
    resultFrame = 0;
    pendingResults = [];
    const category = button.dataset.filter;
    buttons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    // 先保留當下透明度，再淡出；快速切換時不會取消動畫後閃回全亮。
    const exits = [status, ...projects].filter((element) => !element.hidden).map((element) => {
      if (typeof element.animate !== 'function') return Promise.resolve();
      const opacity = getComputedStyle(element).opacity;
      element.style.opacity = opacity;
      element.getAnimations().forEach((animation) => animation.cancel());
      if (reduced.matches) return Promise.resolve();
      const exit = element.animate([{ opacity }, { opacity: 0 }], { duration: 180, easing: 'ease-out', fill: 'forwards' });
      return exit.finished.catch(() => {});
    });
    await Promise.all(exits);
    if (version !== selectionVersion) return;
    let count = 0;
    projects.forEach((project) => {
      const visible = category === 'all' || project.dataset.category.split(' ').includes(category);
      project.hidden = !visible;
      if (visible) {
        const animation = animateResult(project, count * 90);
        if (animation) pendingResults.push(animation);
        count++;
      }
      else if (typeof project.getAnimations === 'function') {
        project.getAnimations().forEach((animation) => animation.cancel());
        project.style.removeProperty('opacity');
      }
    });
    status.hidden = false;
    status.textContent = count ? `${labels[category]}作品 · ${count} 件` : `${labels[category]}作品整理中，完成後會在這裡展示。`;
    const statusAnimation = animateResult(status);
    if (statusAnimation) pendingResults.push(statusAnimation);
    document.querySelector('#work')?.scrollIntoView({
      behavior: reduced.matches ? 'instant' : 'smooth',
      block: 'start',
    });
    playAfterScroll();
  }));
  // 繩尾與紙籤孔位共用座標，紙籤的轉動稍微落後於軟繩。
  const chimes = [...list.querySelectorAll('.category-tag')].map((element, index) => {
    const cord = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    cord.setAttribute('class', 'category-cord');
    cord.setAttribute('viewBox', '0 0 100 100');
    cord.setAttribute('preserveAspectRatio', 'none');
    cord.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('vector-effect', 'non-scaling-stroke');
    cord.append(path);
    element.prepend(cord);
    element.classList.add('has-soft-cord');
    return { element, paper: element.querySelector('.category-paper'), path, index,
      length: 75, angle: 0, velocity: 0, paperAngle: 0, paperVelocity: 0 };
  });
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  let windFrame = 0;
  let lastFrame = 0;
  let pointer = null;
  let inView = true;
  const measureCords = () => chimes.forEach((chime) => {
    chime.length = parseFloat(getComputedStyle(chime.element).getPropertyValue('--cord')) + 17;
  });
  const renderChime = (chime) => {
    const x = -Math.sin(chime.angle * Math.PI / 180) * chime.length * 0.8;
    const lift = chime.length - Math.sqrt(chime.length ** 2 - x ** 2);
    const endY = 100 - lift / chime.length * 100;
    const bend = clamp(-chime.velocity * 0.42, -16, 16);
    chime.path.setAttribute('d', `M 50 0 C ${50 + x * 0.2 + bend} 32, ${50 + x * 0.8 - bend * 0.45} ${endY * 0.76}, ${50 + x} ${endY}`);
    chime.paper.style.transform = `translate(${x.toFixed(3)}px, ${(-lift).toFixed(3)}px) rotate(${chime.paperAngle.toFixed(3)}deg)`;
  };
  const stopWind = () => {
    cancelAnimationFrame(windFrame);
    windFrame = 0;
    lastFrame = 0;
    pointer = null;
  };
  const settleWind = () => {
    stopWind();
    chimes.forEach((chime) => {
      chime.angle = chime.velocity = chime.paperAngle = chime.paperVelocity = 0;
      renderChime(chime);
    });
  };
  const drift = (now) => {
    const elapsed = lastFrame ? Math.min((now - lastFrame) / 1000, 0.05) : 1 / 60;
    lastFrame = now;
    const steps = Math.max(1, Math.ceil(elapsed / (1 / 120)));
    const dt = elapsed / steps;
    chimes.forEach((chime) => {
      const breeze = Math.sin(now / (1100 + chime.index * 83) + chime.index * 1.7) * 4;
      for (let step = 0; step < steps; step++) {
        chime.velocity += (18 * (breeze - chime.angle) - 2.6 * chime.velocity) * dt;
        chime.angle = clamp(chime.angle + chime.velocity * dt, -18, 18);
        chime.paperVelocity += (28 * (chime.angle * 0.85 - chime.paperAngle) - 4 * chime.paperVelocity) * dt;
        chime.paperAngle = clamp(chime.paperAngle + chime.paperVelocity * dt, -20, 20);
      }
      renderChime(chime);
    });
    windFrame = requestAnimationFrame(drift);
  };
  const startWind = () => {
    if (!windFrame && !reduced.matches && !document.hidden && inView) windFrame = requestAnimationFrame(drift);
  };
  measureCords();
  chimes.forEach(renderChime);
  window.addEventListener('resize', measureCords, { passive: true });
  list.addEventListener('pointermove', (event) => {
    if (reduced.matches || event.pointerType !== 'mouse') return;
    const previous = pointer;
    pointer = { x: event.clientX, y: event.clientY, time: event.timeStamp };
    if (!previous || event.timeStamp - previous.time > 120) return;
    const dx = event.clientX - previous.x;
    const dy = event.clientY - previous.y;
    if (Math.abs(dx) + Math.abs(dy) < 1) return;
    chimes.forEach((chime) => {
      const rect = chime.element.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const reach = rect.width / 2 + 45;
      const proximity = Math.max(0, 1 - Math.abs(event.clientX - center) / reach);
      if (!proximity || event.clientY < rect.top || event.clientY > rect.bottom + 20) return;
      const leverage = clamp((event.clientY - rect.top) / rect.height, 0.2, 1);
      // 正向旋轉會使紙籤向左，因此水平推力取反號。
      const push = -dx * 0.65 + dy * (event.clientX - center) / reach * 0.2;
      chime.velocity = clamp(chime.velocity + clamp(push, -24, 24) * proximity * leverage, -65, 65);
    });
    startWind();
  }, { passive: true });
  list.addEventListener('pointerleave', () => { pointer = null; });
  reduced.addEventListener('change', (event) => { if (event.matches) settleWind(); else startWind(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopWind(); else startWind(); });
  if ('IntersectionObserver' in window) {
    const windObserver = new IntersectionObserver((entries) => {
      inView = entries.some((entry) => entry.isIntersecting);
      if (inView) startWind(); else stopWind();
    }, { rootMargin: '80px' });
    windObserver.observe(list);
  }
  startWind();
  if (reduced.matches || !('IntersectionObserver' in window)) return;
  let entranceStarted = false;
  let entranceFinished = false;
  const finishEntrance = () => {
    entranceFinished = true;
    list.classList.remove('is-waiting', 'is-revealed');
    observer.disconnect();
  };
  const reveal = () => {
    if (entranceStarted || entranceFinished) return;
    entranceStarted = true;
    list.classList.remove('is-waiting');
    list.classList.add('is-revealed');
  };
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      reveal();
      observer.disconnect();
    }
  }, { rootMargin: '0px 0px 64px 0px', threshold: 0.1 });
  list.classList.add('is-waiting');
  observer.observe(list);
  // 焦點進入時永久結束進場，失焦不會重新套用動畫。
  section.addEventListener('focusin', finishEntrance, { once: true });
  list.addEventListener('animationend', (event) => {
    if (event.animationName === 'category-drop' && event.target === list.lastElementChild) finishEntrance();
  });
  reduced.addEventListener('change', (event) => {
    if (event.matches) finishEntrance();
  });
})();
