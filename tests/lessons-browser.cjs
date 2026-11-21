const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { startServer } = require('../cli/server.cjs');
const { build } = require('../cli/lib/build.cjs');
const root = path.resolve(__dirname, '..');
const available = ['aether-observatory-3d', 'cinematic-crossing-2d', 'route-atlas-2d', 'boss-patterns-2d'];
const requested = process.argv.slice(2);
assert(requested.every(id => available.includes(id)), 'Unknown lesson');
const ids = requested.length ? requested : available;
const touchSessions = new WeakMap();

async function clickAction(page, label) {
    const point = await page.evaluate(label => {
        const level = window.level, actions = level.hud.bar.buttons;
        const action = actions.find(action => action.label === label), rect = action.button.rect;
        const screen = level.screen, bounds = screen.Canvas.getBoundingClientRect();
        return {x: bounds.left + (rect.x + rect.width / 2) * bounds.width / screen.Width,
            y: bounds.top + (rect.y + rect.height / 2) * bounds.height / screen.Height};
    }, label);
    await page.mouse.click(point.x, point.y);
}

async function touchStick(page, active, extraAction = false) {
    if (active) await page.waitForFunction(extra => window.level.hud.stick.origin.y > 0
        && (!extra || window.level.hud.bar.buttons[0].button.enabled), extraAction);
    const points = await page.evaluate(extraAction => {
        const level = window.level, screen = level.ui?.Screen ?? level.screen, bounds = screen.Canvas.getBoundingClientRect();
        const origin = level.hud.stick.origin;
        const points = [{x: origin.x + 38, y: origin.y, id: 1}];
        if (extraAction) {
            const rect = level.hud.bar.buttons[0].button.rect;
            points.push({x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, id: 2});
        }
        return points.map(p => ({x: bounds.left + p.x * bounds.width / screen.Width,
            y: bounds.top + p.y * bounds.height / screen.Height, id: p.id}));
    }, extraAction);
    let session = touchSessions.get(page);
    if (!session) {session = await page.context().newCDPSession(page); touchSessions.set(page, session);}
    await session.send('Input.dispatchTouchEvent', {type: active ? 'touchStart' : 'touchEnd', touchPoints: active ? points : []});
}

