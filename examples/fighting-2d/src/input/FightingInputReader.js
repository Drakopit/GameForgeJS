import { GetFightingControls } from './FightingControls.js';
import { keyboardHeld, keyboardDown, gamepadDirectionHeld, gamepadDirectionDown,
    gamepadButtonDown, gamepadButtonHeld, anyGamepadButtonDown } from './FightingInput.js';

export class FightingInputReader {
    constructor(context) {
        this.controls = GetFightingControls();
        this.held = new Map();
        this.queued = new Map();
        this.global = {};
        this.Capture();
        this.ClearQueued();
        // Input has already polled when this event runs. Preserve taps during hit-stop/round intro.
        this.removeFrame = context.events.on('PreUpdate', () => this.Capture());
    }

    Capture() {
        this.CapturePlayer('p1', this.controls.playerOne);
        this.CapturePlayer('p2', this.controls.playerTwo);
        this.global.help ||= keyboardDown(['KeyH']) || anyGamepadButtonDown(['START']);
        this.global.back ||= keyboardDown(this.controls.menu.cancel) || anyGamepadButtonDown(['BACK']);
        this.global.confirm ||= keyboardDown(this.controls.menu.confirm) || anyGamepadButtonDown(['A']);
    }

    CapturePlayer(id, keys) {
        const pad = keys.gamepad ?? {};
        const previous = this.held.get(id) ?? {};
        const current = {};
        const pending = this.queued.get(id) ?? {};
        for (const name of ['up', 'light', 'heavy', 'special', 'super']) {
            current[name] = name === 'up'
                ? keyboardHeld(keys.up) || gamepadDirectionHeld('up', pad.index, pad.up)
                : keyboardHeld(keys[name]) || gamepadButtonHeld(pad[name], pad.index);
            const down = name === 'up'
                ? keyboardDown(keys.up) || gamepadDirectionDown('up', pad.index, pad.up)
                : keyboardDown(keys[name]) || gamepadButtonDown(pad[name], pad.index);
            pending[name] ||= down || current[name] && !previous[name];
        }
        this.held.set(id, current);
        this.queued.set(id, pending);
    }

    Player(fighter) {
        const keys = fighter.input;
        const pad = keys.gamepad ?? {};
        this.CapturePlayer(fighter.id, keys);
        const input = { ...this.queued.get(fighter.id) };
        this.queued.delete(fighter.id);
        for (const direction of ['left', 'right', 'down']) {
            input[direction] = keyboardHeld(keys[direction]) || gamepadDirectionHeld(direction, pad.index, pad[direction]);
        }
        return input;
    }

    Consume(name, fallback) {
        const pressed = this.global[name] || fallback();
        this.global[name] = false;
        return pressed;
    }
    HelpPressed() { return this.Consume('help', () => keyboardDown(['KeyH']) || anyGamepadButtonDown(['START'])); }
    BackPressed() { return this.Consume('back', () => keyboardDown(this.controls.menu.cancel) || anyGamepadButtonDown(['BACK'])); }
    ConfirmPressed() { return this.Consume('confirm', () => keyboardDown(this.controls.menu.confirm) || anyGamepadButtonDown(['A'])); }
    ClearQueued() { this.queued.clear(); this.global = {}; }
    Dispose() { this.removeFrame?.(); this.removeFrame = null; this.queued.clear(); this.held.clear(); }
}
