const assert = require('node:assert/strict');
const { expect } = require('@playwright/test');

async function inspectToonRoom(page, screenshotPath) {
    const canvas = page.locator('#gameCanvas3D');
    const before = await canvas.screenshot();
    await page.keyboard.press('KeyB');
    await expect.poll(() => page.evaluate(async () => {
        return (await import('gameforgejs/core')).LevelHandler.current.bands;
    })).toBe(4);
    const after = await canvas.screenshot();
    assert.ok(!before.equals(after), 'Changing bands did not change the rendered scene');
    const ui = page.locator('#gameCanvasUI');
    const closedHelp = await ui.screenshot();
    await page.keyboard.press('KeyH');
    await expect.poll(() => page.evaluate(async () => {
        return (await import('gameforgejs/core')).LevelHandler.current.hud.helpVisible;
    })).toBe(true);
    assert.ok(!(await ui.screenshot()).equals(closedHelp), 'Help did not draw on ScreenUI');
    await page.keyboard.press('KeyH');
    await expect.poll(() => page.evaluate(async () => {
        return (await import('gameforgejs/core')).LevelHandler.current.hud.helpVisible;
    })).toBe(false);

    await page.keyboard.down('ArrowRight');
    await expect.poll(() => page.evaluate(async () => {
        return (await import('gameforgejs/core')).LevelHandler.current.player.transform.position[0];
    })).toBeGreaterThan(0.5);
    await page.keyboard.up('ArrowRight');
    await page.keyboard.press('KeyR');
    await expect.poll(() => page.evaluate(async () => {
        return (await import('gameforgejs/core')).LevelHandler.current.player.transform.position[0];
    })).toBe(0);

    const collision = await page.evaluate(async () => {
        const level = (await import('gameforgejs/core')).LevelHandler.current;
        const player = level.player;
        player.transform.SetPosition(-2.5, 0.55, 3.5);
        for (let i = 0; i < 120; i++) {
            player.rigidbody.velocity[2] = -4;
            level.physics.Step(1 / 60);
        }
        const z = player.transform.position[2];
        player.Reset();
        level.renderer.Render(level.scene, level.camera);
        return { z, error: level.renderer.gl.getError() };
    });
    assert.ok(collision.z >= 1.54 && collision.z < 1.7, 'Player passed through the courtyard obstacle');
    assert.equal(collision.error, 0, 'WebGL reported a rendering error');
    const uniforms = await page.evaluate(async () => {
        const level = (await import('gameforgejs/core')).LevelHandler.current;
        const { StandardMaterial, ToonMaterial, Mesh, PrimitiveMesh } = await import('gameforgejs/3d');
        const renderer = level.renderer;
        const shader = renderer.standardShader;
        const probe = new Mesh({ geometry: PrimitiveMesh.Cube(0.1), material: new StandardMaterial() });
        level.scene.Add(probe);
        renderer.Render(level.scene, level.camera);
        const standardBands = renderer.gl.getUniform(shader.program, shader.GetUniform('uToonBands'));
        probe.material = new ToonMaterial({ bands: 4 });
        renderer.Render(level.scene, level.camera);
        const toonBands = renderer.gl.getUniform(shader.program, shader.GetUniform('uToonBands'));
        level.scene.Remove(probe);
        return { standardBands, toonBands };
    });
    assert.deepEqual(uniforms, { standardBands: 0, toonBands: 4 }, 'Lighting mode leaked between materials');
    await page.screenshot({ path: screenshotPath });
}

module.exports = { inspectToonRoom };