async function inspect(page, id, mobile) {
    await page.evaluate(async () => {
        window.engine = await import('gameforgejs/core'); window.level = window.engine.LevelHandler.current;
    });
    if (id === 'aether-observatory-3d') {
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => !window.level.tour.playing);
        const before = await page.evaluate(() => window.level.player.mesh.transform.position.slice());
        if (mobile) await touchStick(page, true); else await page.keyboard.down('d');
        await page.waitForFunction(before => {
            const current = window.level.player.mesh.transform.position;
            return Math.hypot(current[0] - before[0], current[2] - before[2]) > 0.7;
        }, before);
        if (mobile) await touchStick(page, false); else await page.keyboard.up('d');
        await page.keyboard.press('c'); await page.waitForFunction(() => window.level.rig.mode === 'orbit');
        await page.evaluate(() => {
            window.padButtons = [3];
            Object.defineProperty(navigator, 'getGamepads', {configurable: true, value: () => [{index: 0, id: 'Lesson pad', connected: true,
                mapping: 'standard', axes: [0, 0, 0, 0], buttons: Array.from({length: 17}, (_, index) => ({pressed: window.padButtons.includes(index), value: window.padButtons.includes(index) ? 1 : 0}))}]});
        });
        await page.waitForFunction(() => window.level.rig.mode === 'chase');
        await page.evaluate(() => window.padButtons = []);
        await page.keyboard.press('t'); await page.waitForFunction(() => window.level.hud.telemetry);
        await page.keyboard.press('t'); await page.waitForFunction(() => !window.level.hud.telemetry);
        const yaw = await page.evaluate(() => window.level.rig.yaw);
        await page.mouse.move(270, 180); await page.mouse.down({button: 'right'}); await page.waitForTimeout(80);
        await page.mouse.move(330, 200, {steps: 8});
        await page.waitForFunction(yaw => Math.abs(window.level.rig.yaw - yaw) > 0.1, yaw);
        await page.mouse.up({button: 'right'});
        await page.evaluate(() => {
            const level = window.level; level.ResetPlayer();
            for (let index = 0; index < 180; index++) level.OnFixedUpdate(1 / 60);
        });
        assert(await page.evaluate(() => window.level.player.body.grounded));
        const result = await page.evaluate(() => {
            const level = window.level; level.OnDrawn();
            return {objects: level.scene.objects.length, stats: level.renderer.stats, gl: level.renderer.gl.getError()};
        });
        assert(result.objects > 230 && result.stats.visible > 20 && result.stats.culled > 0); assert.equal(result.gl, 0);
        await page.evaluate(() => window.level.StartTour());
        assert(await page.evaluate(() => window.level.tour.playing));
        await page.keyboard.press('Escape');
    } else if (id === 'cinematic-crossing-2d') {
        assert(await page.evaluate(() => window.level.sequence.playing));
        await clickAction(page, 'SKIP');
        assert.equal(await page.evaluate(() => window.level.sequence.playing), false);
        const x = await page.evaluate(() => window.level.courier.position.x);
        if (mobile) await touchStick(page, true); else await page.keyboard.down('a');
        await page.waitForFunction(x => Math.abs(window.level.courier.position.x - x) > 10, x);
        if (mobile) await touchStick(page, false); else await page.keyboard.up('a');
        await clickAction(page, 'PLAY'); assert(await page.evaluate(() => window.level.sequence.playing));
        await page.evaluate(() => {
            const level = window.level; window.engine.Engine.Stop();
            for (let step = 0; step < 1000; step++) level.OnUpdate(1 / 60);
        });
        assert.equal(await page.evaluate(() => window.level.sequence.playing), false);
        assert.equal(await page.evaluate(() => window.level.dialogue), '');
        assert.equal(await page.evaluate(() => window.level.courier.path.playing), false);
    } else if (id === 'route-atlas-2d') {
        assert.equal(await page.evaluate(() => window.level.progress.Available('grove')), false);
        await clickAction(page, 'ENTER'); assert.equal(await page.evaluate(() => window.level.mode), 'stage');
        const x = await page.evaluate(() => window.level.trial.position.x);
        if (mobile) await touchStick(page, true); else await page.keyboard.down('d');
        await page.waitForFunction(x => window.level.trial.position.x > x + 15, x);
        if (mobile) await touchStick(page, false); else await page.keyboard.up('d');
        await page.evaluate(() => {
            const level = window.level;
            for (const shard of level.trial.GetShards()) { level.trial.position.Copy(shard); level.trial.OnUpdate(0); }
        });
        assert.equal(await page.evaluate(() => window.level.mode), 'map');
        assert(await page.evaluate(() => window.level.progress.Available('grove')));
        await page.keyboard.down('d');
        await page.waitForFunction(() => window.level.progress.current === 'grove');
        await page.keyboard.up('d');
        await clickAction(page, 'ENTER'); assert.equal(await page.evaluate(() => window.level.mode), 'stage');
        await clickAction(page, 'BACK'); assert.equal(await page.evaluate(() => window.level.mode), 'map');
        await clickAction(page, 'RESET'); assert.equal(await page.evaluate(() => window.level.progress.cleared.size), 0);
    } else {
        const x = await page.evaluate(() => window.level.player.position.x);
        if (mobile) await touchStick(page, true, true); else {await page.keyboard.down('d'); await page.keyboard.down('Space');}
        await page.waitForFunction(x => window.level.player.position.x > x + 10, x);
        await page.waitForFunction(() => window.level.projectiles.pool.some(p => p.active && p.team === 'player'));
        if (mobile) await touchStick(page, false); else {await page.keyboard.up('d'); await page.keyboard.up('Space');}
        if (mobile) await clickAction(page, 'DASH'); else await page.keyboard.press('c');
        await page.waitForFunction(() => window.level.player.motion.cooldown > 0);
        const checks = await page.evaluate(() => {
            const level = window.level; window.engine.Engine.Stop(); level.Reset();
            for (const [x, y] of level.room.switches) {
                level.player.position.Set(x, y);
                level.OnFixedUpdate(1 / 60);
            }
            level.player.position.Set(480, 86); level.OnFixedUpdate(1 / 60);
            const seals = level.roomIndex === 1 && !level.boss.active;
            level.player.health.invulnerabilityTimer = 99;
            for (let index = 0; index < 730; index++) level.OnFixedUpdate(1 / 60);
            level.player.position.Set(480, 86); level.OnFixedUpdate(1 / 60);
            const gauntlet = level.roomIndex === 2 && level.boss.active;
            level.Reset(); level.EnterRoom(2);
            for (let index = 0; index < 145; index++) {level.OnUpdate(1 / 60); level.OnFixedUpdate(1 / 60);}
            const noEarlyShot = level.brain.state === 'windup' && level.projectiles.pool.every(p => !p.active);
            for (let index = 0; index < 45; index++) {level.OnUpdate(1 / 60); level.OnFixedUpdate(1 / 60);}
            const attacks = level.projectiles.pool.some(p => p.active && p.team === 'enemy');
            level.boss.health.hp = 28; level.brain.Windup(); const phase2 = level.brain.phase === 1;
            level.boss.health.hp = 10; level.brain.Windup(); const phase3 = level.brain.phase === 2;
            const charge = level.brain.patterns.charge; charge.Prepare(); charge.Begin(); const before = level.boss.position.Clone(); charge.Update(0.25);
            const moved = before.DistanceTo(level.boss.position) > 1 && level.hazards.hazards.length > 0;
            level.Reset(); level.EnterRoom(2); level.boss.health.hp = 1; level.Emit(level.boss.position, {x: 0, y: 0}, 'player'); level.OnFixedUpdate(1 / 60);
            return {seals, gauntlet, noEarlyShot, attacks, phase2, phase3, moved, result: level.result, capacity: level.projectiles.pool.length};
        });
        assert.deepEqual(checks, {seals: true, gauntlet: true, noEarlyShot: true, attacks: true, phase2: true, phase3: true, moved: true, result: 'VICTORY', capacity: 96});
        await clickAction(page, 'RETRY'); assert.equal(await page.evaluate(() => window.level.result), '');
    }
    await page.evaluate(() => {window.level.OnDrawn(); window.level.OnGUI();});
    await page.screenshot({path: path.join(root, 'test-results', `${id}-${mobile ? 'mobile' : 'desktop'}.png`)});
    const layout = await page.evaluate(() => {
        const level = window.level, screen = level.ui?.Screen ?? level.screen;
        const buttons = level.hud.bar ? level.hud.bar.buttons.map(action => action.button) : [...level.hud.buttons.values()];
        return buttons.every(button => button.rect.x >= 0 && button.rect.y >= 0 && button.rect.x + button.rect.width <= screen.Width && button.rect.y + button.rect.height <= screen.Height);
    });
    assert(layout, 'responsive controls must remain inside the viewport');
    const cleanup = await page.evaluate(async () => {
        const level = window.level; await window.engine.Engine.Dispose();
        return {entities: level.entities.length, canvases: document.querySelectorAll('canvas').length,
            bodies: level.physics?.bodies.length ?? 0, buffers: level.renderer?.ownedBuffers.size ?? 0};
    });
    assert.deepEqual(cleanup, {entities: 0, canvases: 0, bodies: 0, buffers: 0});
}

