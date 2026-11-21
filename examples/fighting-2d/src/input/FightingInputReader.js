import { GetFightingControls } from './FightingControls.js';
import { Input } from 'gameforgejs/core';
import { FightingPadSeats } from './FightingPadSeats.js';
import { keyboardHeld, keyboardDown, gamepadDirectionHeld, gamepadDirectionDown,
    gamepadButtonDown, gamepadButtonHeld, anyGamepadButtonDown } from './FightingInput.js';

export class FightingInputReader {
    constructor(context, touch = null) {
        this.touch = touch;
        this.controls = structuredClone(GetFightingControls());
        this.seats = new FightingPadSeats();
        this.playerSeats = {playerOne:this.controls.playerOne.gamepad.index,playerTwo:this.controls.playerTwo.gamepad.index};
        this.held = new Map();
        this.queued = new Map();
        this.global = {};
        this.Capture();
        this.ClearQueued();
        // Input has already polled when this event runs. Preserve taps during hit-stop/round intro.
        this.removeFrame = context.events.on('PreUpdate', () => this.Capture());
    }

    Capture() {
        this.seats.Update(Input.GetConnectedGamepadIndices());
        for(const name of ['playerOne','playerTwo'])this.controls[name].gamepad.index=this.seats.Resolve(this.playerSeats[name]);
        this.touch?.Update();
        this.CapturePlayer('p1', this.controls.playerOne);
        this.CapturePlayer('p2', this.controls.playerTwo);
        this.global.help ||= keyboardDown(this.controls.system.help) || anyGamepadButtonDown(this.controls.system.gamepad.help);
        this.global.back ||= keyboardDown(this.controls.menu.cancel) || anyGamepadButtonDown(this.controls.menu.gamepad.cancel);
        this.global.confirm ||= keyboardDown(this.controls.menu.confirm) || anyGamepadButtonDown(this.controls.menu.gamepad.confirm);
    }

    CapturePlayer(id, keys) {
        const pad = keys.gamepad ?? {};
        const previous = this.held.get(id) ?? {};
        const current = {};
        const pending = this.queued.get(id) ?? {};
        for (const name of ['up', 'light', 'medium', 'heavy', 'special', 'super']) {
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
        input.crouch=keyboardHeld(keys.crouch)||gamepadDirectionHeld('down',pad.index,pad.crouch);
        this.queued.delete(fighter.id);
        for (const direction of ['left', 'right', 'down']) {
            input[direction] = keyboardHeld(keys[direction]) || gamepadDirectionHeld(direction, pad.index, pad[direction]);
        }
        if (fighter.id === 'p1' && this.touch) for (const [action, value] of Object.entries(this.touch.Read())) input[action] ||= value;
        return input;
    }

    Consume(name, fallback) {
        const pressed = this.global[name] || fallback();
        this.global[name] = false;
        return pressed;
    }
    HelpPressed() { return this.Consume('help', () => keyboardDown(this.controls.system.help) || anyGamepadButtonDown(this.controls.system.gamepad.help)); }
    BackPressed() { return this.Consume('back', () => keyboardDown(this.controls.menu.cancel) || anyGamepadButtonDown(this.controls.menu.gamepad.cancel)); }
    ConfirmPressed() { return this.Consume('confirm', () => keyboardDown(this.controls.menu.confirm) || anyGamepadButtonDown(this.controls.menu.gamepad.confirm)); }
    ClearQueued() { this.queued.clear(); this.global = {}; this.touch?.Clear(); }
    Dispose() { this.removeFrame?.(); this.removeFrame = null; this.queued.clear(); this.held.clear(); }
}
