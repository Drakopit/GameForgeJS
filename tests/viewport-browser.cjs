const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const { startServer } = require('../cli/server.cjs');

async function main() {
    const root = path.resolve(__dirname, '..');
    const catalog = JSON.parse(fs.readFileSync(path.join(root, 'examples/catalog.json')));
    const server = await startServer({ root, port: 0, basePath: '/GameForgeJS/' });
    const browser = await chromium.launch({ headless: true,
        executablePath: process.env.GAMEFORGE_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
        args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const results = [];
    try {
        for (const demo of catalog) {
            const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, hasTouch: true, isMobile: true });
            const errors = [];
            page.on('pageerror', error => errors.push(error.message));
            try {
                await page.goto(`http://127.0.0.1:${server.address().port}/GameForgeJS/examples/${demo.path}`);
                await page.evaluate(async () => { window.fx = await import('gameforgejs/core'); });
                await page.waitForFunction(() => window.fx.LevelHandler.current?._started && document.querySelector('canvas'));
                for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
                    await page.setViewportSize(viewport);
                    await page.waitForFunction(({width,height}) => [...document.querySelectorAll('canvas')].every(c => {
                        const r=c.getBoundingClientRect();
                        return r.x>=-1 && r.y>=-1 && r.right<=width+1 && r.bottom<=height+1;
                    }),viewport,{timeout:15000}).catch(async error => {
                        throw new Error(`${demo.id} at ${JSON.stringify(viewport)}: ${await page.locator('canvas').evaluateAll(nodes=>JSON.stringify(nodes.map(c=>c.getBoundingClientRect().toJSON())))}; ${error.message}`);
                    });
                    await page.waitForTimeout(100);
                    const canvases = await page.locator('canvas').evaluateAll(nodes => nodes.filter(c => c.isConnected).map(c => {
                        const r = c.getBoundingClientRect();
                        return { x: r.x, y: r.y, width: r.width, height: r.height, logicalWidth: c.width, logicalHeight: c.height };
                    }));
                    assert(canvases.length > 0, `${demo.id}: no canvas`);
                    for (const c of canvases) {
                        assert(c.width > 0 && c.height > 0, `${demo.id}: empty view`);
                        assert(c.x >= -1 && c.y >= -1 && c.x + c.width <= viewport.width + 1 && c.y + c.height <= viewport.height + 1,
                            `${demo.id}: clipped at ${JSON.stringify(viewport)}: ${JSON.stringify(c)}`);
                        assert(Math.abs((c.width / c.height) / (c.logicalWidth / c.logicalHeight) - 1) < 0.015,
                            `${demo.id}: stretched canvas ${JSON.stringify(c)}`);
                    }
                    if (canvases.length === 2 && demo.dimension === '3D') {
                        for (const property of ['x', 'y', 'width', 'height']) assert(Math.abs(canvases[0][property] - canvases[1][property]) < 1,
                            `${demo.id}: world/UI ${property} mismatch`);
                    }
                    results.push({ demo: demo.id, viewport, canvases });
                }
                await page.keyboard.press('h');
                await page.waitForTimeout(100);
                assert.deepEqual(errors, [], demo.id);
                await page.evaluate(() => window.fx.Engine.Dispose());
                console.log(`PASS viewport ${demo.id}: desktop, portrait, landscape, help and disposal`);
            } finally { await page.close(); }
        }
        fs.mkdirSync(path.join(root, 'test-results'), { recursive: true });
        fs.writeFileSync(path.join(root, 'test-results/viewport-audit.json'), JSON.stringify(results, null, 2));
    } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
