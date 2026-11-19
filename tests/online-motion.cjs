const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');

async function verifyMotion(page, root) {
    const commands = Array.from({ length: 1800 }, (_, index) => ({ seq: index + 1,
        axis: index < 900 ? 1 : index < 1400 ? -1 : 0,
        jumpPressed: index % 75 === 0, jumpHeld: index % 75 < (index % 150 === 0 ? 8 : 24) }));
    const directory = path.join(root, 'test-results/online');
    fs.mkdirSync(directory, { recursive: true });
    const fixture = path.join(directory, 'commands.json');
    fs.writeFileSync(fixture, JSON.stringify(commands));
    const output = execFileSync('dotnet', [path.join(root, 'tests/online-motion/bin/Debug/net10.0/OnlineMotion.dll'),
        path.join(root, 'examples/online-sandbox-2d/config/world.rules.json'), fixture], { windowsHide: true, encoding: 'utf8' });
    const server = JSON.parse(output);
    const client = await page.evaluate(async commands => {
        const { GameObject } = await import('gameforgejs/2d');
        const { PlatformerController, TilePlatformerWorld } = await import('gameforgejs/addons/platformer');
        const level = window.onlineCore.LevelHandler.current, rules = level.rules;
        const actor = new GameObject(); actor.position.Set(rules.spawnX, rules.spawnY); actor.size.Set(rules.playerWidth, rules.playerHeight);
        const world = new TilePlatformerWorld({ tileSize: rules.tileSize, worldWidth: rules.width, worldHeight: rules.height,
            getTile: (x, y) => level.session.blocks.get(`${x},${y}`) });
        const controller = actor.AddComponent(new PlatformerController({ world, input: null, ...rules.movement }));
        const frames = [];
        for (const command of commands) {
            controller.SetInput(command); actor.OnFixedUpdate(1 / rules.tickRate);
            if (actor.position.y > rules.height * rules.tileSize + 128) { actor.position.Set(rules.spawnX, rules.spawnY); controller.Reset(); }
            frames.push({ x: actor.position.x, y: actor.position.y, ...controller.CaptureState() });
        }
        actor.OnDestroy(); return frames;
    }, commands);
    for (let index = 0; index < commands.length; index++) {
        for (const field of ['x', 'y', 'vx', 'vy', 'coyoteRemaining', 'bufferRemaining']) {
            assert(Math.abs(server[index][field] - client[index][field]) < 1e-6,
                `Motion parity frame ${index} ${field}: C#=${server[index][field]}, JS=${client[index][field]}`);
        }
        assert.equal(server[index].grounded, client[index].grounded, `Motion parity grounded at ${index}`);
    }
    console.log('PASS C#/platformer parity: 1800 deterministic steps, jumps, collisions, boundaries and respawn');
}
module.exports = { verifyMotion };
