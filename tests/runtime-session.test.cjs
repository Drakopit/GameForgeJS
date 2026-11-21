const test = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { resolve } = require('node:path');

const source = name => import(pathToFileURL(resolve(__dirname, '../src', name)).href);

test('audio extension reuses a bootstrap-owned service without taking ownership', async () => {
    const { audioModule } = await source('core/index.js');
    const audio = { Initialize() { throw new Error('Already owned by bootstrap'); } };
    const context = {
        services: new Map([['audio', audio]]), assets: { audio },
        onDispose() { throw new Error('Must not dispose bootstrap audio twice'); },
    };
    assert.equal(audioModule().setup(context), undefined);
    assert.equal(context.services.get('audio'), audio);
    assert.equal(context.assets.audio, audio);
});

function scheduler() {
    let next = 0;
    const queued = new Map();
    return {
        queued,
        requestFrame(callback) { const id = ++next; queued.set(id, callback); return id; },
        cancelFrame(id) { queued.delete(id); },
        step(time) {
            const callbacks = [...queued.values()];
            queued.clear();
            callbacks.forEach(callback => callback(time));
        },
    };
}

test('all public runtime entrypoints import without browser globals', async () => {
    assert.equal(typeof globalThis.window, 'undefined');
    for (const name of ['core', '2d', '3d', 'network', 'compat']) await source(`${name}/index.js`);
    const { AudioManager } = await source('core/Audio/AudioManager.js');
    assert.equal(AudioManager._instance, null);
});

test('two games isolate config, assets, events and RAF; repeated start schedules once', async () => {
    const { createGame, Config, AssetManager } = await source('core/index.js');
    const clock = scheduler();
    const globalConfig = Config.data;
    const sharedAssets = AssetManager.instance;
    const a = createGame({ ...clock, config: { project: { name: 'A' }, data: { list: [{ x: 1 }] } } });
    const b = createGame({ ...clock, config: { project: { name: 'B' } } });
    const firstStart = a.start();
    assert.equal(a.start(), firstStart);
    await Promise.all([firstStart, b.start()]);
    assert.equal(clock.queued.size, 2);
    assert.notEqual(a.context.assets, b.context.assets);
    assert.notEqual(a.context.services, b.context.services);
    assert.equal(Config.data, globalConfig);
    assert.equal(AssetManager.instance, sharedAssets);
    a.context.config.screen.width = 9;
    assert.equal(b.context.config.screen.width, 640);
    a.context.assets.RegisterJson('only-a', '/a.json', { lazy: true });
    assert.equal(b.context.assets.registry.size, 0);
    let framesA = 0, framesB = 0;
    a.events.on('render', () => framesA++);
    b.events.on('render', () => framesB++);
    clock.step(0);
    assert.deepEqual([framesA, framesB], [1, 1]);
    a.stop();
    clock.step(20);
    assert.deepEqual([framesA, framesB], [1, 2]);
    await a.start();
    assert.equal(clock.queued.size, 2);
    await a.dispose();
    assert.equal(clock.queued.size, 1);
    clock.step(40);
    assert.equal(framesB, 3);
    await b.dispose();
    assert.equal(clock.queued.size, 0);
    await assert.rejects(a.start(), /disposed/);
});

test('module graph runs dependencies first and tears down in reverse order', async () => {
    const { createGame } = await source('core/index.js');
    const calls = [];
    const dependency = { id: 'base', setup: () => { calls.push('base'); return () => calls.push('-base'); } };
    const feature = { id: 'feature', requires: ['base'], setup: () => { calls.push('feature'); return () => calls.push('-feature'); } };
    const game = createGame({ ...scheduler(), modules: [feature, dependency] });
    await game.start();
    assert.deepEqual(calls, ['base', 'feature']);
    await game.dispose();
    await game.dispose();
    assert.deepEqual(calls, ['base', 'feature', '-feature', '-base']);
});

test('invalid module graphs fail before side effects; partial setup rolls back', async () => {
    const { createGame } = await source('core/index.js');
    let setups = 0;
    const module = { id: 'a', requires: ['missing'], setup() { setups++; } };
    await assert.rejects(createGame({ ...scheduler(), modules: [module] }).start(), /Missing game module/);
    await assert.rejects(createGame({ ...scheduler(), modules: [{ ...module, requires: ['b'] }, { id: 'b', requires: ['a'], setup() {} }] }).start(), /cycle/);
    await assert.rejects(createGame({ ...scheduler(), modules: [module, module] }).start(), /Duplicate/);
    assert.equal(setups, 0);
    const calls = [];
    const game = createGame({ ...scheduler(), modules: [
        { id: 'a', setup() { calls.push('a'); return () => calls.push('-a'); } },
        { id: 'b', requires: ['a'], setup(context) { context.onDispose(() => calls.push('-b')); calls.push('b'); throw new Error('setup failed'); } },
    ] });
    await assert.rejects(game.start(), /setup failed/);
    assert.deepEqual(calls, ['a', 'b', '-b', '-a']);
    assert.equal(game.state, 'disposed');
    assert.equal(game.context.assets.disposed, true);
});

