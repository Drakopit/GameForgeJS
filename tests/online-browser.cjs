const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');
const { chromium } = require('@playwright/test');
const { startServer } = require('../cli/server.cjs');
const { build } = require('../cli/lib/build.cjs');
const { verifyMotion } = require('./online-motion.cjs');
const { inspectMobileViewport, inspectLobbyCaret, inspectLandscapeLobby } = require('./browser/online-mobile-ui.cjs');

const root = path.resolve(__dirname, '..');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

async function connect(endpoint, hello) {
    const socket = new WebSocket(endpoint), messages = [];
    socket.addEventListener('message', event => messages.push(JSON.parse(event.data)));
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    const send = (type, payload) => socket.send(JSON.stringify({ type, payload }));
    const wait = async (type, predicate = () => true) => {
        for (let attempt = 0; attempt < 150; attempt++) {
            const index = messages.findIndex(message => message.type === type && predicate(message.payload));
            if (index >= 0) return messages.splice(index, 1)[0].payload;
            await pause(20);
        }
        throw new Error(`Timed out waiting for ${type}`);
    };
    send('hello', { protocol: 1, ...hello });
    return { socket, send, wait, messages, joined: await wait('joined') };
}

async function protocol(endpoint) {
    const peers = [];
    try {
        const alice = await connect(endpoint, { mode: 'create', name: 'Alice' }); peers.push(alice);
        const bob = await connect(endpoint, { room: alice.joined.room, name: 'Bob' }); peers.push(bob);
        const isolated = await connect(endpoint, { mode: 'create', name: 'Other room' }); peers.push(isolated);
        assert.equal(bob.joined.players.length, 2);
        assert.notEqual(isolated.joined.room, alice.joined.room);
        alice.send('chat', { text: 'hello', name: 'Impostor', playerId: 'forged' });
        const chat = await bob.wait('chat', message => message.text === 'hello');
        assert.equal(chat.name, 'Alice'); assert.equal(chat.playerId, alice.joined.playerId);
        assert(!isolated.messages.some(message => message.type === 'chat' && message.payload.text === 'hello'));
        alice.send('state', { x: 999999, y: 0 });
        const state = await alice.wait('state');
        assert(state.players.find(player => player.id === alice.joined.playerId).x < 200);
        alice.send('action', { id: 1, kind: 'mine', x: 80, y: 13 });
        assert.equal((await alice.wait('action')).accepted, false);
        const startX = state.players.find(player => player.id === alice.joined.playerId).x;
        for (let seq = 1; seq <= 48; seq += 2) {
            alice.send('inputs', { commands: [seq, seq + 1].map(seq => ({ seq, axis: 1, jumpPressed: false, jumpHeld: false })) });
            await pause(34);
        }
        const moved = await bob.wait('state', snapshot => snapshot.players.some(player => player.id === alice.joined.playerId && player.ack >= 46));
        const player = moved.players.find(player => player.id === alice.joined.playerId);
        assert(player.x > startX + 80); assert(player.x < startX + 300);
        alice.send('inputs', { commands: [{ seq: 49, axis: 0, jumpPressed: false, jumpHeld: false }] });
        await pause(200);
        const grounded = await alice.wait('state', snapshot => snapshot.players.some(player => player.id === alice.joined.playerId && player.ack === 49));
        const position = grounded.players.find(player => player.id === alice.joined.playerId);
        const tile = { x: Math.floor((position.x + 11) / 32), y: 13 };
        alice.send('action', { id: 2, kind: 'mine', ...tile });
        const action = await alice.wait('action', result => result.id === 2);
        assert.equal(action.accepted, true);
        const delta = await bob.wait('world'); assert.equal(delta.type, 'air');
        alice.send('action', { id: 2, kind: 'mine', ...tile });
        assert.equal((await alice.wait('action', result => result.id === 2)).revision, action.revision);
        const late = await connect(endpoint, { room: alice.joined.room, name: 'Late' }); peers.push(late);
        assert(!late.joined.blocks.some(block => block.x === tile.x && block.y === tile.y));
        alice.socket.close(); await pause(100);
        const resumed = await connect(endpoint, { room: alice.joined.room, resumeToken: alice.joined.resumeToken }); peers.push(resumed);
        assert.equal(resumed.joined.playerId, alice.joined.playerId); assert.equal(resumed.joined.resumed, true);
        console.log('PASS dedicated protocol: isolated rooms, authoritative motion/chat, reach, edits, idempotency, late join, resume');
    } finally { for (const peer of peers) peer.socket.close(); }
}

