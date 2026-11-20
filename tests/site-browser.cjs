const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { startServer } = require('../cli/server.cjs');
const catalog = require('../examples/catalog.json');

async function main() {
    const root = path.resolve(__dirname, '..');
    const server = await startServer({ root, port: 0, basePath: '/GameForgeJS/' });
    const url = process.env.GAMEFORGE_SITE_URL || `http://127.0.0.1:${server.address().port}/GameForgeJS/`;
    const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
    const browser = await chromium.launch({ headless: true, executablePath: process.env.GAMEFORGE_BROWSER || (fs.existsSync(edge) ? edge : undefined), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const output = path.join(root, 'test-results/site');
    fs.mkdirSync(output, { recursive: true });
    try {
        for (const width of [1440, 390]) {
            const page = await browser.newPage({ viewport: { width, height: 950 } });
            const errors = [];
            page.on('pageerror', error => errors.push(error.message));
            page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()}: ${response.url()}`); });
            await page.goto(url, { waitUntil: 'networkidle' });
            assert.match(await page.title(), /GameForgeJS.*Seu jogo/);
            assert.equal(await page.locator('.demo-card').count(), catalog.length);
            assert.equal(await page.locator('.demo-card img').count(), catalog.length);
            for (const entry of catalog) {
                assert.equal(await page.locator(`.demo-card[href="examples/${entry.path}"] img`).getAttribute('src'), entry.screenshot);
            }
            for (const href of ['https://github.com/Drakopit', 'https://www.linkedin.com/in/patrickcamello/', 'mailto:patrickcamelo@yahoo.com.br']) {
                assert.equal(await page.locator(`footer a[href="${href}"]`).count(), 1);
            }
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
            await page.locator('#jogos').evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'start' }));
            await page.screenshot({ path: path.join(output, `gallery-${width}.png`) });
            await page.goto(url, { waitUntil: 'networkidle' });
            await page.keyboard.press('Tab');
            assert.equal(await page.locator(':focus').textContent(), 'Pular para o conteúdo');
            await page.locator(':focus').evaluate(element => element.blur());
            await page.locator('img').evaluateAll(images => Promise.all(images.map(async image => { image.loading = 'eager'; await image.decode(); })));
            await page.screenshot({ path: path.join(output, `landing-${width}.png`), fullPage: true });
            await page.locator('#site-language').selectOption('en');
            await page.waitForFunction(() => document.documentElement.lang === 'en');
            assert.match(await page.title(), /Your game/);
            assert.ok((await page.locator('h1').textContent()).includes('Your game.'));
            assert.ok((await page.locator('footer').textContent()).includes('Created by Patrick Faustino Camello.'));
            assert.equal(await page.locator('nav').getAttribute('aria-label'), 'Main navigation');
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
            await page.screenshot({ path: path.join(output, `landing-en-${width}.png`), fullPage: true });
            await page.reload({ waitUntil: 'networkidle' });
            await page.waitForFunction(() => document.documentElement.lang === 'en');
            await page.goto(`${url}?lang=pt-BR`, { waitUntil: 'networkidle' });
            await page.waitForFunction(() => document.documentElement.lang === 'pt-BR' && document.documentElement.dataset.localeReady === 'true');
            assert.match(await page.title(), /Seu jogo/);
            assert.ok((await page.locator('footer').textContent()).includes('Criada por Patrick Faustino Camello.'));
            await page.locator('footer').scrollIntoViewIfNeeded();
            await page.screenshot({ path: path.join(output, `footer-${width}.png`) });
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
