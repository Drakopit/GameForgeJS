// Optional integration suite. Install Playwright Chromium, or set GAMEFORGE_BROWSER
// to a Chromium/Edge executable. Edge is discovered automatically on Windows.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { startServer } = require('../cli/server.cjs');
const { createProject } = require('../cli/lib/project.cjs');
const { build } = require('../cli/lib/build.cjs');
const { inspectPlatformer } = require('./browser/platformer.cjs');
const { inspectPlatformerProgression } = require('./browser/platformer-progression.cjs');
const { inspectToonRoom } = require('./browser/toon-room.cjs');
const { inspectToonCombat } = require('./browser/toon-combat.cjs');
const { inspectToonExploration } = require('./browser/toon-exploration.cjs');
const { inspectToonAnimation } = require('./browser/toon-animation.cjs');

const ROOT = path.resolve(__dirname, '..');
const screenshots = path.join(ROOT, 'test-results/browser');
const catalog = require('../examples/catalog.json');
const failures = [];

async function inspect(browser, url, name, { starter = false, play = false } = {}) {
    const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
    const errors = new Set();
    page.on('pageerror', error => errors.add(error.message));
    page.on('console', message => {
        if (message.type() === 'error' && !message.location().url?.endsWith('/favicon.ico')) errors.add(`${message.text()} (${message.location().url || 'console'})`);
    });
    page.on('response', response => { if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) errors.add(`HTTP ${response.status()}: ${response.url()}`); });
    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        if (starter) {
            await page.locator('#status').filter({ hasText: 'Ready' }).waitFor({ timeout: 10000 });
        } else {
            await page.waitForFunction(async () => (await import('gameforgejs/core')).Engine.running, null, { timeout: 15000 });
        }
        await page.waitForTimeout(500);
        const dimensions = await page.locator('canvas').evaluateAll(canvases => canvases.map(canvas => [canvas.width, canvas.height]));
        assert.ok(dimensions.some(([width, height]) => width > 0 && height > 0), 'No canvas with a nonzero size');
        if (play) {
            // Exercise actual input, level transition, asset composition and gameplay.
            for (let i = 0; i < (name.includes('advanced') ? 2 : 1); i++) {
                await page.keyboard.down('Enter'); await page.waitForTimeout(100); await page.keyboard.up('Enter');
                await page.waitForTimeout(500);
            }
            const current = await page.evaluate(async () => (await import('gameforgejs/core')).LevelHandler.current.constructor.name);
            assert.ok(!/Menu|Selector/.test(current), `Input did not enter gameplay: ${current}`);
        }
        if (name.endsWith('-platformer')) {
            await inspectPlatformer(page, path.join(screenshots, `${name}.png`));
            await inspectPlatformerProgression(page);
        }
        if (name.endsWith('-toonabs')) {
            await inspectToonRoom(page, path.join(screenshots, `${name}.png`));
            await inspectToonCombat(page);
            await inspectToonAnimation(page, path.join(screenshots, `${name}-animation.png`));
            await inspectToonExploration(page, path.join(screenshots, `${name}-forest.png`));
        }
        if (starter && name.includes('2d')) {
            const before = await page.locator('canvas').evaluate(canvas => canvas.toDataURL());
            await page.locator('canvas').focus();
            await page.keyboard.down('ArrowRight'); await page.waitForTimeout(250); await page.keyboard.up('ArrowRight');
            const after = await page.locator('canvas').evaluate(canvas => canvas.toDataURL());
            assert.notEqual(after, before, 'Starter does not react to movement input');
        }
        if (starter && name.includes('3d')) {
            const before = await page.locator('canvas').screenshot();
            await page.waitForTimeout(250);
            const after = await page.locator('canvas').screenshot();
            assert.ok(!after.equals(before), '3D starter scene does not animate');
        }
        if (starter || play || name === 'source-demo3d') await page.screenshot({ path: path.join(screenshots, `${name}.png`) });
        assert.deepEqual([...errors], [], 'Browser errors');
        if (!starter) {
            await page.evaluate(async () => {
                const { Engine } = await import('gameforgejs/core');
                await Engine.Dispose();
                if (Engine.running || Engine.frameId !== null) throw new Error('Legacy loop survived disposal');
            });
        }
        console.log(`PASS ${name}`);
    } catch (error) {
        failures.push(name);
        console.error(`FAIL ${name}: ${error.message}\n${[...errors].join('\n')}`);
        await page.screenshot({ path: path.join(screenshots, `${name}-failure.png`) }).catch(() => {});
    } finally { await page.close(); }
}

async function main() {
    fs.mkdirSync(screenshots, { recursive: true });
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'gameforge-browser-'));
    const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
    const executablePath = process.env.GAMEFORGE_BROWSER || (fs.existsSync(edge) ? edge : undefined);
    const browser = await chromium.launch({ headless: true, executablePath, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const servers = [];
    async function serve(options) {
        const server = await startServer({ ...options, port: 0 });
        servers.push(server);
        return `http://127.0.0.1:${server.address().port}${options.basePath || '/'}`;
    }
    try {
        const source = await serve({ root: ROOT });
        for (const entry of catalog) await inspect(browser, `${source}examples/${entry.path}`, `source-${entry.id}`, { play: ['advanced', 'mini3d'].includes(entry.id) });
        for (const template of ['minimal-2d', 'minimal-3d']) {
            const project = path.join(temporary, template);
            createProject(project, { template });
            const sourceURL = await serve({ root: project, engineRoot: ROOT });
            await inspect(browser, sourceURL, `created-${template}`, { starter: true });
            const output = build(project).output;
            for (const basePath of ['/', '/game/']) {
                const builtURL = await serve({ root: output, basePath });
                await inspect(browser, builtURL, `built-${template}-${basePath === '/' ? 'root' : 'prefix'}`, { starter: true });
            }
        }
        for (const entry of catalog) {
            const project = path.join(ROOT, 'examples', path.dirname(entry.path));
            const output = build(project, { output: path.join(temporary, `build-${entry.id}`) }).output;
            const url = await serve({ root: output, basePath: '/game/' });
            await inspect(browser, url, `built-${entry.id}`, { play: ['advanced', 'mini3d'].includes(entry.id) });
        }
    } finally {
        await browser.close();
        await Promise.all(servers.map(server => new Promise(resolve => server.close(resolve))));
        // Only remove the uniquely created temporary fixture, after verifying its boundary.
        if (path.dirname(temporary) === fs.realpathSync(os.tmpdir()) && path.basename(temporary).startsWith('gameforge-browser-')) fs.rmSync(temporary, { recursive: true, force: true });
    }
    console.log(`Browser integration: ${failures.length} failed cases.`);
    if (failures.length) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
