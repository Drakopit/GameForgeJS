const assert = require('node:assert/strict');
const { expect } = require('@playwright/test');

async function inspectTouchGarden(page, screenshotPath) {
    const session = await page.context().newCDPSession(page);
    const state = field => page.evaluate(async field => {
        const level = (await import('gameforgejs/core')).LevelHandler.current;
        return { x: level.player.position.x, vx: level.player.velocity.vx, dashes: level.player.motion.dashes,
            touches: level.controls.touch.GetActiveTouches().length, identifier: level.controls.identifier,
            help: level.hud.helpVisible }[field];
    }, field);
    const client = (x, y) => page.locator('#touch-garden').evaluate((canvas, point) => {
        const rect = canvas.getBoundingClientRect();
        return { x: rect.left + point.x * rect.width / canvas.width, y: rect.top + point.y * rect.height / canvas.height };
    }, { x, y });
    const send = async (type, points) => session.send('Input.dispatchTouchEvent', { type, touchPoints: points });
    try {
        await session.send('Emulation.setTouchEmulationEnabled', { enabled: true });
        await page.waitForFunction(async () => !!(await import('gameforgejs/core')).LevelHandler.current?.controls);
        // This helper deliberately exercises touch even in the desktop smoke context.
        await page.evaluate(async () => (await import('gameforgejs/core')).Input.instance.presentation.SetTouchMode('on'));
        const start = await client(96, 690);
        const steer = await client(136, 690);
        const action = await client(384, 690);
        const x = await state('x');
        await send('touchStart', [{ ...start, id: 11 }]);
        await send('touchMove', [{ ...steer, id: 11 }]);
        await expect.poll(() => state('x')).toBeGreaterThan(x + 12);
        await send('touchStart', [{ ...steer, id: 11 }, { ...action, id: 22 }]);
        await expect.poll(() => state('dashes')).toBe(1);
        assert.equal(await state('touches'), 2);
        await page.waitForTimeout(950);
        assert.equal(await state('dashes'), 1, 'Holding dash repeated the action');
        await send('touchEnd', [{ ...steer, id: 11 }]);
        assert.equal(await state('touches'), 1);
        await send('touchCancel', []);
        await expect.poll(() => state('vx')).toBe(0);
        assert.equal(await state('identifier'), null);
        // Replay and test UI touch targets, including cancellation/resize cleanup.
        const reset = await client(425, 43);
        await send('touchStart', [{ ...reset, id: 30 }]);
        await expect.poll(() => state('dashes')).toBe(0);
        await send('touchEnd', []);
        const help = await client(371, 43);
        await send('touchStart', [{ ...help, id: 31 }]);
        await expect.poll(() => state('help')).toBe(true);
        await send('touchEnd', []);
        await page.keyboard.press('KeyH');
        await expect.poll(() => state('help')).toBe(false);
        await page.keyboard.down('ArrowRight');
        await expect.poll(() => state('vx')).toBeGreaterThan(0);
        await page.keyboard.up('ArrowRight');
        await page.keyboard.press('KeyR');
        await expect.poll(() => state('x')).toBe(226);
        const progression = await page.evaluate(async () => {
            const { Engine, LevelHandler } = await import('gameforgejs/core');
            Engine.Stop();
            const level = LevelHandler.current;
            const step = () => level.OnFixedUpdate(1 / 60);
            for (const crystal of level.crystals) { level.player.position.Copy(crystal.position); step(); }
            const collected = level.collected;
            // Dash into a planter: the BoundsComponent collision must block entry.
            level.ResetGarden();
            level.player.position.Set(275, 415);
            level.player.motion.direction.Set(1, 0);
            level.player.motion.dashRequested = true;
            for (let i = 0; i < 20; i++) step();
            const blocked = level.player.position.x + level.player.size.x <= 307;
            level.ResetGarden();
            level.OnDrawn(); level.OnGUI();
            return { collected, total: level.crystals.length, blocked, reset: level.collected === 0 };
        });
        assert.equal(progression.collected, progression.total);
        assert.equal(progression.blocked, true);
        assert.equal(progression.reset, true);
        await page.screenshot({ path: screenshotPath });
    } finally {
        await send('touchCancel', []).catch(() => {});
        await session.detach();
    }
}
module.exports = { inspectTouchGarden };
