import { Logger } from "../Root/Logger.js";

/**
 * @doc Class GamePad
 * @namespace Input
 * @class GamePad
 * @author Patrick Faustino Camello
 * @summary Manages gamepad input for the game framework.
 * @Date 15/05/2019
 * @example
 * const gamepad = new GamePad();
 * @returns {Object}
 * 
 */
export class GamePad {
    constructor() {
        this.gamepads = {};
        this.previousButtons = {};

        // Ouve apenas as conexões
        window.addEventListener("gamepadconnected", (e) => {
            Logger.log("info", `GameForgeJS: Gamepad conectado no índice ${e.gamepad.index}: ${e.gamepad.id}`, e.gamepad);
            this.gamepads[e.gamepad.index] = e.gamepad;
            this.previousButtons[e.gamepad.index] = [];
        });

        window.addEventListener("gamepaddisconnected", (e) => {
            Logger.log(`GameForgeJS: Gamepad desconectado do índice ${e.gamepad.index}`);
            delete this.gamepads[e.gamepad.index];
            delete this.previousButtons[e.gamepad.index];
        });

        if (!GamePad.instance) GamePad.instance = this;
        return GamePad.instance;
    }

    // ESTE MÉTODO PRECISA SER CHAMADO TODO FRAME PELA ENGINE!
    Update() {
        const pads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);

        for (let i = 0; i < pads.length; i++) {
            if (pads[i]) {
                // Atualiza o estado atual
                this.gamepads[i] = pads[i];

                // Inicializa o estado anterior se não existir
                if (!this.previousButtons[i]) {
                    this.previousButtons[i] = [];
                    // Adiciona proteção: só inicializa se buttons for iterável
                    if (pads[i].buttons) {
                        for (let b = 0; b < pads[i].buttons.length; b++) this.previousButtons[i].push(false);
                    }
                }
            }
        }
    }

    LateUpdate() {
        // Salva o estado dos botões deste frame para comparar no próximo (Para o GetButtonDown)
        for (let index in this.gamepads) {
            let pad = this.gamepads[index];
            // BLINDAGEM AQUI: Garante que pad.buttons existe e é iterável
            if (pad && pad.buttons) {
                for (let b = 0; b < pad.buttons.length; b++) {
                    // Mais uma proteção caso o array tenha "buracos"
                    if (pad.buttons[b]) {
                        this.previousButtons[index][b] = pad.buttons[b].pressed;
                    } else {
                        this.previousButtons[index][b] = false;
                    }
                }
            }
        }
    }

    // Verifica se o botão está sendo segurado (0 = A/Cross, 1 = B/Circle, etc)
    GetButton(buttonIndex, padIndex = 0) {
        let pad = this.gamepads[padIndex];

        // BLINDAGEM FATAL: Verifica se o gamepad existe, se tem o array buttons, e se o botão específico existe!
        if (!pad || !pad.buttons || !pad.buttons[buttonIndex]) return false;

        return pad.buttons[buttonIndex].pressed;
    }

    // Verifica se o botão foi apertado NESTE exato frame
    GetButtonDown(buttonIndex, padIndex = 0) {
        let pad = this.gamepads[padIndex];

        // BLINDAGEM FATAL IDÊNTICA
        if (!pad || !pad.buttons || !pad.buttons[buttonIndex] || !this.previousButtons[padIndex]) return false;

        return pad.buttons[buttonIndex].pressed && !this.previousButtons[padIndex][buttonIndex];
    }

    // Retorna o valor de um direcional analógico (0 = Left X, 1 = Left Y)
    GetAxis(axisIndex, padIndex = 0) {
        let pad = this.gamepads[padIndex];

        // BLINDAGEM: Garante que axes existe e o índice não é fora dos limites
        if (!pad || !pad.axes || typeof pad.axes[axisIndex] === 'undefined') return 0;

        // Adiciona uma "Deadzone" para controles com analógico desgastado
        let val = pad.axes[axisIndex];
        return Math.abs(val) > 0.2 ? val : 0;
    }
}