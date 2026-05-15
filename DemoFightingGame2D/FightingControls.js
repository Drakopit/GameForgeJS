import { Config } from "../Root/Config.js";

const DEFAULT_CONTROLS = Object.freeze({
    menu: {
        left: ["ArrowLeft", "KeyA"],
        right: ["ArrowRight", "KeyD"],
        up: ["ArrowUp", "KeyW"],
        down: ["ArrowDown", "KeyS"],
        confirm: ["Enter", "Space", "KeyJ", "KeyZ"],
        cancel: ["Escape", "Backspace"],
        gamepad: {
            up: { buttons: [12], axes: [{ index: 1, direction: "negative" }] },
            down: { buttons: [13], axes: [{ index: 1, direction: "positive" }] },
            left: { buttons: [14], axes: [{ index: 0, direction: "negative" }] },
            right: { buttons: [15], axes: [{ index: 0, direction: "positive" }] },
            confirm: [0, 9],
            cancel: [1, 8],
        },
    },
    playerOne: {
        left: ["KeyA"],
        right: ["KeyD"],
        up: ["KeyW"],
        down: ["KeyS"],
        light: ["KeyJ", "KeyZ"],
        heavy: ["KeyK", "KeyX"],
        special: ["KeyL", "KeyC"],
        gamepad: {
            index: 0,
            left: { buttons: [14], axes: [{ index: 0, direction: "negative" }] },
            right: { buttons: [15], axes: [{ index: 0, direction: "positive" }] },
            up: { buttons: [12], axes: [{ index: 1, direction: "negative" }] },
            down: { buttons: [13], axes: [{ index: 1, direction: "positive" }] },
            light: [2],
            heavy: [3],
            special: [5],
        },
    },
    playerTwo: {
        left: ["ArrowLeft"],
        right: ["ArrowRight"],
        up: ["ArrowUp"],
        down: ["ArrowDown"],
        light: ["Digit1", "Numpad1"],
        heavy: ["Digit2", "Numpad2"],
        special: ["Digit3", "Numpad3"],
        gamepad: {
            index: 1,
            left: { buttons: [14], axes: [{ index: 0, direction: "negative" }] },
            right: { buttons: [15], axes: [{ index: 0, direction: "positive" }] },
            up: { buttons: [12], axes: [{ index: 1, direction: "negative" }] },
            down: { buttons: [13], axes: [{ index: 1, direction: "positive" }] },
            light: [2],
            heavy: [3],
            special: [5],
        },
    },
});

export function GetFightingControls() {
    return DeepMerge(Clone(DEFAULT_CONTROLS), Config.data?.fighting?.controls ?? {});
}

function Clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function DeepMerge(target, source) {
    Object.entries(source ?? {}).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            target[key] = value.slice();
            return;
        }

        if (IsPlainObject(value)) {
            target[key] = DeepMerge(IsPlainObject(target[key]) ? target[key] : {}, value);
            return;
        }

        target[key] = value;
    });

    return target;
}

function IsPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