test('dispose during async startup waits, cancels RAF and cleans resources', async () => {
    const { createGame } = await source('core/index.js');
    const clock = scheduler();
    let release;
    let cleaned = 0;
    const setup = new Promise(resolve => { release = resolve; });
    const game = createGame({ ...clock, modules: [{ id: 'slow', async setup() { await setup; return () => cleaned++; } }] });
    const starting = game.start();
    const disposing = game.dispose();
    release();
    await Promise.all([starting, disposing]);
    assert.equal(game.state, 'disposed');
    assert.equal(clock.queued.size, 0);
    assert.equal(cleaned, 1);
});

test('level starts entities once, destroys on removal and cleans survivors', async () => {
    const { Level } = await source('core/index.js');
    const level = new Level();
    let starts = 0, destroys = 0;
    const entity = { OnStart() { starts++; }, OnDestroy() { destroys++; } };
    level.AddEntity(entity);
    assert.equal(starts, 0);
    level.OnStart();
    level.OnStart();
    assert.equal(starts, 1);
    level.RemoveEntity(entity);
    level.RemoveEntity(entity);
    assert.equal(destroys, 1);
    level.AddEntity({ OnStart() { starts++; }, OnDestroy() { destroys++; } });
    assert.equal(starts, 2);
    level.OnDestroy();
    level.OnDestroy();
    assert.equal(destroys, 2);
});

test('attached transform reads and writes one canonical owner position', async () => {
    const { TransformComponent, VelocityComponent } = await source('core/index.js');
    const owner = { position: { x: 2, y: 3 }, GetComponent: () => transform };
    const transform = new TransformComponent({ x: 10, y: 20 });
    transform.Attach(owner);
    assert.deepEqual(owner.position, { x: 10, y: 20 });
    owner.position.x = 40;
    assert.equal(transform.x, 40);
    transform.y = 50;
    assert.equal(owner.position.y, 50);
    const velocity = new VelocityComponent({ vx: 5 });
    velocity.Attach(owner);
    velocity.OnUpdate(1);
    assert.equal(transform.x, 45);
    transform.Detach();
    owner.position.x = 80;
    assert.equal(transform.x, 45);
});

test('level transitions destroy old entities and reentry initializes new entities exactly once', async () => {
    const { createGame, Level } = await source('core/index.js');
    const clock = scheduler();
    let starts = 0, destroys = 0, exits = 0;
    class First extends Level {
        OnStart(context) {
            this.AddEntity({ OnStart() { starts++; }, OnDestroy() { destroys++; } });
            super.OnStart(context);
        }
        OnExit() { exits++; super.OnExit(); }
    }
    const first = new First(), second = new Level();
    const game = createGame({ ...clock, levels: [first, second] });
    await game.start();
    assert.equal(starts, 1);
    first.Next = true;
    clock.step(0);
    assert.equal(destroys, 1);
    second.Next = true;
    clock.step(20);
    assert.equal(starts, 2);
    await game.dispose();
    assert.equal(destroys, 2);
    assert.equal(exits, 2);
});

test('input and action maps are isolated by game target and disposed independently', async () => {
    const { createGame, inputModule, Input } = await source('core/index.js');
    const targetA = new EventTarget();
    const targetB = new EventTarget();
    const clock = scheduler();
    const config = { input: { actionMappings: { JUMP: [Input.Keyboard('Space')] } } };
    const a = createGame({ ...clock, config, modules: [inputModule({ target: targetA })] });
    const b = createGame({ ...clock, config, modules: [inputModule({ target: targetB })] });
    await Promise.all([a.start(), b.start()]);
    const key = new Event('keydown');
    key.code = 'Space';
    targetA.dispatchEvent(key);
    clock.step(0);
    assert.equal(a.context.services.get('actions').IsAction('JUMP'), true);
    assert.equal(b.context.services.get('actions').IsAction('JUMP'), false);
    assert.equal(Input.instance, null);
    const inputA = a.context.services.get('input');
    await a.dispose();
    targetA.dispatchEvent(key);
    assert.equal(inputA.GetKey('Space'), false);
    await b.dispose();
});

