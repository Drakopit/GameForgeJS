const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('site catalogs cover the same keys and every localized markup label', () => {
    const root = path.resolve(__dirname, '..');
    const pt = JSON.parse(fs.readFileSync(path.join(root, 'site/locales/pt-BR.json')));
    const en = JSON.parse(fs.readFileSync(path.join(root, 'site/locales/en.json')));
    assert.deepEqual(Object.keys(en).sort(), Object.keys(pt).sort());
    const markup = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    for (const [, key] of markup.matchAll(/data-i18n(?:-alt|-aria-label)?="([^"]+)"/g)) {
        for (const catalog of [pt, en]) assert.ok(typeof catalog[key] === 'string' && catalog[key].length > 0, key);
    }
    for (const key of ['page.title', 'page.description', 'footer.author']) assert.ok(pt[key] && en[key]);
});
