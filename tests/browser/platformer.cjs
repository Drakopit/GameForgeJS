const assert = require('node:assert/strict');
const { expect } = require('@playwright/test');

async function waitForCondition(page, condition, argument) {
    await expect.poll(() => page.evaluate(condition, argument)).toBe(true);
}

async function readPlayer(page) {
    return page.evaluate(async () => {
        const level = (await import('gameforgejs/core')).LevelHandler.current;
        return { x: level.player.position.x, y: level.player.position.y };
    });
}

async function waitForGround(page) {
    await waitForCondition(page, async () => {
        const level = (await import('gameforgejs/core')).LevelHandler.current;
        return level.player.controller.grounded;
    });
}

async function teleport(page, x, y) {
    await page.evaluate(async ({ x, y }) => {
        const player = (await import('gameforgejs/core')).LevelHandler.current.player;
        player.position.x = x;
        player.position.y = y;
        player.controller.Reset();
    }, { x, y });
}

async function waitForCamera(page, x) {
    await expect.poll(() => page.evaluate(async () => {
        const level = (await import('gameforgejs/core')).LevelHandler.current;
        return level.camera.position.x;
    })).toBe(x);
}

async function inspectPlatformer(page, screenshotPath) {
    await waitForGround(page);
    await waitForCondition(page, async () => {
        const player = (await import('gameforgejs/core')).LevelHandler.current.player;
        return player.animation.animator.currentAnimationName === 'Idle';
    });
    const initialFrame = await page.evaluate(async () => {
        return (await import('gameforgejs/core')).LevelHandler.current.player.sprite.index;
    });
    await waitForCondition(page, async initial => {
        const player = (await import('gameforgejs/core')).LevelHandler.current.player;
        return player.sprite.index !== initial;
    }, initialFrame);
    const before = await readPlayer(page);
    await page.keyboard.down('ArrowRight');
    await waitForCondition(page, async start => {
        const level = (await import('gameforgejs/core')).LevelHandler.current;
        return level.player.position.x > start + 10;
    }, before.x);
    await waitForCondition(page, async () => {
        const player = (await import('gameforgejs/core')).LevelHandler.current.player;
        return player.animation.animator.currentAnimationName === 'Run'
            && player.animation.facingRight;
    });
    await page.keyboard.up('ArrowRight');

    await page.keyboard.down('Space');
    await waitForCondition(page, async () => {
        const player = (await import('gameforgejs/core')).LevelHandler.current.player;
        return player.controller.vy < 0 && !player.controller.grounded
            && player.animation.animator.currentAnimationName === 'Jump';
    });
    await page.keyboard.up('Space');
    await waitForCondition(page, async () => {
        const player = (await import('gameforgejs/core')).LevelHandler.current.player;
        return player.animation.animator.currentAnimationName === 'Fall';
    });
    await waitForGround(page);

    await page.keyboard.down('ArrowLeft');
    await waitForCondition(page, async () => {
        const player = (await import('gameforgejs/core')).LevelHandler.current.player;
        return !player.animation.facingRight
            && player.animation.animator.currentAnimationName === 'Run';
    });
    await page.keyboard.up('ArrowLeft');

    // Exercise camera follow and both bounds independently of a timed playthrough.
    await teleport(page, 1000, 380);
    await waitForCamera(page, 520);
    const rendering = await page.evaluate(async () => {
        const level = (await import('gameforgejs/core')).LevelHandler.current;
        const transform = level.screen.Context.getTransform();
        return {
            screenX: level.player.position.x - level.camera.position.x,
            translation: [transform.e, transform.f],
        };
    });
    assert.equal(rendering.screenX, 480, 'Player must stay centered while following');
    assert.deepEqual(rendering.translation, [0, 0], 'Camera transform leaked into HUD');
    await page.screenshot({ path: screenshotPath });

    const coins = await page.evaluate(async () => {
        return (await import('gameforgejs/core')).LevelHandler.current.stage.coins;
    });
    for (const coin of coins) {
        await teleport(page, coin.x, coin.y - 8);
        await waitForCondition(page, async position => {
            const level = (await import('gameforgejs/core')).LevelHandler.current;
            return level.coins.find(coin => coin.position.x === position.x).collected;
        }, coin);
    }
    await teleport(page, 1896, 450);
    await waitForCamera(page, 960);
    await waitForGround(page);
    await waitForCondition(page, async () => (await import('gameforgejs/core')).LevelHandler.current.won);

    await page.keyboard.down('KeyR');
    await waitForCondition(page, async () => {
        const level = (await import('gameforgejs/core')).LevelHandler.current;
        return level.player.position.x === level.stage.spawn.x && !level.won;
    });
    await page.keyboard.up('KeyR');
    await waitForCamera(page, 0);

    await teleport(page, 1000, 700);
    await waitForCondition(page, async () => {
        const level = (await import('gameforgejs/core')).LevelHandler.current;
        return level.player.position.x === level.stage.spawn.x
            && level.player.position.y < level.screen.height;
    });
    await waitForCamera(page, 0);
}

module.exports = { inspectPlatformer };
