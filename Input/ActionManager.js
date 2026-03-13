import { Input } from "./Input.js";
import { GamePad } from "./GamePad.js";

export class ActionManager {
    static mappings = {};

    static LoadMappings(configMappings) {
        this.mappings = configMappings || {};
    }

    static IsActionDown(actionName) {
        const rules = this.mappings[actionName];
        if (!rules) return false;

        for (let rule of rules) {
            if (rule.device === "keyboard") {
                if (Input.GetKeyDown(rule.input)) return true;
            } 
            else if (rule.device === "gamepad" && GamePad.instance) {
                // A MÁGICA: Varrer todos os comandos conectados!
                for (let padIndex in GamePad.instance.gamepads) {
                    if (rule.input.startsWith("button_")) {
                        let btnIndex = parseInt(rule.input.split('_')[1]);
                        if (GamePad.instance.GetButtonDown(btnIndex, padIndex)) return true;
                    } 
                    else if (rule.input.startsWith("axis_")) {
                        let parts = rule.input.split('_');
                        let axisIndex = parseInt(parts[1]);
                        let direction = parts[2];
                        
                        let val = GamePad.instance.GetAxis(axisIndex, padIndex);
                        if (direction === 'positive' && val > 0.5) return true;
                        if (direction === 'negative' && val < -0.5) return true;
                    }
                }
            }
        }
        return false;
    }

    static IsAction(actionName) {
        const rules = this.mappings[actionName];
        if (!rules) return false;

        for (let rule of rules) {
            if (rule.device === "keyboard") {
                if (Input.GetKey(rule.input)) return true;
            } 
            else if (rule.device === "gamepad" && GamePad.instance) {
                // A MÁGICA: Varrer todos os comandos conectados!
                for (let padIndex in GamePad.instance.gamepads) {
                    if (rule.input.startsWith("button_")) {
                        let btnIndex = parseInt(rule.input.split('_')[1]);
                        if (GamePad.instance.GetButton(btnIndex, padIndex)) return true;
                    }
                    else if (rule.input.startsWith("axis_")) {
                        let parts = rule.input.split('_');
                        let axisIndex = parseInt(parts[1]);
                        let direction = parts[2];
                        
                        let val = GamePad.instance.GetAxis(axisIndex, padIndex);
                        if (direction === 'positive' && val > 0.5) return true;
                        if (direction === 'negative' && val < -0.5) return true;
                    }
                }
            }
        }
        return false;
    }
}