const assert = require('node:assert/strict');

async function inspectSkyTrailRoute(page) {
    const result = await page.evaluate(async () => {
        const level = (await import('gameforgejs/core')).LevelHandler.current;
        const player = level.player;
        const results = [];
        for (let index = 1; index < level.platforms.platforms.length; index++) {
            level.ResetGame();
            const previous = level.platforms.platforms[index - 1];
            const target = level.platforms.platforms[index];
            const [x,y,z] = previous.mesh.transform.position;
            player.model.SetPosition(x, y + previous.definition.size.y / 2 + 0.01, z);
            for (let i = 0; i < 12; i++) level.OnFixedUpdate(1 / 60);
            player.jumpBuffer = 0.12;
            let landed = false;
            for (let frame = 0; frame < 100; frame++) {
                const dx = target.mesh.transform.position[0] - player.model.transform.position[0];
                const dz = target.mesh.transform.position[2] - player.model.transform.position[2];
                const distance = Math.hypot(dx, dz);
                const strength = Math.min(1, distance / 0.9);
                player.input = { horizontal: distance ? dx / distance * strength : 0,
                    forward: distance ? -dz / distance * strength : 0, boost: true };
                level.OnFixedUpdate(1 / 60);
                if (player.body.grounded && player.body.groundBody === target.body) { landed = true; break; }
                if (level.falls) break;
            }
            results.push({ from: previous.definition.id, to: target.definition.id, landed });
        }
        level.ResetGame();
        return results;
    });
    assert.ok(result.every(jump => jump.landed), `Unreachable route segment: ${JSON.stringify(result.filter(jump => !jump.landed))}`);
}
module.exports = { inspectSkyTrailRoute };
