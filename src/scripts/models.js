(() => {
  const dialog = document.querySelector('.model-dialog');
  if (!dialog) return;
  const viewer = dialog.querySelector('.model-viewer');
  const link = dialog.querySelector('.model-original');
  const hint = dialog.querySelector('.model-viewer-hint');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let trigger;
  let closing = false;
  let loadTimer;
  const open = (button) => {
    if (dialog.open || closing) return;
    trigger = button;
    const name = button.dataset.modelName;
    dialog.querySelector('#model-dialog-title').textContent = name;
    viewer.replaceChildren();
    viewer.style.removeProperty('--preview-image');
    if (button.dataset.modelId) {
      const id = button.dataset.modelId;
      if (!/^[a-f0-9]{32}$/.test(id)) return;
      const frame = document.createElement('iframe');
      frame.title = `${name} — 可旋轉的 3D 模型`;
      frame.allow = 'autoplay; fullscreen; xr-spatial-tracking';
      frame.allowFullscreen = true;
      frame.src = `https://sketchfab.com/models/${id}/embed?autostart=1`;
      hint.textContent = '正在載入 3D… 載入後可拖曳旋轉、捲動縮放。';
      loadTimer = setTimeout(() => {
        hint.textContent = '若預覽未顯示，可使用下方連結在 Sketchfab 開啟。';
      }, 15000);
      frame.addEventListener('load', () => {
        clearTimeout(loadTimer);
        hint.textContent = '拖曳旋轉 · 捲動縮放｜若無法顯示，請在 Sketchfab 開啟。';
      }, { once: true });
      viewer.append(frame);
      link.href = button.dataset.modelLink;
      link.textContent = '在 Sketchfab 開啟 ↗';
    } else {
      const img = document.createElement('img');
      img.src = button.dataset.modelImage;
      img.alt = `${name} ${button.dataset.previewKind || '模型'}作品`;
      viewer.append(img);
      viewer.style.setProperty('--preview-image', `url("${new URL(img.src, document.baseURI).href}")`);
      hint.textContent = `${button.dataset.previewKind || '模型'}作品 · 圖片檢視`;
      link.href = img.src;
      link.textContent = '開啟完整尺寸圖片 ↗';
    }
    dialog.showModal();
    document.documentElement.classList.add('gallery-open');
  };
  const close = async () => {
    if (closing || !dialog.open) return;
    closing = true;
    if (!reduced.matches) {
      dialog.classList.add('is-closing');
      await Promise.all(dialog.getAnimations().map(a => a.finished.catch(() => {})));
    }
    dialog.close();
  };
  document.querySelectorAll('[data-model-id], [data-model-image]').forEach(button => button.addEventListener('click', () => open(button)));
  dialog.querySelector('.model-close').addEventListener('click', close);
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) close();
  });
  dialog.addEventListener('close', () => {
    clearTimeout(loadTimer);
    viewer.replaceChildren(); // 移除 iframe，停止背景渲染與網路載入。
    dialog.classList.remove('is-closing');
    document.documentElement.classList.remove('gallery-open');
    closing = false;
    trigger?.focus({ preventScroll: true });
  });
})();
