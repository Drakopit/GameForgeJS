const test = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
async function fixture() {
    const { EnemyBrain } = await import(pathToFileURL(path.resolve('examples/platform-adventure-2d/src/ai/EnemyBrain.js')));
    const owner = { position: { x: 100, y: 100 }, size: { x: 32, y: 48 }, spawn: { x: 100, y: 100 },
        facingRight: true, isGrounded: true, speed: 100, aggroRange: 220, stopDistance: 45,
        config: { ai: { patrolRadius: 60, patrolSpeed: 0.4, leashRange: 300, memorySeconds: 1.5,
            sightHeight: 100, homeTolerance: 8, edgeLookahead: 12, maxDrop: 26, floorTolerance: 4 } },
        player: { hp: 10, position: { x: 200, y: 100 }, size: { x: 32, y: 48 } },
        level: { blocks: [{ position: { x: 0, y: 148 }, size: { x: 1000, y: 30 } }], GameWorld: { width: 1000 } } };
    return { owner, brain: new EnemyBrain(owner) };
}
test('enemy perception respects occlusion/height, remembers briefly and returns within a leash', async () => {
    const { owner, brain } = await fixture();
    brain.Update(0.1); assert.equal(brain.mode, 'chase');
    const wall = { position: { x: 170, y: 80 }, size: { x: 20, y: 100 } };
    owner.level.blocks.push(wall);
    brain.Update(0.1); assert.equal(brain.seesPlayer, false); assert.equal(brain.mode, 'search');
    assert.equal(brain.lastKnownX, 200);
    brain.Update(2); assert.equal(brain.mode, 'patrol');
    owner.level.blocks.pop(); owner.player.position.y = -100;
    assert.equal(brain.CanSee(owner.player), false);
    owner.position.x = 450; brain.Update(0.1); assert.equal(brain.mode, 'return');
    owner.position.x = 250; brain.Update(0.1); assert.equal(brain.mode, 'return');
    owner.position.x = 105; brain.Update(0.1); assert.equal(brain.mode, 'patrol');
    owner.player.hp = 0; brain.Reset(); brain.Update(0.1); assert.equal(brain.seesPlayer, false);
});
test('enemy steering patrols, reverses at unsafe edges, blocks walls and holds combat spacing', async () => {
    const { owner, brain } = await fixture();
    assert.equal(brain.Move(0.1), true); assert.equal(owner.position.x, 104);
    owner.position.x = 164; brain.Move(0.1); assert.equal(brain.patrolDirection, -1);
    owner.position.x = 100; brain.patrolDirection = 1; owner.level.blocks[0].size.x = 140;
    assert.equal(brain.Move(0.1), false); assert.equal(brain.patrolDirection, -1);
    owner.level.blocks[0].size.x = 1000; owner.player.position.x = 200;
    brain.Update(0.1); owner.level.blocks.push({ position: { x: 133, y: 90 }, size: { x: 20, y: 80 } });
    assert.equal(brain.Move(0.1), false); assert.equal(owner.position.x, 100);
    brain.mode = 'patrol'; brain.patrolDirection = 1;
    assert.equal(brain.Move(0.1), false); assert.equal(brain.patrolDirection, -1);
    owner.level.blocks.pop(); owner.player.position.x = 140; brain.Update(0.1);
    assert.equal(brain.Move(0.1), false);
    owner.isGrounded = false; brain.mode = 'patrol'; assert.equal(brain.Move(0.1), false);
});
