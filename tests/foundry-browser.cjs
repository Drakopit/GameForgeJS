const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { startServer } = require('../cli/server.cjs');
const { build } = require('../cli/lib/build.cjs');
const root = path.resolve(__dirname, '..');
async function ready(page, url) {
    page.setDefaultTimeout(15000);
    await page.goto(url);
    await page.evaluate(async () => { window.fx = await import('gameforgejs/core'); });
    await page.waitForFunction(() => window.fx.LevelHandler.current?.resources?.hud?.panel.buttons.get('lab')?.enabled);
}
async function button(page, id) {
    const point = await page.evaluate(id => {
        const level = window.fx.LevelHandler.current, box = level.hud.panel.buttons.get(id).rect;
        const canvas = level.screen.Canvas.getBoundingClientRect();
        return { x: canvas.left + (box.x + box.width / 2) * canvas.width / level.screen.Width,
            y: canvas.top + (box.y + box.height / 2) * canvas.height / level.screen.Height };
    }, id);
    await page.mouse.click(point.x, point.y);
    await page.waitForTimeout(50);
}
async function desktop(page, label) {
    await page.keyboard.press('i');
    await page.waitForFunction(() => window.fx.LevelHandler.current.model.debug);
    await page.keyboard.press('i');
    await page.waitForFunction(() => !window.fx.LevelHandler.current.model.debug);
    await page.mouse.move(500, 200);
    await page.mouse.down();
    await page.mouse.move(560, 270, { steps: 5 });
    await page.mouse.up();
    await page.waitForFunction(() => window.fx.LevelHandler.current.world.props.filter(p => p.active).length >= 3);
    await button(page, 'lab');
    await page.waitForFunction(() => window.fx.LevelHandler.current.hud.panel.open);
    await button(page, 'tab1');
    const slider = await page.evaluate(() => window.fx.LevelHandler.current.hud.panel.sliders.get('spawnRate').rect);
    await page.mouse.move(slider.x + slider.width * 0.8, slider.y + 30);
    await page.mouse.down();
    await page.mouse.move(slider.x + slider.width * 0.3, slider.y + 30, { steps: 3 });
    await page.mouse.up();
    assert(await page.evaluate(() => window.fx.LevelHandler.current.model.current.spawnRate > 200));
    for (let index = 0; index < 4; index++) {
        await button(page, `preset${index}`);
        assert.equal(await page.evaluate(() => window.fx.LevelHandler.current.model.presetIndex), index);
    }
    await button(page, 'lab');
    await page.evaluate(() => {
        window.pad = { buttons: [], axes: [0, 0, 0, 0] };
        Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [{
                    index: 0, id: 'Foundry test pad', connected: true, mapping: 'standard', axes: window.pad.axes,
                    buttons: Array.from({ length: 17 }, (_, index) => ({ pressed: window.pad.buttons.includes(index), value: window.pad.buttons.includes(index) ? 1 : 0 })),
                }] });
    });
    const press = async (buttons) => { await page.evaluate(buttons => window.pad.buttons = buttons, buttons); await page.waitForTimeout(80); await page.evaluate(() => window.pad.buttons = []); await page.waitForTimeout(60); };
    await press([9]);
    await page.waitForFunction(() => window.fx.LevelHandler.current.hud.panel.open);
    await page.evaluate(() => window.fx.LevelHandler.current.hud.panel.SetTab(0));
    await press([7]);
    assert.equal(await page.evaluate(() => window.fx.LevelHandler.current.hud.panel.tab), 1);
    const rate = await page.evaluate(() => window.fx.LevelHandler.current.model.current.spawnRate);
    await press([15]);
    assert(await page.evaluate(before => window.fx.LevelHandler.current.model.current.spawnRate > before, rate));
    await press([6]);
    assert.equal(await page.evaluate(() => window.fx.LevelHandler.current.hud.panel.tab), 0);
    for (let index = 0; index < 6; index++)
        await press([13]);
    assert.equal(await page.evaluate(() => window.fx.LevelHandler.current.hud.panel.page), 1);
    await press([0]);
    assert.equal(await page.evaluate(() => window.fx.LevelHandler.current.model.telemetry), false);
    await press([11]);
    assert(await page.evaluate(() => window.fx.LevelHandler.current.hud.help));
    await press([11]);
    await press([9]);
    const count = await page.evaluate(() => window.fx.LevelHandler.current.world.props.filter(p => p.active).length);
    await press([0]);
    assert.equal(await page.evaluate(() => window.fx.LevelHandler.current.world.props.filter(p => p.active).length), count + 1);
    await page.evaluate(() => { delete navigator.getGamepads; delete window.pad; });
    const invariant = await page.evaluate(() => {
        const { Engine, LevelHandler } = window.fx;
        Engine.Stop();
        const level = LevelHandler.current, w = level.world;
        for (const prop of w.props)
            prop.SetActive(false);
        const a = w.props[0];
        a.Launch(w.width * 0.5, w.surfaceY - 45, 0, 450);
        a.position.y = w.surfaceY - a.size.y - 1;
        const before = w.water.totalImpacts;
        level.OnFixedUpdate(1 / 60);
        const water = w.water.totalImpacts > before && w.splashes.particles.length > 0 && a.velocity.vy < 0;
        level.SetPreset(3);
        const capacities = [w.rain.pool.pool.length, w.particles.pool.pool.length, w.splashes.pool.pool.length];
        for (let index = 0; index < 480; index++) {
            w.OnUpdate(1 / 60);
            level.OnFixedUpdate(1 / 60);
        }
        const finite = w.props.every(prop => Number.isFinite(prop.position.x) && Number.isFinite(prop.position.y));
        const bounded = w.rain.particles.length <= w.rain.capacity && w.particles.particles.length <= w.particles.capacity;
        const reused = JSON.stringify(capacities) === JSON.stringify([w.rain.pool.pool.length, w.particles.pool.pool.length, w.splashes.pool.pool.length]);
        const dropped = w.rain.dropped + w.particles.dropped;
        // Compare actual scene pixels with each independent pass toggled at a fixed simulation time.
        const s = level.model.current;
        s.shake = 0;
        s.glow = 0;
        s.chroma = 0;
        s.vignette = 0;
        s.scanlines = 0;
        s.grade = 0;
        s.reflection = false;
        const capture = () => {
            level.OnDrawn();
            const data = level.screen.Context.getImageData(0, 0, level.screen.Width, level.screen.Height).data;
            let hash = 0;
            for (let index = 0; index < data.length; index += 37)
                hash = (Math.imul(hash, 31) + data[index]) >>> 0;
            return hash;
        };
        const base = capture(), effects = {};
        for (const key of ['glow', 'chroma', 'vignette', 'scanlines', 'grade', 'reflection']) {
            s[key] = key === 'reflection' ? true : 1;
            effects[key] = capture() !== base;
            s[key] = key === 'reflection' ? false : 0;
        }
        level.Reset();
        level.OnDrawn();
        level.OnGUI();
        return { water, finite, bounded, reused, dropped, effects, reset: w.particles.particles.length === 0 && w.water.totalImpacts === 0 && level.model.presetIndex === 0 };
    });
    for (const key of ['water', 'finite', 'bounded', 'reused', 'reset'])
        assert.equal(invariant[key], true, JSON.stringify(invariant));
    assert(invariant.dropped > 0, 'Stress preset did not exercise the hard emission budgets');
    assert(Object.values(invariant.effects).every(Boolean), JSON.stringify(invariant.effects));
    await page.screenshot({ path: path.join(root, `test-results/browser/${label}-foundry.png`) });
    await page.evaluate(async () => {
        const level = window.fx.LevelHandler.current, world = level.world, renderer = level.renderer;
        await window.fx.Engine.Dispose();
        if (world.target.Canvas.width || renderer.post.glow.Canvas.width || world.rain.pool.pool.length || level.entities.length)
            throw new Error('Foundry leaked scene resources');
    });
    assert.equal(await page.locator('canvas').count(), 0);
}
async function mobile(page, label) {
    await button(page, 'lab');
    await button(page, 'tab1');
    const sliders = await page.evaluate(() => ['spawnRate', 'speed'].map(key => window.fx.LevelHandler.current.hud.panel.sliders.get(key).rect));
    const cdp = await page.context().newCDPSession(page);
    const points = sliders.map((box, index) => ({ id: index + 1, x: box.x + box.width * 0.7, y: box.y + 30 }));
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points });
    await page.waitForTimeout(80);
    assert(await page.evaluate(() => window.fx.LevelHandler.current.model.current.spawnRate > 500 && window.fx.LevelHandler.current.model.current.speed > 250));
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
    await page.waitForTimeout(50);
    assert(await page.evaluate(() => [...window.fx.LevelHandler.current.hud.panel.sliders.values()].every(slider => slider.finger === null)));
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(80);
    const layout = await page.evaluate(() => {
        const level = window.fx.LevelHandler.current;
        return { height: level.screen.Height, box: level.hud.panel.Layout(),
            visible: [...level.hud.panel.buttons.values()].filter(button => button.enabled).map(button => button.rect) };
    });
    assert(layout.box.pages > 1);
    for (const box of layout.visible)
        assert(box.y >= 0 && box.y + box.height <= layout.height, JSON.stringify(box));
    await button(page, 'more');
    assert.equal(await page.evaluate(() => window.fx.LevelHandler.current.hud.panel.page), 1);
    await page.screenshot({ path: path.join(root, `test-results/browser/${label}-foundry-mobile.png`) });
    await page.evaluate(async () => { await window.fx.Engine.Dispose(); });
    assert.equal(await page.locator('canvas').count(), 0);
}
async function main() {
    fs.mkdirSync(path.join(root, 'test-results/browser'), { recursive: true });
    const temporary = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'gameforge-foundry-'));
    const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
    const browser = await chromium.launch({ headless: true, executablePath: process.env.GAMEFORGE_BROWSER || (fs.existsSync(edge) ? edge : undefined) });
    const servers = [];
    try {
        const output = build(path.join(root, 'examples/storm-foundry-2d'), { output: path.join(temporary, 'build') }).output;
        assert(!fs.existsSync(path.join(output, '@engine/3d')));
        for (const [label, directory, route] of [['source', root, 'examples/storm-foundry-2d/'], ['built', output, '']]) {
            const server = await startServer({ root: directory, port: 0, basePath: '/lab/' });
            servers.push(server);
            const origin = `http://127.0.0.1:${server.address().port}`, url = `${origin}/lab/${route}`;
            for (const [name, options, inspect] of [['desktop', { viewport: { width: 1280, height: 800 } }, desktop], ['mobile', { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }, mobile]]) {
                const context = await browser.newContext(options), page = await context.newPage(), errors = [], external = [];
                page.on('pageerror', error => errors.push(error.message));
                page.on('request', request => { if (/^https?:/.test(request.url()) && !request.url().startsWith(origin))
                    external.push(request.url()); });
                page.on('response', response => { if (response.status() >= 400 && !response.url().endsWith('favicon.ico'))
                    errors.push(response.url()); });
                await ready(page, url);
                await inspect(page, label);
                assert.deepEqual(errors, []);
                assert.deepEqual(external, []);
                await context.close();
                console.log(`PASS foundry ${label}/${name}: input, effects, bounded simulation, composition and cleanup`);
            }
        }
    }
    finally {
        await browser.close();
        await Promise.all(servers.map(server => new Promise(resolve => server.close(resolve))));
        if (path.dirname(temporary) === fs.realpathSync(os.tmpdir()) && path.basename(temporary).startsWith('gameforge-foundry-'))
            fs.rmSync(temporary, { recursive: true, force: true, maxRetries: 3 });
    }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
