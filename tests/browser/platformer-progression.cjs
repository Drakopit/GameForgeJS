const assert = require('node:assert/strict');
const { expect } = require('@playwright/test');

async function readProgress(page) {
    return page.evaluate(async () => {
        const { LevelHandler } = await import('gameforgejs/core');
        const level = LevelHandler.current;
        return { index: LevelHandler.index, count: level.collectedCount, won: level.won };
    });
}

async function visit(page, position) {
    await page.evaluate(async position => {
        const level = (await import('gameforgejs/core')).LevelHandler.current;
        level.player.position.Set(position.x, position.y);
        level.player.controller.Reset();
        // Fixed steps make overlap/idempotency independent of rendering timing.
        level.OnFixedUpdate(1 / 60);
        level.OnFixedUpdate(1 / 60);
    }, position);
}

async function completeStage(page) {
    const stage = await page.evaluate(async () => {
        return (await import('gameforgejs/core')).LevelHandler.current.stage;
    });
    for (let index = 0; index < stage.coins.length; index++) {
        const coin = stage.coins[index];
        await visit(page, { x: coin.x, y: coin.y - 8 });
        assert.equal((await readProgress(page)).count, index + 1);
        await visit(page, { x: coin.x, y: coin.y - 8 });
        assert.equal((await readProgress(page)).count, index + 1, 'Coin collected twice');
    }
    await visit(page, { x: 1000, y: 700 });
    assert.equal((await readProgress(page)).count, stage.coins.length, 'Falling lost collected coins');
    await visit(page, { x: stage.goal.x, y: 450 });
    assert.equal((await readProgress(page)).won, true);
}

async function advance(page, index) {
    const previous = await page.evaluateHandle(async () => {
        return (await import('gameforgejs/core')).LevelHandler.current.player;
    });
    await page.keyboard.down('Enter');
    await expect.poll(async () => (await readProgress(page)).index).toBe(index);
    await page.keyboard.up('Enter');
    assert.equal(await previous.evaluate(player => player._destroyed && player.components.length === 0), true);
    await previous.dispose();
    assert.equal(await page.locator('canvas').count(), 1, 'Previous level canvas survived');
    assert.deepEqual(await readProgress(page), { index, count: 0, won: false });
}

async function inspectPlatformerProgression(page) {
    assert.equal((await readProgress(page)).count, 0, 'Restart did not restore coins');
    await visit(page, { x: 1840, y: 450 });
    assert.equal((await readProgress(page)).won, false, 'Flag accepted incomplete collection');
    await page.keyboard.press('Enter');
    assert.equal((await readProgress(page)).index, 0);

    await completeStage(page);
    await advance(page, 1);
    await completeStage(page);
    await advance(page, 0);
}

module.exports = { inspectPlatformerProgression };
