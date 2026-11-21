const assert = require('node:assert/strict');
async function inspectToonSandbox(page, screenshotPath) {
    const result = await page.evaluate(async () => {
        const { Engine, LevelHandler, Vector3D } = await import('gameforgejs/core');
        Engine.Stop(); const level = LevelHandler.current; level.RestartEncounter();
        const player = level.player;
        const origin = level.warpPoints[0];
        const destination = level.warpPoints.find(point => point.definition.id === origin.definition.destination);
        player.transform.SetPosition(origin.position.x, 0.55, origin.position.z);
        level.OnFixedUpdate(1 / 60);
        const arrivalArea = level.areaName;
        const arrived = Vector3D.FromArray(player.transform.position).DistanceTo(new Vector3D(destination.position.x, 0.55, destination.position.z)) < 0.1;
        for (let i = 0; i < 180; i++) level.OnFixedUpdate(1 / 60);
        const noBounce = level.warpTravel.trips === 1 && level.warpTravel.arrival === destination;
        player.transform.SetPosition(destination.position.x + 2, 0.55, destination.position.z);
        level.OnFixedUpdate(1 / 60);
        player.transform.SetPosition(destination.position.x, 0.55, destination.position.z);
        level.OnFixedUpdate(1 / 60);
        const returned = level.warpTravel.trips === 2;
        const bodies = level.physics.bodies.length;
        let wetLakes = 0;
        for (const lake of level.lakes.slice(1)) {
            const center = Vector3D.FromArray(lake.definition.position);
            player.transform.SetPosition(center.x, 0.55, center.z);
            player.waterContact.OnFixedUpdate();
            if (player.waterContact.zone === lake) wetLakes++;
        }
        level.RestartEncounter();
        const reset = level.warpTravel.trips === 0 && !level.warpTravel.arrival && level.physics.bodies.length === bodies;
        // Death cannot trigger a pad. No reset of defeated sentries is part of travel.
        player.health.hp = 0; player.transform.SetPosition(origin.position.x, 0.55, origin.position.z);
        level.warpTravel.OnFixedUpdate(1 / 60);
        const deadBlocked = level.warpTravel.trips === 0;
        level.RestartEncounter();
        player.transform.SetPosition(-7, 0.55, -8);
        level.OnUpdate(0); level.OnDrawn(); level.OnGUI();
        return { arrivalArea, arrived, noBounce, returned, wetLakes, reset, deadBlocked,
            largeLakes: level.lakes.filter(lake => lake.definition.width * lake.definition.depth >= 200).length,
            pads: level.warpPoints.length, glError: level.renderer.gl.getError() };
    });
    for (const key of ['arrived', 'noBounce', 'returned', 'reset', 'deadBlocked']) assert.equal(result[key], true, key);
    assert.equal(result.arrivalArea, 'Azure Lake');
    assert.equal(result.wetLakes, 2); assert.equal(result.largeLakes, 2); assert.equal(result.pads, 4); assert.equal(result.glError, 0);
    await page.screenshot({ path: screenshotPath });
}
module.exports = { inspectToonSandbox };
