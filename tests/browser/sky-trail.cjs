const assert = require('node:assert/strict');
const { expect } = require('@playwright/test');

async function inspectSkyTrail(page, screenshotPath) {
    const timeout = 15000;
    await page.keyboard.press('KeyH');
    await expect.poll(() => page.evaluate(async () => (await import('gameforgejs/core')).LevelHandler.current?.hud?.helpVisible), { timeout }).toBe(true);
    await page.keyboard.press('KeyH');
    await expect.poll(() => page.evaluate(async () => (await import('gameforgejs/core')).LevelHandler.current?.hud?.helpVisible)).toBe(false);
    const result = await page.evaluate(async () => {
        const { Engine, LevelHandler, Input } = await import('gameforgejs/core');
        Engine.Stop();
        Input.ClearKeyboard();
        const level = LevelHandler.current;
        if (level.ui.Screen.Canvas.style.imageRendering === 'pixelated') throw new Error('pixelArt:false was ignored');
        const player = level.player;
        const step = count => { for (let i = 0; i < count; i++) level.OnFixedUpdate(1 / 60); };
        level.ResetGame();
        step(40);
        const grounded = player.body.grounded;
        player.jumpBuffer = 0.12;
        step(1);
        const jumped = player.body.velocity[1] > 6;
        player.body.grounded = false;
        player.coyote = 0.06;
        player.jumpBuffer = 0.12;
        player.Move(1 / 60, 0);
        const coyoteJump = player.body.velocity[1] === level.course.player.movement.jumpSpeed;
        player.body.velocity[1] = 0;
        player.coyote = 0;
        player.jumpBuffer = 0.1;
        player.Move(1 / 60, 0);
        const buffered = player.jumpBuffer > 0 && player.body.velocity[1] === 0;
        player.body.grounded = true;
        player.Move(1 / 60, 0);
        const bufferedJump = player.body.velocity[1] > 6;

        level.ResetGame();
        const moving = level.platforms.platforms.find(platform => platform.definition.motion);
        player.model.SetPosition(moving.mesh.transform.position[0], moving.mesh.transform.position[1] + moving.definition.size.y / 2 + 0.01, moving.mesh.transform.position[2]);
        step(8);
        const relativeBefore = player.model.transform.position[0] - moving.mesh.transform.position[0];
        step(30);
        const carried = player.body.groundBody === moving.body && Math.abs(player.model.transform.position[0] - moving.mesh.transform.position[0] - relativeBefore) < 0.03;
        const checkpoint = level.checkpoints[0];
        player.Reset(checkpoint.respawn);
        step(12);
        const saved = level.checkpoint === checkpoint;
        const coinsBeforeFall = level.collectedCoins;
        player.model.transform.position[1] = -10;
        step(1);
        const recovered = level.falls === 1 && Math.abs(player.model.transform.position[0] - checkpoint.respawn.x) < 0.01;
        const retainedCoins = level.collectedCoins === coinsBeforeFall;

        const blink = level.platforms.platforms.find(platform => platform.definition.blink);
        level.platforms.Update(blink.definition.blink.solidDuration - blink.definition.blink.phase + 0.1);
        const vanished = !blink.body.enabled && !blink.mesh.visible;
        level.ResetGame();
        const resetCheckpoint = !level.checkpoint && !checkpoint.active && level.collectedCoins === 0;
        for (const coin of level.coins.coins) {
            level.coins.Update(0, level.time);
            player.model.SetPosition(coin.mesh.transform.position[0], coin.mesh.transform.position[1] - level.course.player.collider.offset.y, coin.mesh.transform.position[2]);
            step(1);
        }
        const unlocked = level.goalUnlocked;
        const fullRoute = level.route;
        const startingSegment = level.segment;
        level.player.model.SetPosition(...level.course.goal.trigger.ToArray());
        step(1);
        let continuous = true;
        if (startingSegment + 1 < fullRoute.length) {
            continuous = level.pendingSegment === startingSegment + 1 && level.gameState === 'PLAYING';
            level.player.body.velocity[0] = 3;
            const priorScore = level.score;
            for(let frame=0; frame<36; frame++) level.OnUpdate(1/60);
            continuous &&= level.segment === startingSegment + 1 && level.score === priorScore && level.player.body.velocity[0] === 3;
            level.LoadSegment(startingSegment, false);
            level.ResetGame();
            for (const coin of level.coins.coins) {
                level.coins.Update(0, level.time);
                level.player.model.SetPosition(coin.mesh.transform.position[0], coin.mesh.transform.position[1] - level.course.player.collider.offset.y, coin.mesh.transform.position[2]);
                step(1);
            }
        } else { level.gameState = 'PLAYING'; level.segmentStart = 0; }
        level.route = level.route.slice(0, level.segment + 1);
        player.model.SetPosition(...level.course.goal.trigger.ToArray());
        step(1);
        const won = level.gameState === 'WON';
        const finishTime = level.time;
        const finishScore = level.score;
        step(30);
        const frozenResult = level.time === finishTime && level.score === finishScore;
        const bestTime = level.bestTime <= finishTime;
        level.route = fullRoute;
        level.ResetGame();

        // Poll a standard gamepad through Input, retaining analog strength.
        const descriptor = Object.getOwnPropertyDescriptor(navigator, 'getGamepads');
        let axes = [0.4, 0, 0, 0];
        let buttons = [];
        Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [{ index: 0, connected: true, id: 'test', mapping: 'standard', axes,
            buttons: Array.from({ length: 17 }, (_, i) => ({ pressed: buttons.includes(i), value: buttons.includes(i) ? 1 : 0 })) }] });
        let analog, padHelp, padJump;
        try {
            Input.Update(); level.OnUpdate(1 / 60); Input.LateUpdate();
            analog = player.input.horizontal === 0.4;
            axes = [0, 0, 0, 0]; buttons = [3];
            Input.Update(); level.OnUpdate(1 / 60); Input.LateUpdate();
            padHelp = level.hud.helpVisible;
            level.hud.helpVisible = false;
            buttons = [0];
            Input.Update(); level.OnUpdate(1 / 60); Input.LateUpdate();
            padJump = player.jumpBuffer > 0;
        } finally {
            if (descriptor) Object.defineProperty(navigator, 'getGamepads', descriptor);
            else delete navigator.getGamepads;
            Input.Update(); Input.LateUpdate();
        }
        level.ResetGame();
        level.hud.helpVisible = false;
        level.OnDrawn(); level.OnGUI();
        return { grounded, jumped, coyoteJump, buffered, bufferedJump, carried, saved, recovered, retainedCoins,
            vanished, resetCheckpoint, unlocked, continuous, won, frozenResult, bestTime, analog, padHelp, padJump, glError: level.renderer.gl.getError() };
    });
    for (const [name, value] of Object.entries(result)) {
        if (name === 'glError') assert.equal(value, 0);
        else assert.equal(value, true, name);
    }
    await page.screenshot({ path: screenshotPath });
}
module.exports = { inspectSkyTrail };
