const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const catalog = require('../examples/catalog.json');
const categories = require('../examples/categories.json');
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
if (catalog.some(entry => !categories.some(category => category.id === entry.category))) throw new Error('Unregistered demo category.');
const filters = [{id:'all',pt:'Todas as categorias'},...categories].map(category => `<button type="button" data-category="${category.id}" aria-pressed="${category.id==='all'}" data-i18n="${category.id==='all'?'catalog.all':'category.'+category.id}">${category.pt}</button>`).join('\n');
const groups = categories.map(category => `<section class="demo-category" data-group="${category.id}" aria-labelledby="category-${category.id}">
<h3 id="category-${category.id}" data-i18n="category.${category.id}">${category.pt}</h3>
<div class="demo-grid">
${catalog.filter(entry => entry.category===category.id).map(entry => `<a class="demo-card" href="examples/${escape(entry.path)}">
<img src="${escape(entry.screenshot)}" alt="${escape(entry.name)}" width="1100" height="800" loading="lazy">
<div class="card-copy"><span class="tag">${entry.dimension}</span><h4>${escape(entry.name)}</h4>
<p data-i18n="example.${entry.id}">${escape(entry.description)}</p></div></a>`).join('\n')}
</div></section>`).join('\n');
const block = `<!-- catalog:start -->
<div class="catalog-filters" role="group" aria-label="Escolha uma categoria" data-i18n-aria-label="catalog.filter">${filters}</div>
<p id="catalog-status" role="status" hidden data-i18n="catalog.notFound">Esse exemplo não está disponível. Escolha uma demo abaixo.</p>
<div class="catalog-groups">${groups}</div>
<!-- catalog:end -->`;
const file = path.join(root,'index.html'), before = fs.readFileSync(file,'utf8').replace(/\r\n/g, '\n');
if (!before.includes('<!-- catalog:start -->')) throw new Error('Missing catalog markers.');
const after = before.replace(/<!-- catalog:start -->[\s\S]*?<!-- catalog:end -->/,block);
if (process.argv.includes('--check')) {
    if (after !== before) {console.error('Catalog markup is stale. Run npm run catalog.');process.exitCode=1;}
} else fs.writeFileSync(file,after);
