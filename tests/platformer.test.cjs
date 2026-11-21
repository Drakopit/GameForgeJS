const test = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
globalThis.Image = class { constructor() { this.width = 0; this.height = 0; } };
const source = file => import(pathToFileURL(path.resolve(__dirname, '../src', file)).href);

async function fixture(settings = {}, solid = (x, y) => y >= 6) {
    const { PlatformerController, TilePlatformerWorld } = await source('addons/platformer/index.js');
    const { GameObject } = await source('2d/index.js');
    const world = new TilePlatformerWorld({ tileSize: 32, worldWidth: 20, worldHeight: 10, getTile: solid });
    const actor = new GameObject();
    actor.position.x = 64; actor.position.y = 168;
    actor.size.x = 24; actor.size.y = 24;
    const movement = actor.AddComponent(new PlatformerController({ world, input: null, ...settings }));
    const step = (count = 1, dt = 1 / 120) => { for (let i = 0; i < count; i++) actor.OnFixedUpdate(dt); };
    step();
    return { actor, movement, world, step };
}

test('platformer component lands, stops against tiles, and leaves owner position canonical', async () => {
    const { actor, movement, step } = await fixture({}, (x, y) => y >= 6 || x === 8);
    assert.equal(movement.grounded, true);
    movement.SetInput({ axis: 1 }); step(240);
    assert.equal(actor.position.x, 8 * 32 - actor.size.x);
    assert.equal(actor.position.y, 168);
    assert.equal(movement.vx, 0);
    assert.equal(movement.grounded, true);
    movement.SetInput({ axis: -1 }); step(240);
    assert.equal(actor.position.x, 0);
    assert.equal(movement.vx, 0);
});

test('jump release produces a lower apex; holding does not auto-jump again', async () => {
    async function apex(release) {
        const { actor, movement, step } = await fixture();
        movement.SetInput({ jumpPressed: true, jumpHeld: true }); step();
        let highest = actor.position.y;
        for (let i = 0; i < 180; i++) {
            movement.SetInput({ jumpHeld: !release }); step();
            highest = Math.min(highest, actor.position.y);
        }
        assert.equal(movement.grounded, true);
        assert.equal(actor.position.y, 168);
        return highest;
    }
    assert.ok(await apex(false) < await apex(true) - 30);
});

test('coyote time permits a late ledge jump but expires and cannot enable a second jump', async () => {
    const f = await fixture({}, (x, y) => x < 4 && y >= 6);
    f.movement.SetInput({ axis: 1 });
    while (f.movement.grounded) f.step();
    f.step(3);
    f.movement.SetInput({ jumpPressed: true, jumpHeld: true }); f.step();
    assert.ok(f.movement.vy < 0);
    const velocity = f.movement.vy;
    f.movement.SetInput({ jumpPressed: true, jumpHeld: true }); f.step();
    assert.ok(f.movement.vy > velocity, 'Air press must not reset upward velocity');
    const expired = await fixture({}, (x, y) => x < 4 && y >= 6);
    expired.movement.SetInput({ axis: 1 });
    while (expired.movement.grounded) expired.step();
    expired.step(20);
    expired.movement.SetInput({ jumpPressed: true, jumpHeld: true }); expired.step();
    assert.ok(expired.movement.vy > 0);
});

test('buffered jump fires on landing, expires in the air and survives render frames without a fixed step', async () => {
    const f = await fixture();
    f.actor.position.y = 160; f.movement.Reset(); f.movement.vy = 200;
    f.movement.SetInput({ jumpPressed: true, jumpHeld: true });
    f.movement.SetInput({ jumpHeld: true }); // Another render before physics.
    f.step(5);
    assert.ok(f.movement.vy < 0);
    assert.equal(f.movement.bufferRemaining, 0);
    const expired = await fixture({ jumpBufferTime: 0.01 });
    expired.actor.position.y = 20; expired.movement.Reset();
    expired.movement.SetInput({ jumpPressed: true, jumpHeld: true }); expired.step(150);
    assert.equal(expired.movement.grounded, true);
    assert.equal(expired.actor.position.y, 168);
});

test('tile substeps retain ground contact and prevent high speed wall/floor tunneling', async () => {
    const { world } = await fixture({}, (x, y) => y >= 6 || x === 8);
    const body = { x: 64, y: 20, width: 24, height: 24, vx: 4000, vy: 4000 };
    const result = world.Move(body, 0.1);
    assert.equal(body.x, 232);
    assert.equal(body.y, 168);
    assert.equal(result.grounded, true);
    assert.equal(body.vy, 0);
});

test('reset/detach clear pending jumps and invalid configuration fails explicitly', async () => {
    const { actor, movement, world } = await fixture();
    movement.SetInput({ axis: 1, jumpPressed: true, jumpHeld: true });
    actor.RemoveComponent(movement);
    assert.equal(movement.owner, null);
    assert.equal(movement.jumpPending, false);
    assert.equal(movement.vx, 0);
    const { PlatformerController, TilePlatformerWorld } = await source('addons/platformer/index.js');
    assert.throws(() => new PlatformerController({ world, coyoteTime: -1 }), /nonnegative/);
    assert.throws(() => new TilePlatformerWorld({ tileSize: 0, getTile() {} }), /tileSize/);
    assert.throws(() => new PlatformerController({ world }).Attach({}), /positive width/);
});