test('custom asset loaders are scoped, cached, and unregistered with game disposal', async () => {
    const { createGame } = await source('core/index.js');
    let loads = 0;
    const game = createGame({ ...scheduler(), modules: [{ id: 'data', setup(context) {
        context.registerAssetLoader('custom', async entry => { loads++; return { source: entry.path }; });
    } }] });
    await game.start();
    game.context.assets.RegisterAsset('custom', 'item', '/test');
    const a = await game.context.assets.LoadAsset('item', 'custom');
    const b = await game.context.assets.LoadAsset('item', 'custom');
    assert.equal(a, b);
    assert.equal(loads, 1);
    await game.dispose();
    assert.equal(game.context.assets.loaders.size, 0);
});

test('module2D and networkModule create concrete services with cleanup', async () => {
    const { createGame, EventEmitter } = await source('core/index.js');
    const { module2D } = await source('2d/index.js');
    const { networkModule } = await source('network/index.js');
    const drawing = {};
    class Adapter extends EventEmitter {
        connect() { this.IsConnected = true; this.emit('open'); }
        disconnect() { this.IsConnected = false; }
        send() { return true; }
    }
    const adapter = new Adapter();
    const game = createGame({ ...scheduler(), canvas: { getContext: () => drawing }, modules: [module2D(), networkModule({ adapter, autoConnect: true })] });
    await game.start();
    assert.equal(game.context.services.get('renderer2d'), drawing);
    assert.equal(game.context.services.get('network').IsConnected, true);
    await game.dispose();
    assert.equal(adapter.IsConnected, false);
    assert.deepEqual(adapter.listeners, {});
});

function webglMock() {
    const live = new Set();
    const api = new Proxy({ live, canvas: { width: 640, height: 480 }, drawingBufferWidth: 640, drawingBufferHeight: 480 }, {
        get(target, key) {
            if (key in target) return target[key];
            if (String(key).startsWith('create')) return () => { const resource = { kind: key }; live.add(resource); return resource; };
            if (String(key).startsWith('delete')) return resource => live.delete(resource);
            if (key === 'getShaderParameter' || key === 'getProgramParameter') return () => true;
            if (key === 'getUniformLocation') return () => ({});
            if (key === 'getExtension') return () => null;
            if (key === 'checkFramebufferStatus') return () => 'FRAMEBUFFER_COMPLETE';
            if (/^[A-Z_0-9]+$/.test(String(key))) return key;
            return () => {};
        },
    });
    return api;
}

test('3D module registers model loaders and releases actual renderer GPU resources', async () => {
    const { createGame } = await source('core/index.js');
    const { module3D, Scene3D, PerspectiveCamera, Mesh, PrimitiveMesh, StandardMaterial } = await source('3d/index.js');
    const gl = webglMock();
    const canvas = { width: 640, height: 480, clientWidth: 640, clientHeight: 480, getContext: () => gl };
    const game = createGame({ ...scheduler(), canvas, modules: [module3D()] });
    await game.start();
    assert.equal(game.context.assets.loaders.has('model'), true);
    const renderer = game.context.services.get('renderer3d');
    const scene = new Scene3D();
    scene.Add(new Mesh({ geometry: PrimitiveMesh.Cube(), material: new StandardMaterial() }));
    renderer.Render(scene, new PerspectiveCamera());
    assert.ok([...gl.live].some(resource => resource.kind === 'createBuffer'));
    await game.dispose();
    assert.equal(gl.live.size, 0);
    assert.equal(game.context.assets.loaders.size, 0);
});

test('textures allocate independently for different WebGL contexts', async () => {
    const { Texture } = await source('3d/index.js');
    const first = webglMock(), second = webglMock();
    const texture = new Texture();
    const a = texture.Upload(first, {});
    const b = texture.Upload(second, {});
    assert.notEqual(a, b);
    assert.equal(texture.EnsureGPU(first), a);
    assert.equal(texture.EnsureGPU(second), b);
    texture.Dispose(first);
    assert.equal(first.live.size, 0);
    assert.equal(second.live.size, 1);
    texture.Dispose(second);
    assert.equal(second.live.size, 0);
});

test('legacy engine repeated start and resume do not create multiple RAF chains', async () => {
    const { Engine, LevelHandler } = await source('core/index.js');
    const clock = scheduler();
    globalThis.window = clock;
    window.requestAnimationFrame = clock.requestFrame;
    window.cancelAnimationFrame = clock.cancelFrame;
    let starts = 0, destroys = 0;
    try {
        LevelHandler.addLevel({ OnStart() { starts++; }, OnDestroy() { destroys++; } });
        Engine.OnStart(); Engine.OnStart();
        assert.equal(clock.queued.size, 1);
        assert.equal(starts, 1);
        Engine.Stop();
        assert.equal(clock.queued.size, 0);
        Engine.OnStart();
        assert.equal(starts, 1);
        await Engine.Dispose();
        assert.equal(clock.queued.size, 0);
        assert.equal(destroys, 1);
    } finally { delete globalThis.window; }
});
