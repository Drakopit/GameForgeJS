const test = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const core = () => import(pathToFileURL(path.resolve('src/core/index.js')));

function scheduler() {
    const callbacks = new Map();
    let next = 0;
    return {
        requestFrame(fn) { const id = ++next; callbacks.set(id, fn); return id; },
        cancelFrame(id) { callbacks.delete(id); },
        step(time) { const current = [...callbacks.values()]; callbacks.clear(); current.forEach(fn => fn(time)); },
    };
}

test('class module imports share instances, validate declarations and never instantiate scene classes', async () => {
    const { Module, resolveModules } = await core();
    class Actor { constructor() { throw new Error('Declarations are not scene factories'); } }
    class Shared extends Module { constructor() { super('shared', { declarations: [Actor], exports: [Actor] }); } }
    class Left extends Module { constructor() { super('left', { imports: [Shared], exports: [Actor] }); } }
    class Right extends Module { constructor() { super('right', { imports: [Shared] }); } }
    class Root extends Module { constructor() { super('root', { imports: [Left, Right] }); } }
    assert.deepEqual(resolveModules([Root]).map(module => module.id), ['shared', 'left', 'right', 'root']);
    class Private extends Module { constructor() { super('private', { imports: [Right], exports: [Actor] }); } }
    assert.throws(() => resolveModules([Private]), /private class/);
    assert.throws(() => resolveModules([new Module('a', { declarations: [Actor] }), new Module('b', { declarations: [Actor] })]), /belongs to both/);
    class A extends Module { constructor() { super('a', { imports: [B] }); } }
    class B extends Module { constructor() { super('b', { imports: [A] }); } }
    assert.throws(() => resolveModules([A]), /cycle/);
});

test('class modules follow setup, asset-ready start, frame hooks and one reverse cleanup', async () => {
    const { Module, createGame, Level } = await core();
    const calls = [];
    class Feature extends Module {
        constructor() { super('feature'); }
        OnSetup(context) { context.services.set('feature', this); calls.push('setup'); }
        OnStart(context) { assert.equal(context.services.get('ready'), true); calls.push('start'); }
        OnUpdate(dt) { assert.ok(dt >= 0); calls.push('update'); }
        OnFixedUpdate() { calls.push('fixed'); }
        OnDrawn() { calls.push('draw'); }
        OnGUI() { calls.push('gui'); }
        OnDestroy() { calls.push('destroy'); }
    }
    class Scene extends Level { OnStart(context) { super.OnStart(context); calls.push('scene'); } }
    const timer = scheduler();
    const module = new Feature();
    const game = createGame({ ...timer, modules: [module], levels: [new Scene()], beforeStart: context => context.services.set('ready', true) });
    await game.start();
    assert.deepEqual(calls, ['setup', 'start', 'scene']);
    timer.step(0); timer.step(20);
    for (const hook of ['update', 'fixed', 'draw', 'gui']) assert.ok(calls.includes(hook), hook);
    const count = calls.length;
    module.enabled = false;
    timer.step(40);
    assert.equal(calls.length, count);
    await game.dispose(); await game.dispose();
    assert.equal(calls.filter(call => call === 'destroy').length, 1);
    assert.equal(module.context, null);
    assert.equal(module.started, false);
    assert.deepEqual(game.events.listeners, {});
});

test('module failures clean partial setup/start and detach frame hooks', async () => {
    const { Module, createGame } = await core();
    for (const hook of ['OnSetup', 'OnStart']) {
        let destroyed = 0;
        class Broken extends Module {
            constructor() { super('broken'); }
            OnDestroy() { destroyed++; }
        }
        Broken.prototype[hook] = () => { throw new Error('failure'); };
        const instance = new Broken();
        const game = createGame({ ...scheduler(), modules: [instance] });
        await assert.rejects(game.start(), /failure/);
        assert.equal(destroyed, 1);
        assert.equal(instance.context, null);
        assert.deepEqual(game.events.listeners, {});
    }
});

test('class lifecycle hooks run on the established Engine loop used by BootstrapGame', async () => {
    const { Module, Engine, LevelHandler } = await core();
    const timer = scheduler();
    const previousWindow = globalThis.window;
    globalThis.window = { requestAnimationFrame: timer.requestFrame, cancelAnimationFrame: timer.cancelFrame };
    const calls = [];
    class Probe extends Module {
        constructor() { super('probe'); }
        OnUpdate() { calls.push('update'); }
        OnFixedUpdate() { calls.push('fixed'); }
        OnDrawn() { calls.push('draw'); }
        OnGUI() { calls.push('gui'); }
        OnDestroy() { calls.push('destroy'); }
    }
    try {
        await Engine.Dispose();
        const context = { events: Engine.events, onDispose: cleanup => Engine.cleanups.push(cleanup) };
        const module = new Probe();
        await module.setup(context);
        await module.Start();
        LevelHandler.addLevel({ OnStart() {} });
        Engine.OnStart();
        timer.step(performance.now() + 40);
        for (const hook of ['update', 'fixed', 'draw', 'gui']) assert.ok(calls.includes(hook), hook);
        await Engine.Dispose();
        assert.equal(calls.filter(call => call === 'destroy').length, 1);
        assert.deepEqual(Engine.events.listeners, {});
    } finally {
        await Engine.Dispose();
        if (previousWindow === undefined) delete globalThis.window;
        else globalThis.window = previousWindow;
    }
});
