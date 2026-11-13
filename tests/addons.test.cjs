const test = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const source = name => import(pathToFileURL(path.resolve(__dirname, '../src/addons', name, 'index.js')).href);

test('states share no owner state, respect locks, transition in order and exit once on disposal', async () => {
    const { State, StateMachine } = await source('state-machine');
    const calls = [];
    class Logged extends State {
        Enter() { calls.push(`enter:${this.owner.id}`); }
        Update(dt) { calls.push(dt); }
        Exit() { calls.push(`exit:${this.owner.id}`); }
    }
    const a = new StateMachine({ id: 'a' }), b = new StateMachine({ id: 'b' });
    const first = new Logged(a.owner); first.locked = true;
    a.ChangeState(first); b.ChangeState(new Logged(b.owner));
    assert.equal(a.ChangeState(new Logged(a.owner)), false);
    a.Update(0.25);
    a.ChangeState(new Logged(a.owner), { force: true });
    a.Dispose(); a.Dispose(); b.Dispose();
    assert.deepEqual(calls, ['enter:a', 'enter:b', 0.25, 'exit:a', 'enter:a', 'exit:a', 'exit:b']);
});

test('invalid and reentrant state transitions fail without leaving transition lock stuck', async () => {
    const { State, StateMachine } = await source('state-machine');
    const machine = new StateMachine({});
    assert.throws(() => machine.ChangeState({}), /requires/);
    const state = new State(machine.owner);
    state.Enter = () => machine.ChangeState(new State(machine.owner));
    assert.throws(() => machine.ChangeState(state), /Enter\/Exit/);
    machine.Clear();
    assert.equal(machine.ChangeState(new State(machine.owner)), true);
});

test('parallax wraps camera offsets, restores context on draw failure and preserves borrowed resources', async () => {
    const { ParallaxLayer2D } = await source('parallax');
    const calls = [];
    const context = { save() { calls.push('save'); }, restore() { calls.push('restore'); }, drawImage(...args) { calls.push(args.slice(1)); } };
    const screen = { width: 100, height: 50, Context: context };
    const image = { width: 50, height: 50 };
    const layer = new ParallaxLayer2D(screen, { speedX: 10, scrollRatioX: 0.5 }, { image });
    layer.OnUpdate(1);
    layer.OnDrawn({ position: { x: 40, y: 0 } });
    assert.deepEqual(calls[1], [-10, 0, 50, 50]);
    assert.equal(calls.at(-1), 'restore');
    context.drawImage = () => { throw new Error('draw failed'); };
    assert.throws(() => layer.OnDrawn(), /draw failed/);
    assert.equal(calls.at(-1), 'restore');
    layer.Dispose(); layer.Dispose();
    assert.equal(screen.Context, context);
    assert.equal(image.width, 50);
    assert.throws(() => new ParallaxLayer2D(screen, { width: 0 }, { image }).OnDrawn(), /positive/);
});
