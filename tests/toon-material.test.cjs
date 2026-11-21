const test = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

test('ToonMaterial validates live band changes and preserves standard material independence', async () => {
    const { ToonMaterial, StandardMaterial } = await import(pathToFileURL(path.resolve('src/3d/index.js')));
    const first = new ToonMaterial({ bands: 2, albedoColor: '#e5b85c', receiveShadow: false });
    const second = new ToonMaterial();
    assert.equal(first.type, 'toon');
    assert.equal(first.receiveShadow, false);
    assert.equal(second.bands, 3);
    first.bands = 4;
    assert.equal(second.bands, 3);
    for (const value of [0, 1, 2.5, 9, NaN, Infinity]) {
        assert.throws(() => { first.bands = value; }, /integer from 2 to 8/);
    }
    assert.equal(first.bands, 4);
    assert.equal(new StandardMaterial().type, 'standard');
});
