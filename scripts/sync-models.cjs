// 從模型清單更新展示卡片；原始素材只讀，網站副本集中於 public。
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const models = JSON.parse(fs.readFileSync(path.join(root, 'content/projects/models.json'), 'utf8'));
const dest = path.join(root, 'public/assets/projects/model-collection');
fs.mkdirSync(dest, { recursive: true });
const escape = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cards = models.map((model, i) => {
  fs.copyFileSync(path.join(root, 'source-materials/projects/model-collection/images', model.file), path.join(dest, model.file));
  const src = `./public/assets/projects/model-collection/${model.file}`;
  const thumb = src.replace(/\.png$/, '-thumb.jpg');
  return `<article class="model-card" data-category="model" aria-labelledby="model-title-${i}">
            <button class="model-image-button" type="button" data-model-image="${src}" data-model-name="${escape(model.name)}" aria-label="放大檢視 ${escape(model.name)}"><img src="${thumb}" alt="${escape(model.name)} 模型作品" loading="lazy" width="960" height="540" /></button>
            <div class="model-card-info"><p class="eyebrow">3D OBJECT / ${String(i+1).padStart(2,'0')}</p><h3 id="model-title-${i}">${escape(model.name)}</h3>
            ${model.id ? `<button type="button" class="gallery-button" data-model-id="${model.id}" data-model-name="${escape(model.name)}" data-model-link="https://skfb.ly/${model.short}">探索 3D ↗</button>` : '<span class="model-still-label">圖片展示 · 點圖放大</span>'}</div>
          </article>`;
}).join('\n');
const index = path.join(root, 'index.html');
let html = fs.readFileSync(index, 'utf8');
const block = `<!-- MODEL CARDS START -->\n<div class="model-grid">${cards}</div>\n<!-- MODEL CARDS END -->`;
if (html.includes('<!-- MODEL CARDS START -->')) html = html.replace(/<!-- MODEL CARDS START -->[\s\S]*?<!-- MODEL CARDS END -->/, block);
if (!html.includes('<!-- MODEL CARDS START -->')) throw new Error('Missing model cards marker');
fs.writeFileSync(index, html);
console.log(`Updated ${models.length} model cards (${models.filter(m => m.id).length} interactive).`);
