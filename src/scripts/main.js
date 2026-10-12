// 共用頁面行為。作品內容與正式互動將在確認需求後加入。
document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

// 完成或開始操作後永久結束導覽進場，不隨焦點移出而重播。
const header = document.querySelector('.site-header');
if (header) {
  const settleHeader = () => header.classList.add('is-settled');
  header.addEventListener('focusin', settleHeader, { once: true });
  header.addEventListener('pointerdown', settleHeader, { once: true });
  header.addEventListener('animationend', (event) => {
    if (event.animationName === 'header-item-arrive' && event.target.matches('.theme-toggle')) settleHeader();
  });
}
