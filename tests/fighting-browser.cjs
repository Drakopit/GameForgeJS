const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { startServer } = require('../cli/server.cjs');
const { build } = require('../cli/lib/build.cjs');
const { inspectFighting, enterFight } = require('./browser/fighting.cjs');
const { inspectFightingGamepad } = require('./browser/fighting-gamepad.cjs');
const { inspectFightingMobile, inspectFightingSparsePads } = require('./browser/fighting-access.cjs');
async function main() {
    const root = path.resolve(__dirname, '..');
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'gameforge-fighting-'));
    const browser = await chromium.launch({ headless: true,
        executablePath: process.env.GAMEFORGE_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
    const servers = [];
    try {
        for (const mode of ['source', 'built']) {
            const directory = mode === 'source' ? root : build(path.join(root, 'examples/fighting-2d'), { output: path.join(temp, 'game') }).output;
            const server = await startServer({ root: directory, port: 0, basePath: '/game/' }); servers.push(server);
            const url = `http://127.0.0.1:${server.address().port}/game/${mode === 'source' ? 'examples/fighting-2d/index.html' : ''}`;
            for (const scenario of ['combat', 'versus-gamepad', 'sparse-pads', 'mobile-controls']) {
                const mobile=scenario==='mobile-controls';
                const page = await browser.newPage({ viewport: mobile?{width:390,height:844}:{ width: 1100, height: 800 },isMobile:mobile,hasTouch:mobile });
                const errors = [];
                page.on('pageerror', error => errors.push(error.message));
                page.on('response', response => { if (response.status() >= 400 && !response.url().endsWith('favicon.ico')) errors.push(response.url()); });
                await page.goto(url, { waitUntil: 'networkidle' });
                try {
                if (scenario === 'combat') await inspectFighting(page, `test-results/browser/${mode}-fighting.png`);
                else if(scenario==='versus-gamepad'){ await enterFight(page, { versus: true }); await inspectFightingGamepad(page); }
                else if(mobile)await inspectFightingMobile(page);
                else await inspectFightingSparsePads(page);
                } catch (error) {
                    console.error(mode, scenario, url, errors);
                    throw error;
                }
                assert.deepEqual(errors, []);
                await page.evaluate(async () => { await (await import('gameforgejs/core')).Engine.Dispose(); });
                await page.close();
                console.log(`PASS fighting ${mode}/${scenario}: powers, combos, AI, input and cleanup`);
            }
        }
    } finally {
        await browser.close();
        await Promise.all(servers.map(server => new Promise(resolve => server.close(resolve))));
        assert.equal(path.dirname(temp), fs.realpathSync(os.tmpdir()));
        assert.ok(path.basename(temp).startsWith('gameforge-fighting-'));
        fs.rmSync(temp, { recursive: true, force: true });
    }
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
