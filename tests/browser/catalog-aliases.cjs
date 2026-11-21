const assert = require('node:assert/strict');

async function inspectCatalogAliases(browser, source, catalog) {
    const page = await browser.newPage();
    const folders = new Set(catalog.map(entry => entry.id));
    // Test routing only here; each actual game is loaded separately by the smoke suite.
    await page.route('**/examples/*/index.html*', async route => {
        const url = new URL(route.request().url());
        const folder = url.pathname.split('/').at(-2);
        if (folders.has(folder)) await route.fulfill({ contentType: 'text/html', body: '<title>Alias destination</title>' });
        else await route.continue();
    });
    try {
        for (const entry of catalog) {
            for (const alias of entry.aliases ?? []) {
                await page.goto(`${source}Main.html?demo=${alias}&room=alias-test#controls`);
                await page.waitForURL(url => url.pathname.endsWith(`/examples/${entry.path}`));
                const target = new URL(page.url());
                assert.equal(target.searchParams.get('room'), 'alias-test');
                assert.equal(target.searchParams.has('demo'), false);
                assert.equal(target.hash, '#controls');
            }
        }
        console.log('PASS catalog: all legacy launcher aliases preserve query/hash and reach canonical examples');
    } finally { await page.close(); }
}
module.exports = { inspectCatalogAliases };
