# 素材與檔案管理

## 命名方式

網站檔案使用小寫英文與連字號，例如 `project-cover.webp`、`profile-photo.webp`。
每件作品有自己的資料夾，例如 `public/assets/projects/project-slug/`，放入 `cover.webp`、`detail-01.webp`、`detail-02.webp`。

原始檔保留在 `source-materials/`；調整尺寸、壓縮後的版本才放進 `public/`。
避免用 `final-final-2` 命名；原始素材版本可用日期，例如 `2026-10-10-project-name.fig`。

## 素材登記

在 `content/asset-register.csv` 記錄檔案路徑、用途、來源、授權與是否可公開。自製素材也記下作者；公司或客戶作品先確認可展示範圍。

## 發布範圍

`public/` 中只放可公開的內容，不放原始履歷編輯檔、未授權素材或私密資訊。
未來打包發布只取 `index.html`、`src/`、`public/`。`docs/`、`content/`、`source-materials/` 不直接發布。
