(() => {
  const gallery = document.querySelector('.project-gallery');
  if (!gallery) return;
  const carousel = gallery.querySelector('.gallery-carousel');
  const dialog = document.querySelector('.gallery-dialog');
  const dialogImage = dialog.querySelector('.dialog-image');
  const imageArea = dialog.querySelector('.dialog-image-area');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let closing = false;
  async function closePreview() {
    if (closing || !dialog.open) return;
    closing = true;
    if (!reducedMotion.matches) {
      dialog.classList.add('is-closing');
      await Promise.all(dialog.getAnimations().map((animation) => animation.finished.catch(() => {})));
    }
    dialog.close();
  }
  const total = 10;
  let index = 0;
  let suppressClickUntil = 0;
  const path = (i) => `./public/assets/projects/pccs-layout/page-${String(i + 1).padStart(2, '0')}.png`;
  const cards = Array.from({ length: total }, (_, i) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'gallery-card';
    const image = document.createElement('img');
    image.src = path(i);
    image.alt = `日本色研 PCCS 排版，第 ${i + 1} 張`;
    image.width = 1754;
    image.height = 1240;
    image.loading = 'lazy';
    image.draggable = false;
    card.append(image);
    card.addEventListener('click', () => {
      if (Date.now() < suppressClickUntil) return;
      if (i === index) {
        if (closing) return;
        dialog.showModal();
        document.documentElement.classList.add('gallery-open');
      } else show(i);
    });
    return card;
  });
  carousel.replaceChildren(...cards);
  function show(next) {
    index = (next + total) % total;
    cards.forEach((card, i) => {
      let distance = (i - index + total) % total;
      if (distance > total / 2) distance -= total;
      card.dataset.position = String(Math.max(-2, Math.min(2, distance)));
      const visible = Math.abs(distance) <= 1;
      card.inert = !visible;
      card.setAttribute('aria-hidden', String(!visible));
      card.setAttribute('aria-label', distance === 0 ? `放大檢視 PCCS 排版第 ${i + 1} 張` : `${distance < 0 ? '上一張' : '下一張'}：PCCS 第 ${i + 1} 張`);
    });
    const status = `${String(index + 1).padStart(2, '0')} / ${total}`;
    gallery.querySelector('.gallery-status').textContent = status;
    dialog.querySelector('.dialog-status').textContent = status;
    dialogImage.src = path(index);
    imageArea.style.setProperty('--preview-image', `url("${new URL(path(index), document.baseURI).href}")`);
    dialogImage.alt = `日本色研 PCCS 排版，第 ${index + 1} 張`;
    dialog.querySelector('.gallery-original').href = path(index);
  }
  dialog.querySelector('.dialog-close').addEventListener('click', closePreview);
  dialog.addEventListener('cancel', (event) => { event.preventDefault(); closePreview(); });
  dialog.addEventListener('close', () => {
    closing = false;
    dialog.classList.remove('is-closing');
    document.documentElement.classList.remove('gallery-open');
    cards[index].focus({ preventScroll: true });
  });
  dialog.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) closePreview();
  });
  [carousel, dialogImage].forEach((surface) => {
    let start;
    surface.addEventListener('touchstart', (event) => {
      start = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
    }, { passive: true });
    surface.addEventListener('touchcancel', () => { start = null; }, { passive: true });
    surface.addEventListener('touchend', (event) => {
      if (!start) return;
      const dx = event.changedTouches[0].clientX - start.x;
      const dy = event.changedTouches[0].clientY - start.y;
      start = null;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      suppressClickUntil = Date.now() + 450;
      show(index + (dx < 0 ? 1 : -1));
    }, { passive: true });
  });
  show(0);
})();
