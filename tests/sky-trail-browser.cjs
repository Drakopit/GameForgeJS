const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { startServer } = require('../cli/server.cjs');
const { build } = require('../cli/lib/build.cjs');
const { inspectSkyTrail } = require('./browser/sky-trail.cjs');
const { inspectSkyTrailMenu } = require('./browser/sky-trail-menu.cjs');
const { inspectSkyTrailRoute } = require('./browser/sky-trail-route.cjs');

const ROOT = path.resolve(__dirname, '..');
const COURSES = ['', 'high_winds', 'archipelago', 'aurora'];
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

async function inspectCourse(browser, baseURL, course, name) {
    const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error' && !message.location().url.endsWith('favicon.ico')) errors.push(message.text());
    });
    page.on('response', response => {
        if (response.status() >= 400 && !response.url().endsWith('favicon.ico')) errors.push(response.url());
    });
    try {
        await page.goto(baseURL, { waitUntil: 'networkidle' });
        await page.evaluate(async () => { window.testCore = await import('gameforgejs/core'); });
        await page.waitForFunction(() => window.testCore.Engine.running && window.testCore.LevelHandler.current?.courses?.length === 4);
        if (!course) {
            await inspectSkyTrailMenu(page, `test-results/browser/${name}-sky-menu.png`);
        } else {
            const index = await page.evaluate(suffix => window.testCore.LevelHandler.current.courses
                .findIndex(entry => entry.name.endsWith(suffix)), course);
            assert.ok(index >= 0, `Missing course: ${course}`);
            for (let i = 0; i < index; i++) {
                await page.keyboard.press('ArrowDown');
                await page.waitForTimeout(80);
            }
            await page.keyboard.press('Enter');
            await page.waitForFunction(() => window.testCore.LevelHandler.current?.constructor.name === 'CubeGameLevel');
        }
        await inspectSkyTrail(page, `test-results/browser/${name}-sky-trail.png`);
        await inspectSkyTrailRoute(page);
        await page.evaluate(async () => {
            const { Engine, LevelHandler } = await import('gameforgejs/core');
            const level = LevelHandler.current;
            await Engine.Dispose();
            if (level.physics.bodies.length) throw new Error('Bodies survived disposal');
            if (document.querySelector('canvas')) throw new Error('Canvas survived disposal');
        });
        assert.deepEqual(errors, []);
        console.log(`PASS ${name}: menu, gameplay, route, input and cleanup`);
    } catch (error) {
        await page.screenshot({ path: `test-results/browser/${name}-failure.png` }).catch(() => {});
        throw error;
    } finally {
        await page.close();
    }
}

async function main() {
    fs.mkdirSync(path.join(ROOT, 'test-results/browser'), { recursive: true });
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'gameforge-sky-trail-'));
    const executablePath = process.env.GAMEFORGE_BROWSER || (fs.existsSync(EDGE) ? EDGE : undefined);
    const browser = await chromium.launch({ headless: true, executablePath,
        args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const servers = [];
    try {
        const output = build(path.join(ROOT, 'examples/DemoMiniGame3D'), { output: path.join(temporary, 'build') }).output;
        for (const [name, root, basePath, route] of [
            ['source', ROOT, '/', 'examples/DemoMiniGame3D/'],
            ['built', output, '/game/', 'game/'],
        ]) {
            const server = await startServer({ root, port: 0, basePath });
            servers.push(server);
            const url = `http://127.0.0.1:${server.address().port}/${route}`;
            for (const course of COURSES) await inspectCourse(browser, url, course, `${name}-${course || 'default'}`);
        }
    } finally {
        await browser.close();
        await Promise.all(servers.map(server => new Promise(resolve => server.close(resolve))));
        if (path.dirname(temporary) === fs.realpathSync(os.tmpdir()) && path.basename(temporary).startsWith('gameforge-sky-trail-')) {
            fs.rmSync(temporary, { recursive: true, force: true });
        }
    }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
