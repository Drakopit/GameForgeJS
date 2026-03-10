export class GamePad {
    constructor() {
        this.gamepads = {};
        this.previousButtons = {};

        // Ouve apenas as conexões
        window.addEventListener("gamepadconnected", (e) => {
            console.log(`GameForgeJS: Gamepad conectado no índice ${e.gamepad.index}: ${e.gamepad.id}`);
            this.gamepads[e.gamepad.index] = e.gamepad;
            this.previousButtons[e.gamepad.index] = [];
        });

        window.addEventListener("gamepaddisconnected", (e) => {
            console.log(`GameForgeJS: Gamepad desconectado do índice ${e.gamepad.index}`);
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
                    for(let b=0; b < pads[i].buttons.length; b++) this.previousButtons[i].push(false);
                }
            }
        }
    }

    LateUpdate() {
        // Salva o estado dos botões deste frame para comparar no próximo (Para o GetButtonDown)
        for (let index in this.gamepads) {
            let pad = this.gamepads[index];
            if (pad) {
                for (let b = 0; b < pad.buttons.length; b++) {
                    this.previousButtons[index][b] = pad.buttons[b].pressed;
                }
            }
        }
    }

    // Verifica se o botão está sendo segurado (0 = A/Cross, 1 = B/Circle, etc)
    GetButton(buttonIndex, padIndex = 0) {
        let pad = this.gamepads[padIndex];
        if (!pad) return false;
        return pad.buttons[buttonIndex].pressed;
    }

    // Verifica se o botão foi apertado NESTE exato frame
    GetButtonDown(buttonIndex, padIndex = 0) {
        let pad = this.gamepads[padIndex];
        if (!pad || !this.previousButtons[padIndex]) return false;
        return pad.buttons[buttonIndex].pressed && !this.previousButtons[padIndex][buttonIndex];
    }

    // Retorna o valor de um direcional analógico (0 = Left X, 1 = Left Y)
    GetAxis(axisIndex, padIndex = 0) {
        let pad = this.gamepads[padIndex];
        if (!pad) return 0;
        // Adiciona uma "Deadzone" para controles com analógico desgastado
        let val = pad.axes[axisIndex];
        return Math.abs(val) > 0.2 ? val : 0; 
    }
}