async function inspect(page) {
    await page.bringToFront();
    await page.evaluate(async () => { window.onlineCore = await import('gameforgejs/core'); });
    try {
        await page.waitForFunction(() => window.onlineCore.LevelHandler.current?.ui?.fields.name.rect.width > 200);
    } catch (error) {
        console.error('Lobby initialization', await page.evaluate(() => ({
            running: window.onlineCore.Engine.running, level: window.onlineCore.LevelHandler.current?.constructor.name,
            rect: window.onlineCore.LevelHandler.current?.ui?.fields.name.rect, canvases: document.querySelectorAll('canvas').length,
        })));
        throw error;
    }
}
async function field(page, name, text) {
    const box = await page.evaluate(name => window.onlineCore.LevelHandler.current.ui.fields[name].rect, name);
    await page.mouse.click(box.x + 10, box.y + 15);
    await page.locator('input[data-gameforge-input]').fill(text);
    await page.keyboard.press('Enter');
}
async function click(page, name) {
    const box = await page.evaluate(name => window.onlineCore.LevelHandler.current.ui.buttons[name].rect, name);
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

async function main() {
    const temporary = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'gameforge-online-'));
    const staticServer = await startServer({ root, port: 0 });
    const backendPort = staticServer.address().port + 1;
    const backend = spawn('dotnet', [path.join(root, 'servers/online-sandbox/bin/Debug/net10.0/GameForge.Online.Server.dll'), '--urls', `http://127.0.0.1:${backendPort}`],
        { cwd: root, windowsHide: true, env: { ...process.env, ALLOWED_ORIGINS: '*' }, stdio: ['ignore', 'pipe', 'pipe'] });
    let logs = ''; backend.stdout.on('data', chunk => { logs += chunk; }); backend.stderr.on('data', chunk => { logs += chunk; });
    let browser;
    try {
        let healthy = false;
        for (let attempt = 0; attempt < 100; attempt++) {
            try { healthy = (await fetch(`http://127.0.0.1:${backendPort}/health`)).ok; } catch { }
            if (healthy) break;
            await pause(100);
        }
        assert(healthy, logs);
        const endpoint = `ws://127.0.0.1:${backendPort}/ws`;
        await protocol(endpoint);
        const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
        browser = await chromium.launch({ headless: true, executablePath: process.env.GAMEFORGE_BROWSER || (fs.existsSync(edge) ? edge : undefined) });
        const errors = [];
        const a = await browser.newContext({ viewport: { width: 1000, height: 700 } });
        const b = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
        const alice = await a.newPage(), bob = await b.newPage();
        for (const page of [alice, bob]) {
            page.setDefaultTimeout(12000);
            page.on('pageerror', error => errors.push(error.stack));
        }
        const url = `http://127.0.0.1:${staticServer.address().port}/examples/online-sandbox-2d/?server=${encodeURIComponent(endpoint)}`;
        await alice.goto(url); await inspect(alice);
        await field(alice, 'name', 'Desktop'); await click(alice, 'create');
        await alice.waitForFunction(() => window.onlineCore.LevelHandler.current.playing);
        await verifyMotion(alice, root);
        const room = await alice.evaluate(() => window.onlineCore.LevelHandler.current.session.room);
        await bob.goto(`${url}&room=${room}`); await inspect(bob);
        await field(bob, 'name', 'Mobile'); await click(bob, 'join');
        await bob.waitForFunction(() => window.onlineCore.LevelHandler.current.playing);
        await bob.waitForFunction(() => window.onlineCore.LevelHandler.current.session.players.length === 2);
        console.log('PASS browser lobby join');
        await alice.bringToFront();
        const before = await alice.evaluate(() => window.onlineCore.LevelHandler.current.player.position.x);
        await alice.keyboard.down('d'); await pause(600); await alice.keyboard.up('d'); await pause(200);
        assert(await alice.evaluate(x => window.onlineCore.LevelHandler.current.player.position.x > x + 50, before));
        await alice.keyboard.press('Enter');
        await alice.locator('input[data-gameforge-input]').fill('Ready to build');
        await alice.keyboard.press('Enter');
        await bob.waitForFunction(() => window.onlineCore.LevelHandler.current.ui.messages.some(message => message.text === 'Ready to build'));
        await alice.keyboard.press('Escape');
        await alice.waitForFunction(() => window.onlineCore.LevelHandler.current.ui.paused);
        await click(alice, 'resume');
        await bob.bringToFront();
        const controls = await bob.evaluate(() => {
            const level = window.onlineCore.LevelHandler.current;
            return { stick: level.controls.stick, jump: level.controls.buttons.jump };
        });
        const cdp = await b.newCDPSession(bob);
        const start = await bob.evaluate(() => window.onlineCore.LevelHandler.current.player.position.x);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ id: 1, x: controls.stick.x, y: controls.stick.y }] });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ id: 1, x: controls.stick.x + 42, y: controls.stick.y }] });
        await pause(350);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ id: 1, x: controls.stick.x + 42, y: controls.stick.y },
            { id: 2, x: controls.jump.x + 20, y: controls.jump.y + 20 }] });
        await pause(180);
        assert(await bob.evaluate(x => window.onlineCore.LevelHandler.current.player.position.x > x + 30, start));
        assert(await bob.evaluate(() => !window.onlineCore.LevelHandler.current.player.motion.grounded));
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        fs.mkdirSync(path.join(root, 'test-results/browser'), { recursive: true });
        await bob.screenshot({ path: path.join(root, 'test-results/browser/online-mobile.png') });
        await alice.screenshot({ path: path.join(root, 'test-results/browser/online-desktop.png') });
        await click(bob, 'chat');
        await bob.locator('input[data-gameforge-input]').fill('Touch chat'); await bob.keyboard.press('Enter');
        await alice.waitForFunction(() => window.onlineCore.LevelHandler.current.ui.messages.some(message => message.text === 'Touch chat'));
        const chatFade = await alice.evaluate(() => {
            const level = window.onlineCore.LevelHandler.current, ui = level.ui;
            const original = ui.frame.Text; let rendered = [];
            ui.frame.Text = function(...args) { rendered.push(args[0]); return original.apply(this, args); };
            try {
                level.OnDrawn(); level.OnGUI();
                const visible = rendered.some(text => text.includes('Touch chat'));
                ui.Update(7); rendered = []; level.OnDrawn(); level.OnGUI();
                return visible && !rendered.some(text => text.includes('Touch chat'));
            } finally { ui.frame.Text = original; }
        });
        assert.equal(chatFade, true, 'Chat must leave canvas rendering after its inactivity fade');
        const identity = await bob.evaluate(() => window.onlineCore.LevelHandler.current.session.playerId);
        await bob.evaluate(() => window.onlineCore.LevelHandler.current.session.client.socket.close(4000, 'test connection loss'));
        await bob.waitForFunction(() => window.onlineCore.LevelHandler.current.session.status === 'reconnecting');
        await bob.waitForFunction(() => window.onlineCore.LevelHandler.current.session.status === 'online');
        assert.equal(await bob.evaluate(() => window.onlineCore.LevelHandler.current.session.playerId), identity);
        const invite = await bob.evaluate(() => window.onlineCore.LevelHandler.current.session.Invite());
        assert.equal(new URL(invite).searchParams.get('room'), room);
        assert.equal(new URL(invite).searchParams.get('server'), endpoint);
        assert(!invite.includes('resumeToken'));
        await inspectMobileViewport(bob, path.join(root, 'test-results/browser/online-mobile-safe-area.png'));
        await bob.setViewportSize({ width: 844, height: 390 });
        await pause(100);
        assert(await bob.evaluate(() => window.onlineCore.LevelHandler.current.screen.Width === 844));
        for (const page of [alice, bob]) {
            await page.evaluate(async () => { await window.onlineCore.Engine.Dispose(); });
            assert.equal(await page.locator('input[data-gameforge-input],canvas').count(), 0);
        }
        const output = build(path.join(root, 'examples/online-sandbox-2d'), { output: path.join(temporary, 'build') }).output;
        const portable = await startServer({ root: output, port: 0, basePath: '/play/' });
        try {
            const context = await browser.newContext({ viewport: { width: 960, height: 600 } });
            const page = await context.newPage(); page.setDefaultTimeout(12000);
            page.on('pageerror', error => errors.push(error.stack));
            await page.goto(`http://127.0.0.1:${portable.address().port}/play/?server=${encodeURIComponent(endpoint)}`);
            await inspect(page);
            await page.evaluate(() => {
                window.onlinePad = { buttons: [], axes: [0, 0, 0, 0] };
                Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [{ index: 0, id: 'Online test pad',
                    connected: true, mapping: 'standard', axes: window.onlinePad.axes,
                    buttons: Array.from({ length: 17 }, (_, index) => ({ pressed: window.onlinePad.buttons.includes(index), value: window.onlinePad.buttons.includes(index) ? 1 : 0 })) }] });
                window.onlinePad.buttons = [13];
            });
            await page.waitForFunction(() => window.onlineCore.LevelHandler.current.ui.selection === 1);
            await page.evaluate(() => window.onlinePad.buttons = []); await pause(80);
            await page.evaluate(() => window.onlinePad.buttons = [12]);
            await page.waitForFunction(() => window.onlineCore.LevelHandler.current.ui.selection === 0);
            await page.evaluate(() => window.onlinePad.buttons = []); await pause(80);
            await page.evaluate(() => window.onlinePad.buttons = [0]);
            await page.waitForFunction(() => window.onlineCore.LevelHandler.current.playing);
            await page.evaluate(() => { window.onlinePad.buttons = []; window.onlinePad.axes[0] = 0.9; });
            await page.waitForFunction(() => window.onlineCore.LevelHandler.current.player.position.x > 180);
            await page.evaluate(() => { window.onlinePad.axes[0] = 0; window.onlinePad.buttons = [9]; });
            await page.waitForFunction(() => window.onlineCore.LevelHandler.current.ui.paused);
            await page.evaluate(() => window.onlinePad.buttons = []); await pause(80);
            await page.evaluate(() => window.onlinePad.buttons = [0]);
            await page.waitForFunction(() => !window.onlineCore.LevelHandler.current.ui.paused);
            await page.evaluate(async () => { await window.onlineCore.Engine.Dispose(); });
            await context.close();
            const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
            const lobby = await mobile.newPage(); lobby.setDefaultTimeout(12000);
            lobby.on('pageerror', error => errors.push(error.stack));
            await lobby.goto(`http://127.0.0.1:${portable.address().port}/play/?server=${encodeURIComponent(endpoint)}`);
            await inspect(lobby);
            await inspectLobbyCaret(lobby);
            await inspectLandscapeLobby(lobby, path.join(root, 'test-results/browser/online-lobby-landscape-safe-area.png'));
            await lobby.evaluate(async () => { await window.onlineCore.Engine.Dispose(); });
            await mobile.close();
        } finally { await new Promise(resolve => portable.close(resolve)); }
        assert.deepEqual(errors, []);
        console.log('PASS source + portable clients: multiplayer, touch, safe areas, keyboard, caret blink/selection, landscape lobby, gamepad, disposal');
    } finally {
        await browser?.close(); backend.kill();
        await new Promise(resolve => staticServer.close(resolve));
        if (path.dirname(temporary) === fs.realpathSync(os.tmpdir()) && path.basename(temporary).startsWith('gameforge-online-')) {
            fs.rmSync(temporary, { recursive: true, force: true });
        }
    }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
