const assert = require('node:assert/strict');

async function inspectToonWater(page, screenshotPath) {
    const result = await page.evaluate(async () => {
        const { Engine, LevelHandler } = await import('gameforgejs/core');
        Engine.Stop();
        const level = LevelHandler.current;
        level.RestartEncounter();
        const pond = level.pond;
        const surface = pond.surface;
        const geometry = surface.geometry;
        const render = () => { level.OnDrawn(); level.OnGUI(); };
        surface.phase = 0;
        pond.OnUpdate(0);
        render();
        const before = Array.from(geometry.positions);
        const pixelsBefore = level.screen3D.Canvas.toDataURL();
        const positions = geometry.positions;
        const buffers = level.renderer.ownedBuffers.size;
        pond.OnUpdate(0.8);
        render();
        const pixelsChanged = pixelsBefore !== level.screen3D.Canvas.toDataURL();
        const moved = geometry.positions.some((value, index) => Math.abs(value - before[index]) > 0.005);
        const normalsValid = Array.from({ length: geometry.vertexCount }, (_, index) =>
            Math.hypot(...geometry.normals.slice(index * 3, index * 3 + 3))).every(length => Math.abs(length - 1) < 0.0001);
        const edgesJoined = Math.abs(geometry.HeightAt(geometry.width / 2, 0, surface.phase)) < 0.00001;
        for (let i = 0; i < 60; i++) pond.OnUpdate(1 / 60);
        render();
        const cacheUpdated = level.renderer.geometryCache.get(geometry).version === geometry.version;
        const stableBuffers = buffers === level.renderer.ownedBuffers.size && positions === geometry.positions;
        // Walk through the open west bank using the regular fixed update.
        level.player.transform.SetPosition(2.8, 0.55, 2.5);
        level.player.moveX = 1;
        for (let i = 0; i < 35; i++) level.OnFixedUpdate(1 / 60);
        const entered = level.player.waterContact.zone === pond;
        const wetSpeed = level.player.rigidbody.velocity[0];
        level.footstepRipples.OnUpdate();
        const rippleVisible = level.footstepRipples.visible;
        render();
        const wetBuffers = level.renderer.ownedBuffers.size;
        for (let i = 0; i < 20; i++) {
            pond.OnUpdate(1 / 60);
            level.footstepRipples.OnUpdate();
            render();
        }
        const rippleBuffersStable = wetBuffers === level.renderer.ownedBuffers.size;
        level.player.moveX = -1;
        for (let i = 0; i < 50; i++) level.OnFixedUpdate(1 / 60);
        const drySpeed = level.player.rigidbody.velocity[0];
        const exited = level.player.waterContact.zone === null;
        level.player.transform.SetPosition(4.5, 3, 2.5);
        level.player.waterContact.OnFixedUpdate();
        const aboveWaterDry = level.player.waterContact.zone === null;
        level.player.transform.SetPosition(4.5, 0.55, 2.5);
        level.player.moveX = 0;
        level.player.attackRequested = true;
        level.OnFixedUpdate(1 / 60);
        const wetAttack = level.player.attack.phase === 'windup' && level.player.rigidbody.velocity[0] === 0;
        level.footstepRipples.OnUpdate();
        const idleRipplesHidden = !level.footstepRipples.visible;
        level.RestartEncounter();
        const resetDry = level.player.waterContact.zone === null && !level.footstepRipples.visible;
        level.player.transform.SetPosition(4.2, 0.55, 2.5);
        level.player.moveX = 1;
        level.OnFixedUpdate(1 / 60);
        level.footstepRipples.OnUpdate();
        level.hud.helpVisible = false;
        render();
        return { moved, normalsValid, edgesJoined, cacheUpdated, stableBuffers, pixelsChanged,
            entered, wetSpeed, rippleVisible, rippleBuffersStable, drySpeed, exited, aboveWaterDry, wetAttack, idleRipplesHidden, resetDry, vertices: geometry.vertexCount, glError: level.renderer.gl.getError() };
    });
    assert.equal(result.vertices, 441);
    for (const key of ['moved', 'normalsValid', 'edgesJoined', 'cacheUpdated', 'stableBuffers', 'pixelsChanged']) assert.equal(result[key], true, key);
    assert.equal(result.wetSpeed, 2.2);
    assert.equal(result.drySpeed, -4);
    for (const key of ['entered', 'rippleVisible', 'rippleBuffersStable', 'exited', 'aboveWaterDry', 'wetAttack', 'idleRipplesHidden', 'resetDry']) assert.equal(result[key], true, key);
    assert.equal(result.glError, 0);
    await page.screenshot({ path: screenshotPath });
}

module.exports = { inspectToonWater };

