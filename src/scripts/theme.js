// 在樣式載入前決定主題，減少重新整理時閃過錯誤底色。
(() => {
  const root = document.documentElement;
  // 新版以系統為預設，不沿用之前固定日光時期的儲存值。
  const storageKey = 'yuu-color-theme-v2';
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const validTheme = (value) => value === 'light' || value === 'dark';
  let preference = null;
  let button;
  let transitioning = false;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const announceReady = () => window.dispatchEvent(new CustomEvent('portfolio:theme-ready'));

  async function bloomTheme() {
    if (transitioning) return;
    transitioning = true;
    preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { window.localStorage.setItem(storageKey, preference); } catch { /* 保留本頁選擇。 */ }

    // 舊瀏覽器用柔和漸變；減少動態效果時直接更新。
    if (!document.startViewTransition || reducedMotion.matches) {
      if (!reducedMotion.matches) root.classList.add('theme-fade');
      applyTheme();
      if (!reducedMotion.matches) await new Promise((resolve) => setTimeout(resolve, 650));
      root.classList.remove('theme-fade');
      transitioning = false;
      announceReady();
      return;
    }

    const bounds = button.getBoundingClientRect();
    const x = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;
    // 最後讓不透明區覆蓋最遠角落，避免動畫結束時邊緣跳色。
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) / 0.7;
    root.style.setProperty('--bloom-x', `${x}px`);
    root.style.setProperty('--bloom-y', `${y}px`);
    root.style.setProperty('--bloom-radius', `${radius}px`);
    root.style.setProperty('--bloom-diameter', `${radius * 2}px`);
    root.classList.add('theme-bloom');
    try {
      const transition = document.startViewTransition(applyTheme);
      await transition.finished;
    } catch {
      // 分頁切換等情況可能取消畫面快照，主題仍需正常更新。
      applyTheme();
    } finally {
      root.classList.remove('theme-bloom');
      transitioning = false;
      announceReady();
    }
  }

  try {
    const saved = window.localStorage.getItem(storageKey);
    if (validTheme(saved)) preference = saved;
  } catch { /* 私密瀏覽或儲存受限時，仍可在本頁切換。 */ }

  function applyTheme() {
    const theme = preference || (systemTheme.matches ? 'dark' : 'light');
    const changed = root.dataset.theme !== theme;
    root.dataset.theme = theme;
    if (changed) window.dispatchEvent(new CustomEvent('portfolio:theme-change', { detail: { theme } }));
    if (!button) return;
    const dark = theme === 'dark';
    button.setAttribute('aria-pressed', String(dark));
    button.title = dark ? '切換為淺色模式' : '切換為深色模式';
    button.querySelector('[data-theme-icon]').textContent = dark ? '☀' : '☾';
    button.querySelector('[data-theme-label]').textContent = dark ? '日光' : '夜色';
  }

  applyTheme();
  systemTheme.addEventListener('change', () => {
    if (preference) return;
    applyTheme();
    announceReady();
  });
  window.addEventListener('storage', (event) => {
    if (event.key !== storageKey && event.key !== null) return;
    preference = validTheme(event.newValue) ? event.newValue : null;
    applyTheme();
    announceReady();
  });

  document.addEventListener('DOMContentLoaded', () => {
    button = document.querySelector('.theme-toggle');
    if (!button) return;
    applyTheme();
    button.hidden = false;
    button.addEventListener('click', bloomTheme);
  });
})();
