const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { startServer } = require('../cli/server.cjs');

async function main() {
    const root = path.resolve(__dirname, '..');
    const server = await startServer({ root, port: 0, basePath: '/GameForgeJS/' });
    const url = process.env.GAMEFORGE_SITE_URL || `http://127.0.0.1:${server.address().port}/GameForgeJS/`;
    const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
    const browser = await chromium.launch({ headless: true, executablePath: process.env.GAMEFORGE_BROWSER || (fs.existsSync(edge) ? edge : undefined), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const output = path.join(root, 'test-results/site');
    fs.mkdirSync(output, { recursive: true });
    try {
        if (process.argv.includes('--capture-demos')) {
            const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
            for (const [name, demo, presses] of [['sky-trail', 'DemoMiniGame3D', 1], ['platform-adventure', 'DemoAdvanced', 2]]) {
                await page.goto(`${url}examples/${demo}/index.html`, { waitUntil: 'networkidle' });
                await page.waitForFunction(async () => (await import('gameforgejs/core')).Engine.running);
                await page.waitForTimeout(500);
                for (let i = 0; i < presses; i++) {
                    await page.keyboard.down('Enter'); await page.waitForTimeout(100); await page.keyboard.up('Enter');
                    await page.waitForTimeout(500);
                }
                const level = await page.evaluate(async () => (await import('gameforgejs/core')).LevelHandler.current.constructor.name);
                assert.ok(!/Menu|Selector/.test(level), `Capture did not reach gameplay: ${level}`);
                await page.screenshot({ path: path.join(root, `site/${name}.jpg`), type: 'jpeg', quality: 82 });
            }
            await page.close();
        }
        for (const width of [1440, 390]) {
            const page = await browser.newPage({ viewport: { width, height: 950 } });
            const errors = [];
            page.on('pageerror', error => errors.push(error.message));
            page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()}: ${response.url()}`); });
            await page.goto(url, { waitUntil: 'networkidle' });
            assert.match(await page.title(), /GameForgeJS.*Seu jogo/);
            // Below-the-fold lazy images are fetched only when scrolled into view.
            for (const image of await page.locator('img').all()) {
                await image.scrollIntoViewIfNeeded();
                await image.evaluate(element => element.decode());
            }
            await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
            const findings = await page.evaluate(() => ({
                overflow: document.documentElement.scrollWidth > innerWidth,
                missingAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(a => !document.querySelector(a.getAttribute('href'))).map(a => a.href),
                brokenImages: [...document.images].filter(img => !img.complete || !img.naturalWidth).map(img => img.src),
            }));
            assert.deepEqual(findings, { overflow: false, missingAnchors: [], brokenImages: [] });
            // Exercise actual navigation, including keyboard focus and small screens.
            await page.getByRole('link', { name: 'Demos', exact: true }).click();
            assert.ok(page.url().endsWith('#jogos'));
            await page.goto(url, { waitUntil: 'networkidle' });
            await page.keyboard.press('Tab');
            assert.equal(await page.locator(':focus').textContent(), 'Pular para o conteúdo');
            await page.locator(':focus').evaluate(element => element.blur());
            await page.screenshot({ path: path.join(output, `landing-${width}.png`), fullPage: true });
            assert.deepEqual(errors, []);
            await page.close();
            console.log(`PASS presentation page at ${width}px under /GameForgeJS/`);
        }
    } finally {
        await browser.close();
        await new Promise(resolve => server.close(resolve));
    }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