async function main() {
    fs.mkdirSync(path.join(root, 'test-results'), {recursive: true});
    const temporary = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'gameforge-lessons-'));
    const browser = await chromium.launch({headless: true, executablePath: process.env.GAMEFORGE_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
        args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
    const source = await startServer({root, port: 0, basePath: '/GameForgeJS/'});
    try {
        for (const id of ids) {
            const output = build(path.join(root, 'examples', id), {output: path.join(temporary, id)}).output;
            const built = await startServer({root: output, port: 0, basePath: '/GameForgeJS/'});
            try {
                for (const [variant, server, route] of [['source', source, `examples/${id}/`], ['built', built, '']]) {
                    for (const mobile of [false, true]) {
                        const context = await browser.newContext({viewport: mobile ? {width: 390, height: 844} : {width: 1280, height: 800}, hasTouch: mobile, isMobile: mobile});
                        try {
                            const page = await context.newPage(), errors = [], external = [];
                            page.setDefaultTimeout(30000); page.on('pageerror', error => errors.push(error.message));
                            const origin = `http://127.0.0.1:${server.address().port}`;
                            page.on('response', r => { if (r.status() >= 400 && !r.url().endsWith('favicon.ico')) errors.push(`${r.status()} ${r.url()}`); });
                            page.on('request', r => { if (/^https?:/.test(r.url()) && !r.url().startsWith(origin)) external.push(r.url()); });
                            await page.goto(`${origin}/GameForgeJS/${route}`);
                            await page.evaluate(async () => {window.engine = await import('gameforgejs/core');});
                            await page.waitForFunction(() => window.engine.LevelHandler.current?.hud);
                            await inspect(page, id, mobile); assert.deepEqual(errors, []); assert.deepEqual(external, []);
                            console.log(`PASS ${id} ${variant}/${mobile ? 'mobile' : 'desktop'}: gameplay, input, prefix hosting and disposal`);
                        } finally {await context.close();}
                    }
                }
            } finally {await new Promise(resolve => built.close(resolve));}
        }
    } finally {
        await browser.close(); await new Promise(resolve => source.close(resolve));
        if (path.dirname(temporary) === fs.realpathSync(os.tmpdir()) && path.basename(temporary).startsWith('gameforge-lessons-')) fs.rmSync(temporary, {recursive: true, force: true, maxRetries: 3});
    }
}
main().catch(error => {console.error(error); process.exitCode = 1;});
