const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const loader = () => import(pathToFileURL(path.resolve(__dirname, '../src/core/Assets/ResourceManifestLoader.js')).href);

test('resource URLs follow the manifest URL, including redirects and deployment prefixes', async t => {
    const { ResourceManifestLoader } = await loader();
    const manifest = { schemaVersion: 1, images: [{ name: 'hero', path: './assets/hero.png' }], jsons: [{ name: 'level', path: 'levels/first.json' }] };
    t.mock.method(globalThis, 'fetch', async () => ({ ok: true, url: 'https://example.test/game/data/resources.json', json: async () => manifest }));
    const queued = [];
    let loads = 0;
    const assets = { QueueImage: (...args) => queued.push(args), QueueJson: (...args) => queued.push(args), LoadAll: async () => loads++ };
    assert.equal(await ResourceManifestLoader.Load('/old-location/resources.json', assets), manifest);
    assert.deepEqual(queued.map(([name, url]) => [name, url]), [
        ['hero', 'https://example.test/game/data/assets/hero.png'],
        ['level', 'https://example.test/game/data/levels/first.json'],
    ]);
    assert.equal(loads, 1);
});

test('invalid resource manifests fail before enqueueing or loading assets', async t => {
    const { ResourceManifestLoader } = await loader();
    for (const manifest of [null, [], { schemaVersion: 2 }, { images: {} }, { images: [{ name: 'hero' }] }, { images: [{ name: 'hero', path: 'a' }, { name: 'hero', path: 'b' }] }]) {
        assert.throws(() => ResourceManifestLoader.Validate(manifest));
    }
    let queued = false;
    t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => ({ images: [{ name: 'valid', path: 'a' }], audios: 'invalid' }) }));
    await assert.rejects(ResourceManifestLoader.Load('/resources.json', { QueueImage() { queued = true; }, LoadAll() { queued = true; } }), /audios/);
    assert.equal(queued, false);
});
