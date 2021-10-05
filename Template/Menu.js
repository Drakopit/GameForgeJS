import { Draw } from "../Drawing/Draw.js";
import { KeyCode, KeyResponse } from "../Input/Input.js";
import { Base } from "../Root/Base.js";

export class Menu extends Base {
    constructor(screen, input) {
        super();
        this.screen = screen;
        this.draw = new Draw(this.screen);

        this.options = new Array("Novo Jogo", "Continuar", "Opções", "Sair");

        // Item selecionado do menu
        this.currentSelected = 0;
    }

    OnStart() {
        this.draw.FontSize = "45px";
    }

    OnUpdate() {
        if (KeyResponse.getKeyDown == KeyCode["W"]) {
            KeyResponse.getKeyDown = 0;
            this.currentSelected--;
            if (this.currentSelected < 0) {
                this.currentSelected = (this.options.length - 1);
            }
        } else if (KeyResponse.getKeyDown == KeyCode["S"]) {
            KeyResponse.getKeyDown = 0;
            this.currentSelected++;
            if (this.currentSelected > (this.options.length - 1)) {
                this.currentSelected = 0;
            }
        }

    }

    OnGUI() {
        for (let i = 0; i <= 3; i++) {
            if (i == this.currentSelected) {
                this.draw.Color = "lightgray";
            } else {
                this.draw.Color = "lime";
            }
            this.draw.DrawText(this.options[i], 32, 64 + i * 64);
        }
    }
}