// 後續 JavaScript 動畫統一由此管理；啟動前檢查此設定。
window.portfolioMotion = {
  get reduced() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
};
