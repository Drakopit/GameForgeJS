const assert = require('node:assert/strict');

async function inspectToonAnimation(page, screenshotPath) {
    // Combat tests have stopped RAF; sample deterministic frames on the actual GL context.
    const result = await page.evaluate(async () => {
        const { LevelHandler, AssetManager } = await import('gameforgejs/core');
        const level = LevelHandler.current;
        level.RestartEncounter();
        const visual = level.visuals[0];
        visual.animator.Play('run');
        visual.animator.Seek(0);
        const original = visual.model.meshes.map(mesh => Array.from(mesh.geometry.positions));
        const source = AssetManager.instance.GetModel('knight');
        const sourceSnapshot = source.map(part => Array.from(part.positions));
        const render = () => { level.OnDrawn(); level.OnGUI(); };
        render();
        const buffers = level.renderer.ownedBuffers.size;
        visual.animator.Seek(0.25);
        render();
        let maximumDelta = 0;
        visual.model.meshes.forEach((mesh, index) => {
            mesh.geometry.positions.forEach((value, component) => {
                maximumDelta = Math.max(maximumDelta, Math.abs(value - original[index][component]));
            });
        });
        const start = performance.now();
        for (let frame = 0; frame < 30; frame++) {
            for (const item of level.visuals) item.OnUpdate(1 / 60);
        }
        const animationMsPerFrame = (performance.now() - start) / 30;
        render();
        const unchangedSource = source.every((part, index) => part.positions.every((value, component) => value === sourceSnapshot[index][component]));
        const imagesReady = source.images.every(source => source.image && source.image.width > 0);
        const versionsUpdated = visual.model.meshes.every(mesh => {
            return level.renderer.geometryCache.get(mesh.geometry).version === mesh.geometry.version;
        });
        visual.animator.Play('death', { loop: false });
        visual.animator.Seek(100);
        const finished = visual.animator.finished;
        level.RestartEncounter();
        level.player.attackRequested = true;
        for (let step = 0; step < 12; step++) level.OnFixedUpdate(1 / 60);
        visual.OnUpdate(0);
        const attackClip = visual.animator.current.name;
        const attackTime = visual.animator.time;
        render();
        return { maximumDelta, unchangedSource, imagesReady, versionsUpdated, finished, attackClip, attackTime,
            buffersBefore: buffers, buffersAfter: level.renderer.ownedBuffers.size,
            glError: level.renderer.gl.getError(), animationMsPerFrame };
    });
    assert.ok(result.maximumDelta > 0.05, 'GLB skin did not deform');
    assert.equal(result.unchangedSource, true, 'Shared model data was mutated');
    assert.equal(result.imagesReady, true, 'Embedded textures were not decoded');
    assert.equal(result.versionsUpdated, true, 'Deformation did not reach GPU buffers');
    assert.equal(result.buffersAfter, result.buffersBefore, 'Animation allocated new GPU buffers');
    assert.equal(result.finished, true);
    assert.equal(result.attackClip, 'attack');
    assert.ok(result.attackTime > 0);
    assert.equal(result.glError, 0);
    console.log(`Exploration CPU animation (nearby + throttled distant rigs): ${result.animationMsPerFrame.toFixed(2)} ms/frame (headless local measurement)`);
    await page.screenshot({ path: screenshotPath });
}

module.exports = { inspectToonAnimation };
