import { Input } from "../Inputs/Input.js";
import { Draw } from "../Drawing/Draw.js";
import { Base } from "../Root/Base.js";

export class Menu extends Base {
    constructor(screen) {
        super();
        // Interace com o teclado
        this.screen = screen;
        this.input = new Input(this.screen);
        this.draw = new Draw(this.screen);

        this.options = new Array("Novo Jogo", "Continuar", "Opções", "Sair");

        // Item selecionado do menu
        this.currentSelected = 0;        
    }

    OnStart() {
        this.draw.FontSize = "45px";
    }

    OnUpdate() {
        if (this.input.GetKeyDown("W")) {
            this.currentSelected--;
            if (this.currentSelected < 0) {
                this.currentSelected = (this.options.length - 1);
            }
        } else if (this.input.GetKeyDown("S")) {
            this.currentSelected++;
            if (this.currentSelected > (this.options.length - 1)) {
                this.currentSelected = 0;
            }
        }

        if (this.input.GetKeyDown("Enter")) {
            // Faz o que estiver na opção
        }
    }

    OnGUI() {
        for (let i = 0; i <= 3; i++) {
            if (i == this.currentSelected) {
                this.draw.Color = "lightgray";
            } else {
                this.draw.Color = "green";
            }
            this.draw.DrawText(this.options[i], 320, 176 + i * 64);
        }
    }
}