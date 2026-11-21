const assert = require('node:assert/strict');

async function inspectToonPolish(page, screenshotPath) {
    const result = await page.evaluate(async () => {
        const { Engine, LevelHandler, Input } = await import('gameforgejs/core');
        Engine.Stop();
        const level = LevelHandler.current;
        level.RestartEncounter();
        const descriptor = Object.getOwnPropertyDescriptor(navigator, 'getGamepads');
        let buttons = [];
        let axes = [0, 0, 0, 0];
        let connected = true;
        Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => connected ? [{
            id: 'Test standard controller', index: 0, connected: true, mapping: 'standard', axes,
            buttons: Array.from({ length: 17 }, (_, index) => ({ pressed: buttons.includes(index), value: buttons.includes(index) ? 1 : 0 })),
        }] : [] });
        const frame = () => {
            Input.Update();
            level.OnUpdate(1 / 60);
            level.OnFixedUpdate(1 / 60);
            Input.LateUpdate();
        };
        try {
            axes = [0.4, 0, 0, 0];
            frame();
            const partialSpeed = level.player.rigidbody.velocity[0];
            const normalizedFacing = Math.hypot(...level.player.facing);
            axes = [1, 0, 0, 0];
            frame();
            const fullSpeed = level.player.rigidbody.velocity[0];
            axes = [0, 0, 0, 0];
            buttons = [14];
            frame();
            const dpadSpeed = level.player.rigidbody.velocity[0];
            buttons = [2];
            frame();
            const attack = level.player.attack.phase;
            buttons = [9];
            const helpBefore = level.hud.helpVisible;
            frame();
            const helpToggled = level.hud.helpVisible !== helpBefore;
            frame();
            const heldHelpStable = level.hud.helpVisible !== helpBefore;
            buttons = [8];
            const bandsBefore = level.bands;
            frame();
            const bandsChanged = level.bands !== bandsBefore;
            level.player.health.Damage(1, level.enemies[0]);
            buttons = [3];
            frame();
            const reset = level.player.health.hp === 5 && level.player.attack.phase === 'ready';
            connected = false;
            frame();
            const disconnectedStops = level.player.moveX === 0 && level.player.moveZ === 0;

            level.hud.helpVisible = false;
            const notice = level.hud.announcement;
            level.hud.ShowArea('Courtyard');
            level.hud.OnUpdate(2.5, 'Courtyard');
            const holdOpacity = notice.opacity;
            level.hud.OnUpdate(0.75, 'Courtyard');
            const fadeOpacity = notice.opacity;
            level.hud.OnUpdate(0.75, 'Courtyard');
            const endOpacity = notice.opacity;
            level.player.transform.SetPosition(0, 0.55, -10);
            level.OnUpdate(0);
            const nextArea = notice.name;
            const nextOpacity = notice.opacity;
            level.player.transform.SetPosition(0, 0.55, 3.5);
            level.OnUpdate(0);
            const reentry = notice.name;
            level.hud.helpVisible = false;
            level.OnDrawn(); level.OnGUI();
            const context = level.ui.Draw.screen.Context;
            const fullPixel = Array.from(context.getImageData(level.hud.healthBar.bounds.x + level.hud.healthBar.bounds.width * 0.8, level.hud.healthBar.bounds.y + 5, 1, 1).data);
            level.player.health.Damage(3, level.enemies[0]);
            level.OnDrawn(); level.OnGUI();
            const hurtPixel = Array.from(context.getImageData(level.hud.healthBar.bounds.x + level.hud.healthBar.bounds.width * 0.8, level.hud.healthBar.bounds.y + 5, 1, 1).data);
            return { partialSpeed, fullSpeed, normalizedFacing, dpadSpeed, attack, helpToggled, heldHelpStable,
                bandsChanged, reset, disconnectedStops, holdOpacity, fadeOpacity, endOpacity, nextArea, nextOpacity,
                reentry, fullPixel, hurtPixel, skyLoaded: level.scene.skybox.image.width > 0,
                skyUploaded: level.renderer.skyboxCache.has(level.scene.skybox), glError: level.renderer.gl.getError() };
        } finally {
            if (descriptor) Object.defineProperty(navigator, 'getGamepads', descriptor);
            else delete navigator.getGamepads;
            Input.Update(); Input.LateUpdate();
        }
    });
    assert.ok(result.partialSpeed > 0 && result.partialSpeed < result.fullSpeed);
    assert.equal(result.fullSpeed, 4);
    assert.equal(result.normalizedFacing, 1);
    assert.equal(result.dpadSpeed, -4);
    assert.equal(result.attack, 'windup');
    for (const key of ['helpToggled', 'heldHelpStable', 'bandsChanged', 'reset', 'disconnectedStops', 'skyLoaded', 'skyUploaded']) assert.equal(result[key], true, key);
    assert.equal(result.holdOpacity, 1);
    assert.equal(result.fadeOpacity, 0.5);
    assert.equal(result.endOpacity, 0);
    assert.equal(result.nextArea, 'Forest trail');
    assert.equal(result.nextOpacity, 1);
    assert.equal(result.reentry, 'Courtyard');
    assert.notDeepEqual(result.fullPixel, result.hurtPixel, 'Health bar did not shrink on damage');
    assert.equal(result.glError, 0);
    await page.screenshot({ path: screenshotPath });
}

module.exports = { inspectToonPolish };
