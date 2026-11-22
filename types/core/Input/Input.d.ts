/**
 * @doc Class Input
 * @namespace Input
 * @class Input
 * @author Patrick Faustino Camello
 * @summary Manages per-frame keyboard, mouse, touch and polled gamepad input.
 * @description Gamepad state is polled during the engine update so controllers
 *              already available to the browser are detected without reconnecting.
 * @Date 26/07/2024
 * @example
 * import { Input } from "./Input.js";
 * if (Input.GetKey("ArrowUp")) {
 *     // Execute some action
 * }
 * @returns {Object}
 */
export class Input {
    /** @type {Input | null} */
    static instance: Input | null;
    static Initialize(): Input;
    /** Isolated facade retaining the established input method names. */
    static CreateScoped({ config, ...options }?: {
        config?: {};
    }): {
        new ({ shared, target, events }?: {
            shared?: boolean;
            target?: Window & typeof globalThis;
            events?: import("../EventEmitter.js").EventEmitter;
        }): {
            target: Window & typeof globalThis;
            keys: {};
            keysDown: {};
            keysUp: {};
            pendingKeysDown: {};
            pendingKeysUp: {};
            keyDownHandler(event: any): void;
            keyUpHandler(event: any): void;
            blurHandler: () => any;
            mouse: Mouse;
            touch: Touch;
            gamepad: GamePad;
            presentation: InputPresentation;
            unsubscribe: (() => void)[];
            Dispose(): void;
        };
        instance: Input;
        config: {};
        Initialize(): Input;
        CreateScoped({ config, ...options }?: {
            config?: {};
        }): /*elided*/ any;
        /**
         * @description Polls input at the beginning of an engine frame.
         */
        Update(): void;
        /**
         * @description Clears transient input state at the end of an engine frame.
         */
        LateUpdate(): void;
        /** Release keyboard intent when focus moves into an engine-owned text editor. */
        ClearKeyboard(): void;
        /**
         * @doc Method
         * @description Check if a key is currently pressed
         * @param {string} key - The key code (e.g., "ArrowUp", "KeyA")
         * @returns {boolean} - True if the key is pressed, false otherwise
         * @example
         * if (Input.GetKey("ArrowUp")) { // Check if the "ArrowUp" key is pressed
         *     // Do something
         * }
         */
        GetKey(key: string): boolean;
        /**
         * @doc Method
         * @description Check if a key was pressed in the current frame
         * @param {string} key - The key code (e.g., "ArrowUp", "KeyA")
         * @returns {boolean} - True if the key was pressed in the current frame, false otherwise
         * @example
         * if (Input.GetKeyDown("ArrowUp")) { // Check if the "ArrowUp" key was pressed in the current frame
         *     // Do something
         * }
         */
        GetKeyDown(key: string): boolean;
        /**
         * @doc Method
         * @description Check if a key was released in the current frame
         * @param {string} key - The key code (e.g., "ArrowUp", "KeyA")
         * @returns {boolean} - True if the key was released in the current frame, false otherwise
         * @example
         * if (Input.GetKeyUp("ArrowUp")) { // Check if the "ArrowUp" key was released in the current frame
         *     // Do something
         * }
         */
        GetKeyUp(key: string): boolean;
        /**
         * Tests whether a browser gamepad is currently available.
         * @param {number} [padIndex=0] - Browser gamepad slot.
         * @returns {boolean} Whether that pad is connected.
         */
        IsGamepadConnected(padIndex?: number): boolean;
        /**
         * Returns all currently connected browser gamepad slots.
         * @returns {number[]} Connected gamepad indices.
         */
        GetConnectedGamepadIndices(): number[];
        /**
         * Reads a held gamepad button using a configured alias or browser index token.
         * @param {number} [padIndex=0] - Browser gamepad slot.
         * @param {string|number} input - Alias such as `A` or `DPAD_LEFT`.
         * @returns {boolean} Whether the button is held.
         */
        GetGamepadButton(padIndex?: number, input: string | number): boolean;
        /**
         * Reads a gamepad button press occurring in the current frame.
         * @param {number} [padIndex=0] - Browser gamepad slot.
         * @param {string|number} input - Configured alias or button index.
         * @returns {boolean} Whether the button went down.
         */
        GetGamepadButtonDown(padIndex?: number, input: string | number): boolean;
        /**
         * Reads a gamepad button release occurring in the current frame.
         * @param {number} [padIndex=0] - Browser gamepad slot.
         * @param {string|number} input - Configured alias or button index.
         * @returns {boolean} Whether the button went up.
         */
        GetGamepadButtonUp(padIndex?: number, input: string | number): boolean;
        /**
         * Reads an analog axis using an alias such as `LeftX`.
         * @param {number} [padIndex=0] - Browser gamepad slot.
         * @param {string|number} input - Configured axis alias or index.
         * @returns {number} Axis value from -1 to 1, or zero if unavailable.
         */
        GetGamepadAxis(padIndex?: number, input: string | number): number;
        GetGamepadAxisDown(padIndex: number, input: any, threshold?: number): boolean;
        GetGamepadAxisUp(padIndex: number, input: any, threshold?: number): boolean;
        /**
         * Builds an action mapping rule for keyboard input.
         * @param {string} input - Keyboard event code.
         * @returns {Object} Action mapping rule.
         */
        Keyboard(input: string): any;
        /**
         * Builds an action mapping rule for a gamepad button.
         * @param {string|number} input - Gamepad button alias or index.
         * @param {number|null} [padIndex=null] - Optional fixed gamepad slot.
         * @returns {Object} Action mapping rule.
         */
        GamepadButton(input: string | number, padIndex?: number | null): any;
        /**
         * Builds an action mapping rule for one direction of an analog axis.
         * @param {string|number} input - Gamepad axis alias or index.
         * @param {string|number} [direction="positive"] - Positive/negative direction or sign.
         * @param {number|null} [padIndex=null] - Optional fixed gamepad slot.
         * @returns {Object} Action mapping rule.
         */
        GamepadAxis(input: string | number, direction?: string | number, padIndex?: number | null): any;
        GamepadAliasOptions(): {
            profile: any;
            aliases: any;
        };
    };
    /**
     * @description Polls input at the beginning of an engine frame.
     */
    static Update(): void;
    /**
     * @description Clears transient input state at the end of an engine frame.
     */
    static LateUpdate(): void;
    /** Release keyboard intent when focus moves into an engine-owned text editor. */
    static ClearKeyboard(): void;
    /**
     * @doc Method
     * @description Check if a key is currently pressed
     * @param {string} key - The key code (e.g., "ArrowUp", "KeyA")
     * @returns {boolean} - True if the key is pressed, false otherwise
     * @example
     * if (Input.GetKey("ArrowUp")) { // Check if the "ArrowUp" key is pressed
     *     // Do something
     * }
     */
    static GetKey(key: string): boolean;
    /**
     * @doc Method
     * @description Check if a key was pressed in the current frame
     * @param {string} key - The key code (e.g., "ArrowUp", "KeyA")
     * @returns {boolean} - True if the key was pressed in the current frame, false otherwise
     * @example
     * if (Input.GetKeyDown("ArrowUp")) { // Check if the "ArrowUp" key was pressed in the current frame
     *     // Do something
     * }
     */
    static GetKeyDown(key: string): boolean;
    /**
     * @doc Method
     * @description Check if a key was released in the current frame
     * @param {string} key - The key code (e.g., "ArrowUp", "KeyA")
     * @returns {boolean} - True if the key was released in the current frame, false otherwise
     * @example
     * if (Input.GetKeyUp("ArrowUp")) { // Check if the "ArrowUp" key was released in the current frame
     *     // Do something
     * }
     */
    static GetKeyUp(key: string): boolean;
    /**
     * Tests whether a browser gamepad is currently available.
     * @param {number} [padIndex=0] - Browser gamepad slot.
     * @returns {boolean} Whether that pad is connected.
     */
    static IsGamepadConnected(padIndex?: number): boolean;
    /**
     * Returns all currently connected browser gamepad slots.
     * @returns {number[]} Connected gamepad indices.
     */
    static GetConnectedGamepadIndices(): number[];
    /**
     * Reads a held gamepad button using a configured alias or browser index token.
     * @param {number} [padIndex=0] - Browser gamepad slot.
     * @param {string|number} input - Alias such as `A` or `DPAD_LEFT`.
     * @returns {boolean} Whether the button is held.
     */
    static GetGamepadButton(padIndex?: number, input: string | number): boolean;
    /**
     * Reads a gamepad button press occurring in the current frame.
     * @param {number} [padIndex=0] - Browser gamepad slot.
     * @param {string|number} input - Configured alias or button index.
     * @returns {boolean} Whether the button went down.
     */
    static GetGamepadButtonDown(padIndex?: number, input: string | number): boolean;
    /**
     * Reads a gamepad button release occurring in the current frame.
     * @param {number} [padIndex=0] - Browser gamepad slot.
     * @param {string|number} input - Configured alias or button index.
     * @returns {boolean} Whether the button went up.
     */
    static GetGamepadButtonUp(padIndex?: number, input: string | number): boolean;
    /**
     * Reads an analog axis using an alias such as `LeftX`.
     * @param {number} [padIndex=0] - Browser gamepad slot.
     * @param {string|number} input - Configured axis alias or index.
     * @returns {number} Axis value from -1 to 1, or zero if unavailable.
     */
    static GetGamepadAxis(padIndex?: number, input: string | number): number;
    static GetGamepadAxisDown(padIndex: number, input: any, threshold?: number): boolean;
    static GetGamepadAxisUp(padIndex: number, input: any, threshold?: number): boolean;
    /**
     * Builds an action mapping rule for keyboard input.
     * @param {string} input - Keyboard event code.
     * @returns {Object} Action mapping rule.
     */
    static Keyboard(input: string): any;
    /**
     * Builds an action mapping rule for a gamepad button.
     * @param {string|number} input - Gamepad button alias or index.
     * @param {number|null} [padIndex=null] - Optional fixed gamepad slot.
     * @returns {Object} Action mapping rule.
     */
    static GamepadButton(input: string | number, padIndex?: number | null): any;
    /**
     * Builds an action mapping rule for one direction of an analog axis.
     * @param {string|number} input - Gamepad axis alias or index.
     * @param {string|number} [direction="positive"] - Positive/negative direction or sign.
     * @param {number|null} [padIndex=null] - Optional fixed gamepad slot.
     * @returns {Object} Action mapping rule.
     */
    static GamepadAxis(input: string | number, direction?: string | number, padIndex?: number | null): any;
    static GamepadAliasOptions(): {
        profile: any;
        aliases: any;
    };
    constructor({ shared, target, events }?: {
        shared?: boolean;
        target?: Window & typeof globalThis;
        events?: import("../EventEmitter.js").EventEmitter;
    });
    target: Window & typeof globalThis;
    keys: {};
    keysDown: {};
    keysUp: {};
    pendingKeysDown: {};
    pendingKeysUp: {};
    keyDownHandler(event: any): void;
    keyUpHandler(event: any): void;
    blurHandler: () => any;
    mouse: Mouse;
    touch: Touch;
    gamepad: GamePad;
    presentation: InputPresentation;
    unsubscribe: (() => void)[];
    Dispose(): void;
}
import { Mouse } from "./Mouse.js";
import { Touch } from "./Touch.js";
import { GamePad } from "./Gamepad.js";
import { InputPresentation } from './InputPresentation.js';
