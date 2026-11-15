const assert = require('node:assert/strict');
const { expect } = require('@playwright/test');

async function inspectSkyTrailMenu(page, screenshotPath) {
    await page.evaluate(() => {
        window.testPad = { buttons: [], axes: [0, 0, 0, 0], connected: true };
        Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => window.testPad.connected ? [{
            index: 0, id: 'Standard test pad', connected: true, mapping: 'standard', axes: window.testPad.axes,
            buttons: Array.from({ length: 17 }, (_, i) => ({ pressed: window.testPad.buttons.includes(i), value: window.testPad.buttons.includes(i) ? 1 : 0 })),
        }] : [] });
    });
    const selection = () => page.evaluate(async () => (await import('gameforgejs/core')).LevelHandler.current.currentSelected);
    await page.evaluate(() => window.testPad.buttons = [13]);
    await expect.poll(selection).toBe(1);
    await page.evaluate(() => window.testPad.buttons = []);
    await page.waitForTimeout(80);
    await page.evaluate(() => window.testPad.axes[1] = -0.8);
    await expect.poll(selection).toBe(0);
    await page.evaluate(() => window.testPad.axes[1] = 0);
    await page.waitForTimeout(80);
    // A held stick repeats instead of either ignoring input or skipping every frame.
    await page.evaluate(() => window.testPad.axes[1] = 0.8);
    await expect.poll(selection).toBe(1);
    await page.waitForTimeout(380);
    assert.notEqual(await selection(), 1);
    await page.evaluate(() => { window.testPad.axes[1] = 0; window.testPad.connected = false; });
    await page.waitForTimeout(80);
    const disconnected = await selection();
    await page.waitForTimeout(200);
    assert.equal(await selection(), disconnected);
    const previews = await page.evaluate(async () => {
        const menu = (await import('gameforgejs/core')).LevelHandler.current;
        for (let i = 0; i < menu.courses.length; i++) {
            menu.currentSelected = i; menu.ShowCourse(); menu.OnDrawn();
        }
        const buffers = menu.renderer.ownedBuffers.size;
        const bodies = menu.physics.bodies.length;
        for (let i = 0; i < 12; i++) {
            menu.currentSelected = i % menu.courses.length; menu.ShowCourse(); menu.OnDrawn();
        }
        menu.currentSelected = 0; menu.ShowCourse(); menu.OnDrawn(); menu.OnGUI();
        return { count: menu.courses.length, stable: buffers === menu.renderer.ownedBuffers.size && bodies === menu.physics.bodies.length };
    });
    assert.equal(previews.count, 4);
    assert.equal(previews.stable, true);
    await page.screenshot({ path: screenshotPath });
    await page.evaluate(() => { window.testPad.connected = true; window.testPad.buttons = [0]; });
    await expect.poll(() => page.evaluate(async () => (await import('gameforgejs/core')).LevelHandler.current.constructor.name)).toBe('CubeGameLevel');
    await page.evaluate(() => { delete navigator.getGamepads; delete window.testPad; });
}
module.exports = { inspectSkyTrailMenu };
