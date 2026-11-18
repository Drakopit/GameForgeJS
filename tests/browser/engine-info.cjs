const assert = require('node:assert/strict');
const { expect } = require('@playwright/test');
async function inspectEngineInfo(page, { select = false } = {}) {
    const open = () => page.evaluate(async () => {
        const level = (await import('gameforgejs/core')).LevelHandler.current;
        return (level.hud?.help ?? level.help).visible;
    });
    const ui = page.locator('canvas').last();
    const before = await ui.screenshot();
    await page.keyboard.press('KeyH');
    await expect.poll(open).toBe(true);
    assert.ok(!before.equals(await ui.screenshot()), 'Help did not render on the engine canvas');
    await page.keyboard.press('KeyH');
    await expect.poll(open).toBe(false);
    await page.evaluate(({ select }) => {
        window.originalInfoGamepads = Object.getOwnPropertyDescriptor(navigator, 'getGamepads');
        window.infoButtons = [];
        Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [{ index: 0, connected: true, id: 'UI test', mapping: 'standard', axes: [0,0,0,0],
            buttons: Array.from({length:17}, (_, index) => ({ pressed: window.infoButtons.includes(index), value: window.infoButtons.includes(index) ? 1 : 0 })) }] });
    }, { select });
    try {
        await page.waitForTimeout(50);
        await page.evaluate(index => { window.infoButtons = [index]; }, select ? 8 : 9);
        await expect.poll(open).toBe(true);
        await page.evaluate(() => { window.infoButtons = []; });
        await page.waitForTimeout(50);
    } finally {
        await page.evaluate(() => {
            if (window.originalInfoGamepads) Object.defineProperty(navigator, 'getGamepads', window.originalInfoGamepads);
            else delete navigator.getGamepads;
            delete window.originalInfoGamepads; delete window.infoButtons;
        });
    }
    await page.keyboard.press('KeyH');
    await expect.poll(open).toBe(false);
}
module.exports = { inspectEngineInfo };
