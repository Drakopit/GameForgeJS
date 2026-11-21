const assert = require('node:assert/strict');

// Model browser chrome/keyboard changing only VisualViewport, not innerHeight.
async function setVisibleArea(page, { height, top = 0, bottomInset = 34, leftInset = 0, rightInset = 0 }) {
    await page.evaluate(({ height, top, bottomInset, leftInset, rightInset }) => {
        const viewport = window.visualViewport;
        Object.defineProperties(viewport, {
            height: { configurable: true, get: () => height },
            offsetTop: { configurable: true, get: () => top },
        });
        const canvas = window.onlineCore.LevelHandler.current.screen.Canvas;
        for (const [side, pixels] of Object.entries({ bottom: bottomInset, left: leftInset, right: rightInset })) {
            canvas.style.setProperty(`--gameforge-safe-${side}`, `${pixels}px`);
        }
        viewport.dispatchEvent(new Event('resize'));
    }, { height, top, bottomInset, leftInset, rightInset });
    await page.waitForTimeout(60);
}

async function inspectMobileViewport(page, screenshot) {
    await setVisibleArea(page, { height: 720, top: 18 });
    const layout = await page.evaluate(() => {
        const level = window.onlineCore.LevelHandler.current;
        const canvas = level.screen.Canvas.getBoundingClientRect();
        return { screenHeight: level.screen.Height, canvas: { y: canvas.y, bottom: canvas.bottom, height: canvas.height },
            buttons: Object.values(level.controls.buttons), stick: level.controls.stick, activeTouches: level.controls.touch.GetActiveTouches().length };
    });
    assert.equal(layout.screenHeight, 686);
    assert.equal(layout.canvas.y, 18);
    assert(layout.canvas.bottom <= 18 + 720 - 34);
    assert.equal(layout.activeTouches, 0);
    for (const box of layout.buttons) assert(box.y >= 0 && box.y + box.height <= layout.screenHeight - 12, box.label);
    assert(layout.stick.y + layout.stick.radius < layout.screenHeight - 12);
    await page.screenshot({ path: screenshot });
    const box = await page.evaluate(() => window.onlineCore.LevelHandler.current.ui.buttons.chat.rect);
    await page.touchscreen.tap(box.x + 20, box.y + 18 + 18);
    await page.locator('input[data-gameforge-input]').waitFor();
    await setVisibleArea(page, { height: 310, top: 18 });
    await page.waitForFunction(() => window.onlineCore.LevelHandler.current.ui.fields.chat.rect.y > 0);
    const chat = await page.evaluate(() => {
        const level = window.onlineCore.LevelHandler.current;
        return { rect: level.ui.fields.chat.rect, height: level.screen.Height, axis: level.controls.axis };
    });
    assert(chat.rect.y + chat.rect.height <= chat.height - 12);
    assert.equal(chat.axis, 0);
    await page.locator('input[data-gameforge-input]').fill('Keyboard stays above the toolbar');
    await page.keyboard.press('Enter');
    await page.evaluate(() => {
        delete window.visualViewport.height; delete window.visualViewport.offsetTop;
        const canvas = window.onlineCore.LevelHandler.current.screen.Canvas;
        for (const side of ['bottom', 'left', 'right']) canvas.style.setProperty(`--gameforge-safe-${side}`, `env(safe-area-inset-${side}, 0px)`);
        window.visualViewport.dispatchEvent(new Event('resize'));
    });
}

async function inspectLobbyCaret(page) {
    const result = await page.evaluate(() => {
        const { Engine, LevelHandler } = window.onlineCore;
        Engine.Stop();
        const level = LevelHandler.current, field = level.ui.fields.server;
        field.SetActive(true);
        field.bridge.element.setSelectionRange(6, 6);
        const ctx = level.screen.Context;
        const capture = () => {
            ctx.clearRect(field.rect.x, field.rect.y, field.rect.width, field.rect.height);
            ctx.fillStyle = '#102030';
            ctx.fillRect(field.rect.x, field.rect.y, field.rect.width, field.rect.height);
            field.DrawCursor();
            const pixels = ctx.getImageData(field.rect.x + 2, field.rect.y + 2, field.rect.width - 4, field.rect.height - 4).data;
            let caretPixels = 0;
            let totalX = 0;
            for (let index = 0; index < pixels.length; index += 4) {
                if (pixels[index] > 200 && pixels[index + 1] > 160 && pixels[index + 2] < 160) {
                    caretPixels++;
                    totalX += (index / 4) % (field.rect.width - 4);
                }
            }
            return { count: caretPixels, centerX: totalX / (caretPixels || 1) };
        };
        const visible = capture(); field.OnUpdate(0.6); const hidden = capture();
        field.OnUpdate(0.5); const visibleAgain = capture();
        field.bridge.element.setSelectionRange(12, 12); const moved = capture();
        return { visible, hidden, visibleAgain, moved, selection: field.bridge.element.selectionStart };
    });
    assert(result.visible.count > 0 && result.hidden.count === 0 && result.visibleAgain.count > 0,
        `Caret must blink and reappear in Canvas: ${JSON.stringify(result)}`);
    assert(result.moved.count > 0 && result.moved.centerX > result.visibleAgain.centerX && result.selection === 12,
        'Caret must track native selection position');
    await setVisibleArea(page, { height: 300, bottomInset: 34 });
    const keyboard = await page.evaluate(() => {
        const level = window.onlineCore.LevelHandler.current;
        level.OnDrawn(); level.OnGUI();
        return { field: level.ui.fields.server.rect, done: level.ui.buttons.done.rect, height: level.screen.Height };
    });
    assert(keyboard.field.y >= 0 && keyboard.field.y + keyboard.field.height < keyboard.height);
    assert(keyboard.done.y + keyboard.done.height <= keyboard.height - 12);
    await page.locator('input[data-gameforge-input]').fill('wss://gameforgejs.onrender.com/ws');
    assert.equal(await page.evaluate(() => window.onlineCore.LevelHandler.current.ui.fields.server.GetText()), 'wss://gameforgejs.onrender.com/ws');
}

async function inspectLandscapeLobby(page, screenshot) {
    await page.keyboard.press('Enter');
    await page.setViewportSize({ width: 844, height: 390 });
    await setVisibleArea(page, { height: 300, bottomInset: 21, leftInset: 44, rightInset: 44 });
    const layout = await page.evaluate(() => {
        const level = window.onlineCore.LevelHandler.current;
        level.OnDrawn(); level.OnGUI();
        const canvas = level.screen.Canvas.getBoundingClientRect();
        return { width: level.screen.Width, height: level.screen.Height,
            left: canvas.left, right: canvas.right, bottom: canvas.bottom,
            boxes: ['name', 'room', 'server'].map(id => level.ui.fields[id].rect)
                .concat(['create', 'join'].map(id => level.ui.buttons[id].rect)) };
    });
    assert.equal(layout.left, 44); assert.equal(layout.right, 800); assert.equal(layout.bottom, 279);
    for (const box of layout.boxes) {
        assert(box.x >= 12 && box.x + box.width <= layout.width - 12);
        assert(box.y >= 12 && box.y + box.height <= layout.height - 12);
    }
    await page.screenshot({ path: screenshot });
}

module.exports = { inspectMobileViewport, inspectLobbyCaret, inspectLandscapeLobby };
