import { Input } from "../Input/Input.js";
import { GamePad } from "../Input/GamePad.js";

const DEFAULT_DIRECTIONS = Object.freeze({
    up: { buttons: [12], axes: [{ index: 1, direction: "negative" }] },
    down: { buttons: [13], axes: [{ index: 1, direction: "positive" }] },
    left: { buttons: [14], axes: [{ index: 0, direction: "negative" }] },
    right: { buttons: [15], axes: [{ index: 0, direction: "positive" }] },
});

export function keyboardHeld(keys) {
    return asList(keys).some(key => Input.GetKey(key));
}

export function keyboardDown(keys) {
    return asList(keys).some(key => Input.GetKeyDown(key));
}

export function gamepadButtonHeld(buttons, padIndex = 0) {
    const pad = GamePad.instance;
    if (!pad) return false;
    return asList(buttons).some(button => pad.GetButton(button, padIndex));
}

export function gamepadButtonDown(buttons, padIndex = 0) {
    const pad = GamePad.instance;
    if (!pad) return false;
    return asList(buttons).some(button => pad.GetButtonDown(button, padIndex));
}

export function anyGamepadButtonDown(buttons) {
    const pad = GamePad.instance;
    if (!pad) return false;

    return Object.keys(pad.gamepads).some(padIndex => gamepadButtonDown(buttons, padIndex));
}

export function gamepadDirectionHeld(direction, padIndex = 0, binding = null) {
    const pad = GamePad.instance;
    if (!pad) return false;

    const resolved = directionBinding(direction, binding);
    if (asList(resolved.buttons).some(button => pad.GetButton(button, padIndex))) return true;

    return asList(resolved.axes).some(axis => {
        const axisValue = pad.GetAxis(axis.index, padIndex);
        return axis.direction === "positive" ? axisValue > 0.5 : axisValue < -0.5;
    });
}

export function gamepadDirectionDown(direction, padIndex = 0, binding = null) {
    const pad = GamePad.instance;
    if (!pad) return false;

    const resolved = directionBinding(direction, binding);
    if (asList(resolved.buttons).some(button => pad.GetButtonDown(button, padIndex))) return true;

    return asList(resolved.axes).some(axis => pad.GetAxisDown(axis.index, axis.direction, padIndex));
}

export function anyGamepadDirectionDown(direction, binding = null) {
    const pad = GamePad.instance;
    if (!pad) return false;

    return Object.keys(pad.gamepads).some(padIndex => gamepadDirectionDown(direction, padIndex, binding));
}

function directionBinding(direction, binding) {
    if (binding) return binding;
    return DEFAULT_DIRECTIONS[direction] ?? { buttons: [], axes: [] };
}

function asList(value) {
    if (Array.isArray(value)) return value;
    if (value === undefined || value === null) return [];
    return [value];
}
