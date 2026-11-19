// Reproducible, real engine captures used by the landing page and examples launcher.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium, expect } = require('@playwright/test');
const { startServer } = require('../cli/server.cjs');
const catalog = require('../examples/catalog.json');

async function main() {
    const root = path.resolve(__dirname, '..');
    const server = await startServer({ root, port: 0 });
    const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
    const browser = await chromium.launch({ headless: true, executablePath: process.env.GAMEFORGE_BROWSER || (fs.existsSync(edge) ? edge : undefined),
        args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    try {
        const requested = process.argv.slice(2);
        assert.ok(requested.every(id => catalog.some(entry => entry.id === id)), 'Unknown example ID');
        for (const entry of catalog.filter(entry => !requested.length || requested.includes(entry.id))) {
            const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
            const errors = [];
            page.on('pageerror', error => errors.push(error.message));
            await page.goto(`http://127.0.0.1:${server.address().port}/examples/${entry.path}`, { waitUntil: 'networkidle' });
            await expect.poll(() => page.evaluate(async () => (await import('gameforgejs/core')).Engine.running), { timeout: 30000 }).toBe(true);
            await page.waitForTimeout(350);
            const flow = {
                'fighting-2d': ['FightingCharacterSelectLevel', 'FightingGame2DLevel'],
                'platform-adventure-2d': ['AdvancedDemoPhaseSelector', 'AdvancedDemoFirstLevel'],
                'sky-trail-3d': ['CubeGameLevel'],
            }[entry.id];
            for (const target of flow ?? []) {
                await page.keyboard.down('Enter'); await page.waitForTimeout(120); await page.keyboard.up('Enter');
                await expect.poll(() => page.evaluate(async () => (await import('gameforgejs/core')).LevelHandler.current.constructor.name),
                    { timeout: 30000 }).toBe(target);
            }
            if (entry.id === 'fighting-2d') {
                await expect.poll(() => page.evaluate(async () => (await import('gameforgejs/core')).LevelHandler.current.roundState),
                    { timeout: 15000, intervals: [50] }).toBe('fight');
                await page.keyboard.down('KeyU'); await page.waitForTimeout(120); await page.keyboard.up('KeyU');
                await expect.poll(() => page.evaluate(async () => {
                    const level = (await import('gameforgejs/core')).LevelHandler.current;
                    return level.combat.projectiles.pool.some(shot => shot.active && shot.owner === level.playerOne);
                }), { timeout: 15000, intervals: [16, 32] }).toBe(true);
                await page.evaluate(async () => {
                    const { Engine, LevelHandler } = await import('gameforgejs/core');
                    Engine.Stop(); LevelHandler.current.OnDrawn(); LevelHandler.current.OnGUI();
                });
            }
            if (entry.id === 'toon-adventure-3d') {
                await page.evaluate(async () => {
                    const { Engine, LevelHandler } = await import('gameforgejs/core');
                    Engine.Stop(); const level = LevelHandler.current;
                    level.player.transform.SetPosition(-7, 0.55, -8);
                    level.OnUpdate(0);
                    level.hud.announcement.age = 5;
                    level.OnDrawn(); level.OnGUI();
                });
            }
            if (entry.id === 'online-sandbox-2d' && process.env.GAMEFORGE_ONLINE_SERVER) {
                await page.evaluate(async endpoint => {
                    window.captureCore = await import('gameforgejs/core');
                    const level = window.captureCore.LevelHandler.current;
                    level.ui.fields.server.SetText(endpoint);
                    level.Connect(true);
                }, process.env.GAMEFORGE_ONLINE_SERVER);
                await page.waitForFunction(() => window.captureCore.LevelHandler.current.playing);
                await page.waitForTimeout(500);
            }
            await page.waitForTimeout(350);
            const bounds = await page.locator('canvas').first().boundingBox();
            assert.ok(bounds && bounds.width > 0 && bounds.height > 0, entry.id);
            const output = path.resolve(root, entry.screenshot);
            assert.ok(output.startsWith(path.join(root, 'site', 'examples') + path.sep));
            fs.mkdirSync(path.dirname(output), { recursive: true });
            await page.screenshot({ path: output, type: 'jpeg', quality: 85, clip: bounds });
            assert.deepEqual(errors, [], entry.id);
            await page.close();
            console.log(`CAPTURED ${entry.id}`);
        }
    } finally {
        await browser.close();
        await new Promise(resolve => server.close(resolve));
    }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
