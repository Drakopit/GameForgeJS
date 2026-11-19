const assert = require('node:assert/strict');
async function inspectFightingGamepad(page) {
    const result = await page.evaluate(async () => {
        const { Engine, Input, LevelHandler } = await import('gameforgejs/core');
        Engine.Stop(); const level = LevelHandler.current;
        const reader = level.input;
        level.StartRound(true); level.roundState = 'fight';
        level.playerTwo.controlledByPlayer = true;
        const original = Object.getOwnPropertyDescriptor(navigator, 'getGamepads');
        let pads = [[], []];
        Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => pads.map((pressed, index) => ({
            index, id: `Fighting ${index}`, mapping: 'standard', connected: true, axes: [0,0,0,0],
            buttons: Array.from({length:17}, (_, button) => ({ pressed: pressed.includes(button), value: pressed.includes(button) ? 1 : 0 })),
        })) });
        const frame = count => { for (let i = 0; i < count; i++) {
            Engine.events.emit('PreUpdate', 0); level.OnUpdate(1 / 60); Engine.events.emit('PostUpdate', 0);
        } };
        try {
            frame(1); pads[0] = [5]; frame(25);
            const power = level.playerOne.shotsFired === 1 && level.playerTwo.shotsFired === 0;
            frame(100);
            const noRepeat = level.playerOne.shotsFired === 1;
            pads[0] = []; frame(1); level.playerOne.meter = 100;
            pads[0] = [7]; frame(25);
            const superPower = level.playerOne.shotsFired === 2 && level.playerOne.meter < 60;
            pads[0] = []; frame(50); pads[0] = [0]; frame(1);
            const jump = level.playerOne.velocity.y < 0 && level.playerOne.state === 'jump';
            pads[0] = []; frame(50); pads[1] = [5]; frame(25);
            const secondPad = level.playerTwo.shotsFired === 1;
            pads = [[], []]; frame(1); pads[0] = [9]; frame(1);
            const help = level.hud.help.visible;
            pads = [[], []]; frame(1);
            // A short tap during hit-stop is captured by the framework input event, then consumed later.
            level.StartRound(true); level.roundState = 'fight';
            pads[0] = [5]; Engine.events.emit('PreUpdate', 0); Engine.events.emit('PostUpdate', 0);
            pads[0] = []; Engine.events.emit('PreUpdate', 0); Engine.events.emit('PostUpdate', 0);
            frame(25);
            const bufferedTap = level.playerOne.shotsFired === 1;
            const entities = level.entities.length;
            level.OnDrawn(); level.OnGUI();
            level.OnExit();
            return { power, noRepeat, superPower, jump, secondPad, help, bufferedTap,
                clean: reader.removeFrame === null && level.entities.length === 0 && document.querySelectorAll('canvas').length === 0, entities };
        } finally {
            if (original) Object.defineProperty(navigator, 'getGamepads', original);
            else delete navigator.getGamepads;
            Input.Update(); Input.LateUpdate();
        }
    });
    for (const key of ['power','noRepeat','superPower','jump','secondPad','help','bufferedTap','clean']) assert.equal(result[key], true, `${key}: ${JSON.stringify(result)}`);
    assert.equal(result.entities, 8);
}
module.exports = { inspectFightingGamepad };
