const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const source = file => import(pathToFileURL(path.resolve('src', file)));

test('remote interpolation applies discrete flags from the newest state', async () => {
    const { OnlinePlayerManager } = await source('network/Online/OnlinePlayerManager.js');
    const subscribe = () => () => {};
    const manager = new OnlinePlayerManager({ onPeerJoined: subscribe, onPeerUpdated: subscribe,
        onPeerLeft: subscribe, onPlayerStateReceived: subscribe });
    manager.updateState('other', { x: 0, y: 0, facingRight: true, action: 'idle' });
    manager.updateState('other', { x: 100, facingRight: false, action: 'mine' });
    manager.update(1 / 60);
    const [player] = manager.getPlayers();
    assert(player.x > 0 && player.x < 100);
    assert.equal(player.facingRight, false); assert.equal(player.action, 'mine');
    manager.dispose();
});

test('an unchanged entity snapshot retries after a failed transport send', async () => {
    const { OnlineEntitySync } = await source('network/Online/OnlineEntitySync.js');
    let connected = false, sends = 0;
    const sync = new OnlineEntitySync({ sendPlayerState: () => { sends++; return connected; } }, { readState: () => ({ x: 10 }) });
    assert.equal(sync.update(1), false); assert.equal(sync.lastState, null);
    connected = true;
    assert.equal(sync.update(1), true); assert.deepEqual(sync.lastState, { x: 10 });
    assert.equal(sync.update(1), false); assert.equal(sends, 2);
});

test('platformer state restore reproduces a jump after rewinding position and timers', async () => {
    globalThis.Image ??= class {};
    const { PlatformerController, TilePlatformerWorld } = await source('addons/platformer/index.js');
    const { GameObject } = await source('2d/index.js');
    const world = new TilePlatformerWorld({ tileSize: 32, worldWidth: 20, worldHeight: 10, getTile: (x, y) => y >= 6 });
    const actor = new GameObject(); actor.position.Set(64, 168); actor.size.Set(24, 24);
    const motion = actor.AddComponent(new PlatformerController({ world, input: null }));
    actor.OnFixedUpdate(1 / 60);
    motion.SetInput({ axis: 1, jumpPressed: true, jumpHeld: true });
    const before = { x: actor.position.x, y: actor.position.y, state: motion.CaptureState() };
    actor.OnFixedUpdate(1 / 60);
    const expected = { x: actor.position.x, y: actor.position.y, state: motion.CaptureState() };
    actor.position.Set(before.x, before.y); motion.RestoreState(before.state); actor.OnFixedUpdate(1 / 60);
    assert.deepEqual({ x: actor.position.x, y: actor.position.y, state: motion.CaptureState() }, expected);
    assert.throws(() => motion.RestoreState({ ...before.state, vx: NaN }), /Invalid/);
    actor.OnDestroy();
});
