import { Input } from "../Inputs/Input.js";
import { Draw } from "../Drawing/Draw.js";

export class Menu {
    constructor(screen) {
        // Interace com o teclado
        this.input = new Input();
        this.screen = screen;
        this.draw = new Draw(this.screen);

        // Estados do Menu
        const MENU_STATES = Object.freeze({
            INITIALSTATE: 0,
            NEWGAME: 1,
            CONTINUE: 2,
            OPTIONS: 3,
            SHUTDOWN: 4
        });
        // Estado Atual do Menu
        this.state = MENU_STATES.INITIALSTATE;

        this.Menu = new Array("Novo Jogo", "Continuar", "Opções", "Sair");

        // Item selecionado do menu
        this.currentSelected = 0;        
    }

    Start() {
        this.draw.FontSize = "45px";
    }

    Update() {
        if (this.input.GetKeyDown("W")) {
            this.currentSelected--;
            if (this.currentSelected < 0) {
                this.currentSelected = (this.Menu.length - 1);
            }
        } else if (this.input.GetKeyDown("S")) {
            this.currentSelected++;
            if (this.currentSelected > (this.Menu.length - 1)) {
                this.currentSelected = 0;
            }
        }

        if (this.input.GetKeyDown("Enter")) {
            // Faz o que estiver na opção
        }
    }

    FixedUpdate() {}
 
    DrawSelf() {}

    OnGUI() {
        for (let i = 0; i <= 3; i++) {
            if (i == this.currentSelected) {
                this.draw.Color = "lightgray";
            } else {
                this.draw.Color = "green";
            }
            this.draw.DrawText(this.Menu[i], 32, 32 + i * 16);
        }
    }
}