const assert = require('node:assert/strict');

async function inspectToonExploration(page, screenshotPath) {
    const result = await page.evaluate(async () => {
        const { LevelHandler } = await import('gameforgejs/core');
        const level = LevelHandler.current;
        level.RestartEncounter();
        const player = level.player;
        const step = count => {
            for (let i = 0; i < count; i++) level.OnFixedUpdate(1 / 60);
        };
        level.enemies[0].health.Damage(3, player);
        player.moveZ = -1;
        step(170);
        const traveled = player.transform.position[2] < -6;
        const nextEnemyAlive = level.enemies[1].health.IsAlive();
        level.OnDrawn();
        const cameraFollowed = level.camera.target[2] < -5;
        const forestArea = level.areaName;

        // One swing can hit two living targets, but cannot hit either twice.
        level.RestartEncounter();
        player.transform.SetPosition(0, 0.55, -10);
        const pair = level.enemies.slice(1, 3);
        pair[0].transform.SetPosition(-0.5, 0.55, -11.5);
        pair[1].transform.SetPosition(0.5, 0.55, -11.5);
        player.attackRequested = true;
        step(12);
        const pairHP = pair.map(enemy => enemy.health.hp);
        for (const enemy of pair) enemy.health.invulnerabilityTimer = 0;
        player.attack.TryHit();
        const repeatedHP = pair.map(enemy => enemy.health.hp);

        // Clearing every encounter is a HUD milestone, never a simulation stop.
        level.RestartEncounter();
        for (const enemy of level.enemies) enemy.health.Damage(3, player);
        player.moveZ = -1;
        step(400);
        level.OnDrawn();
        level.OnGUI();
        const cleared = {
            count: level.defeatedCount,
            result: level.result,
            z: player.transform.position[2],
            area: level.areaName,
        };
        const textured = level.scenery.every(prop => prop.materials.every(material => material.albedoMap?.ready));
        const bodiesBefore = level.physics.bodies.length;
        for (let i = 0; i < 3; i++) level.RestartEncounter();
        const reset = level.enemies.every(enemy => enemy.health.hp === 3 && enemy.body.enabled
            && enemy.spawn.every((value, index) => value === enemy.transform.position[index]));
        const bodiesStable = bodiesBefore === level.physics.bodies.length;
        player.transform.SetPosition(0, 0.55, -18);
        level.OnUpdate(0);
        level.OnDrawn();
        level.OnGUI();
        return { traveled, nextEnemyAlive, cameraFollowed, forestArea, pairHP, repeatedHP, cleared,
            textured, reset, bodiesStable, count: level.enemies.length, glError: level.renderer.gl.getError() };
    });
    assert.equal(result.count, 5);
    assert.equal(result.traveled, true, 'Player stopped after first kill');
    assert.equal(result.nextEnemyAlive, true);
    assert.equal(result.cameraFollowed, true);
    assert.equal(result.forestArea, 'Forest trail');
    assert.deepEqual(result.pairHP, [2, 2]);
    assert.deepEqual(result.repeatedHP, [2, 2]);
    assert.equal(result.cleared.count, 5);
    assert.equal(result.cleared.result, null);
    assert.ok(result.cleared.z < -20, 'Clearing all enemies stopped exploration');
    assert.equal(result.cleared.area, 'Old grove');
    assert.equal(result.textured, true);
    assert.equal(result.reset, true);
    assert.equal(result.bodiesStable, true);
    assert.equal(result.glError, 0);
    await page.screenshot({ path: screenshotPath });
}

module.exports = { inspectToonExploration };
