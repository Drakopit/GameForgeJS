/**
 * Maps game actions to one or more low-level keyboard or gamepad inputs.
 *
 * Use this layer in gameplay so controls can be configured per game while the
 * `Input` class remains responsible for raw per-frame state.
 *
 * @example
 * ActionManager.MapAction("JUMP", [
 *     Input.Keyboard("Space"),
 *     Input.GamepadButton("A"),
 * ]);
 * if (ActionManager.IsActionDown("JUMP")) player.Jump();
 */
export class ActionManager {
    static mappings: {};
    static input: typeof Input;
    /**
     * Replaces all mappings using values loaded from a game config.
     * @param {Object} configMappings - Map of action names to input rules.
     * @returns {void}
     */
    static LoadMappings(configMappings: any): void;
    /**
     * Assigns rules for one action.
     * @param {string} actionName - Game-defined action name.
     * @param {Object[]} [rules=[]] - Rules produced by `this.input.Keyboard` or gamepad helpers.
     * @returns {typeof ActionManager} This action manager class.
     */
    static MapAction(actionName: string, rules?: any[]): typeof ActionManager;
    /**
     * Tests whether any mapped input was pressed this frame.
     * @param {string} actionName - Game-defined action.
     * @returns {boolean} Whether the action went down.
     */
    static IsActionDown(actionName: string): boolean;
    /**
     * Tests whether any mapped input was released this frame.
     * @param {string} actionName - Game-defined action.
     * @returns {boolean} Whether the action went up.
     */
    static IsActionUp(actionName: string): boolean;
    /**
     * Tests whether an action currently exceeds its digital threshold.
     * @param {string} actionName - Game-defined action.
     * @returns {boolean} Whether the action is held.
     */
    static IsAction(actionName: string): boolean;
    /**
     * Reads the greatest mapped input strength, retaining analog axis intensity.
     * @param {string} actionName - Game-defined action.
     * @returns {number} Action value from zero to one.
     */
    static GetActionValue(actionName: string): number;
    static IsGamepadInputDown(input: any, padIndex?: any): boolean;
    static IsGamepadInputUp(input: any, padIndex?: any): boolean;
    static GetGamepadInputValue(input: any, padIndex?: any): number;
    static GetRules(actionName: any): any[];
    static GetPadIndices(padIndex?: any): any[];
    static ResolveGamepadInput(input: any): any;
}
import { Input } from "./Input.js";
