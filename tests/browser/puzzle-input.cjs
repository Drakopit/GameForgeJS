const assert = require('node:assert/strict');

async function inspectPuzzleInput(page) {
    const result = await page.evaluate(async () => {
        const { Engine, Input, LevelHandler } = await import('gameforgejs/core');
        Engine.Stop();
        const level = LevelHandler.current;
        const original = Object.getOwnPropertyDescriptor(navigator, 'getGamepads');
        let buttons = [];
        Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [{ index: 0, id: 'standard', connected: true, mapping: 'standard', axes: [0, 0, 0, 0],
            buttons: Array.from({ length: 17 }, (_, index) => ({ pressed: buttons.includes(index), value: buttons.includes(index) ? 1 : 0 })) }] });
        const frame = () => { Input.Update(); level.OnUpdate(1 / 60); Input.LateUpdate(); };
        try {
            level.ResetMatch();
            frame();
            const col = level.piece1.col1;
            buttons = [15]; frame();
            const moved = level.piece1.col1 === col + 1;
            const screen = level.screen;
            const board = level.board1;
            level.gameEnded = true;
            buttons = [3]; frame();
            const reset = !level.gameEnded && level.board1 !== board && level.screen === screen && document.querySelectorAll('canvas').length === 1;
            level.OnDrawn(); level.OnGUI();
            return { moved, reset };
        } finally {
            if (original) Object.defineProperty(navigator, 'getGamepads', original);
            else delete navigator.getGamepads;
            Input.Update(); Input.LateUpdate();
        }
    });
    assert.equal(result.moved, true, 'Puzzle ignored gamepad movement');
    assert.equal(result.reset, true, 'Puzzle restart replaced the Screen or reloaded the page');
}
module.exports = { inspectPuzzleInput };
