// Ficheiro: Input/ActionManager.js
import { Input } from "./Input.js";
import { GamePad } from "./GamePad.js";
import { Touch } from "./Touch.js";

export class ActionManager {
    static mappings = {};

    // Recebe a secção "actionMappings" do config.json
    static LoadMappings(configMappings) {
        this.mappings = configMappings || {};
    }

    /**
     * Verifica se a ação foi APERTADA NESTE FRAME (GetKeyDown equivalente)
     */
    static IsActionDown(actionName) {
        const rules = this.mappings[actionName];
        if (!rules) return false;

        for (let rule of rules) {
            if (rule.device === "keyboard") {
                if (Input.GetKeyDown(rule.input)) return true;
            } 
            else if (rule.device === "gamepad") {
                let btnIndex = parseInt(rule.input.split('_')[1]);
                if (GamePad.instance && GamePad.instance.GetButtonDown(btnIndex)) return true;
            }
        }
        return false;
    }

    /**
     * Verifica se a ação está A SER SEGURADA (GetKey equivalente)
     */
    static IsAction(actionName) {
        const rules = this.mappings[actionName];
        if (!rules) return false;

        for (let rule of rules) {
            if (rule.device === "keyboard") {
                if (Input.GetKey(rule.input)) return true;
            } 
            else if (rule.device === "gamepad") {
                if (rule.input.startsWith("button_")) {
                    let btnIndex = parseInt(rule.input.split('_')[1]);
                    if (GamePad.instance && GamePad.instance.GetButton(btnIndex)) return true;
                }
                else if (rule.input.startsWith("axis_")) {
                    // Exemplo: axis_0_positive (analógico X para a direita)
                    let parts = rule.input.split('_');
                    let axisIndex = parseInt(parts[1]);
                    let direction = parts[2]; // 'positive' ou 'negative'
                    
                    if (GamePad.instance) {
                        let val = GamePad.instance.GetAxis(axisIndex);
                        if (direction === 'positive' && val > 0.5) return true;
                        if (direction === 'negative' && val < -0.5) return true;
                    }
                }
            }
        }
        return false;
    }
}