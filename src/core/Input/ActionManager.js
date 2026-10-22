import { Input } from "./Input.js";
import { GamepadAlias } from "./GamepadAlias.js";

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
    static mappings = {};
    static input = Input;

    /**
     * Replaces all mappings using values loaded from a game config.
     * @param {Object} configMappings - Map of action names to input rules.
     * @returns {void}
     */
    static LoadMappings(configMappings) {
        this.mappings = configMappings || {};
    }

    /**
     * Assigns rules for one action.
     * @param {string} actionName - Game-defined action name.
     * @param {Object[]} [rules=[]] - Rules produced by `this.input.Keyboard` or gamepad helpers.
     * @returns {typeof ActionManager} This action manager class.
     */
    static MapAction(actionName, rules = []) {
        this.mappings[actionName] = rules;
        return this;
    }

    /**
     * Tests whether any mapped input was pressed this frame.
     * @param {string} actionName - Game-defined action.
     * @returns {boolean} Whether the action went down.
     */
    static IsActionDown(actionName) {
        return this.GetRules(actionName).some(rule => {
            if (rule.device === "keyboard") return this.input.GetKeyDown(rule.input);
            if (rule.device === "gamepad") return this.IsGamepadInputDown(rule.input, rule.padIndex);
            return false;
        });
    }

    /**
     * Tests whether any mapped input was released this frame.
     * @param {string} actionName - Game-defined action.
     * @returns {boolean} Whether the action went up.
     */
    static IsActionUp(actionName) {
        return this.GetRules(actionName).some(rule => {
            if (rule.device === "keyboard") return this.input.GetKeyUp(rule.input);
            if (rule.device === "gamepad") return this.IsGamepadInputUp(rule.input, rule.padIndex);
            return false;
        });
    }

    /**
     * Tests whether an action currently exceeds its digital threshold.
     * @param {string} actionName - Game-defined action.
     * @returns {boolean} Whether the action is held.
     */
    static IsAction(actionName) {
        return this.GetActionValue(actionName) > 0.5;
    }

    /**
     * Reads the greatest mapped input strength, retaining analog axis intensity.
     * @param {string} actionName - Game-defined action.
     * @returns {number} Action value from zero to one.
     */
    static GetActionValue(actionName) {
        let value = 0;

        this.GetRules(actionName).forEach(rule => {
            if (rule.device === "keyboard" && this.input.GetKey(rule.input)) {
                value = 1;
            }

            if (rule.device === "gamepad") {
                value = Math.max(value, this.GetGamepadInputValue(rule.input, rule.padIndex));
            }
        });

        return value;
    }

    static IsGamepadInputDown(input, padIndex = null) {
        const resolved = this.ResolveGamepadInput(input);
        return this.GetPadIndices(padIndex).some(index => {
            if (this.input.GetGamepadButtonDown(index, resolved)) return true;
            return this.input.GetGamepadAxisDown(index, resolved);
        });
    }

    static IsGamepadInputUp(input, padIndex = null) {
        const resolved = this.ResolveGamepadInput(input);
        return this.GetPadIndices(padIndex).some(index => {
            if (this.input.GetGamepadButtonUp(index, resolved)) return true;
            return this.input.GetGamepadAxisUp(index, resolved);
        });
    }

    static GetGamepadInputValue(input, padIndex = null) {
        const resolved = this.ResolveGamepadInput(input);
        const buttonIndex = GamepadAlias.ResolveButtonIndex(resolved, this.input.GamepadAliasOptions());
        const axis = GamepadAlias.ResolveAxis(resolved, this.input.GamepadAliasOptions());
        let value = 0;

        this.GetPadIndices(padIndex).forEach(index => {
            if (buttonIndex !== null && this.input.GetGamepadButton(index, buttonIndex)) {
                value = 1;
            }

            if (axis) {
                const axisValue = this.input.GetGamepadAxis(index, axis.index);
                const directionalValue = axis.direction === "positive" ? axisValue : -axisValue;
                value = Math.max(value, Math.max(0, directionalValue));
            }
        });

        return value;
    }

    static GetRules(actionName) {
        return Array.isArray(this.mappings[actionName]) ? this.mappings[actionName] : [];
    }

    static GetPadIndices(padIndex = null) {
        return Number.isInteger(padIndex) ? [padIndex] : this.input.GetConnectedGamepadIndices();
    }

    static ResolveGamepadInput(input) {
        return GamepadAlias.Resolve(input, this.input.GamepadAliasOptions());
    }
}
