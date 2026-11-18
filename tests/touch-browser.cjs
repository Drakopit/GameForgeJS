const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { startServer } = require('../cli/server.cjs');
const { build } = require('../cli/lib/build.cjs');
const { inspectTouchGarden } = require('./browser/touch-garden.cjs');

async function main() {
    const root = path.resolve(__dirname, '..');
    fs.mkdirSync(path.join(root, 'test-results/browser'), { recursive: true });
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'gameforge-touch-'));
    const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
    const browser = await chromium.launch({ headless: true,
        executablePath: process.env.GAMEFORGE_BROWSER || (fs.existsSync(edge) ? edge : undefined),
        args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const servers = [];
    try {
        const output = build(path.join(root, 'examples/touch-garden-2d'), { output: path.join(temporary, 'build') }).output;
        for (const [mode, directory, route, basePath] of [
            ['source', root, 'examples/touch-garden-2d/', '/'], ['built', output, 'game/', '/game/'],
        ]) {
            const server = await startServer({ root: directory, port: 0, basePath });
            servers.push(server);
            for (const [orientation, viewport] of [['portrait', { width: 390, height: 844 }], ['landscape', { width: 844, height: 390 }]]) {
                const context = await browser.newContext({ viewport, isMobile: true, hasTouch: true });
                const page = await context.newPage();
                const errors = [];
                page.on('pageerror', error => errors.push(error.message));
                page.on('response', response => { if (response.status() >= 400 && !response.url().endsWith('favicon.ico')) errors.push(response.url()); });
                await page.goto(`http://127.0.0.1:${server.address().port}/${route}`, { waitUntil: 'networkidle' });
                await page.evaluate(async () => { window.touchCore = await import('gameforgejs/core'); });
                await page.waitForFunction(() => window.touchCore.Engine.running);
                await inspectTouchGarden(page, `test-results/browser/${mode}-touch-${orientation}.png`);
                await page.evaluate(async () => {
                    const { Input, Engine } = await import('gameforgejs/core');
                    const touch = Input.instance.touch;
                    await Engine.Dispose();
                    if (touch.GetActiveTouches().length || document.querySelector('canvas')) throw new Error('Touch/canvas survived disposal');
                });
                assert.deepEqual(errors, []);
                await context.close();
                console.log(`PASS touch ${mode}/${orientation}: two fingers, dash, cancel, scaled input, UI, collection, collision, cleanup`);
            }
        }
    } finally {
        await browser.close();
        await Promise.all(servers.map(server => new Promise(resolve => server.close(resolve))));
        if (path.dirname(temporary) === fs.realpathSync(os.tmpdir()) && path.basename(temporary).startsWith('gameforge-touch-')) fs.rmSync(temporary, { recursive: true, force: true });
    }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
