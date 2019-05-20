import { Input } from "../Inputs/Input.js";

export class Menu {
    constructor() {}

    Start() {
        // Interace com o teclado
        this.input = new Input();

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

    Update() {
        if (input.GetKeyDown("W")) {
            this.currentSelected--;
            if (this.currentSelected < 0) {
                this.currentSelected = (this.Menu.length - 1);
            }
        } else if (input.GetKeyDown("S")) {
            this.currentSelected++;
            if (this.currentSelected > (this.Menu.length - 1)) {
                this.currentSelected = 0;
            }
        }

        if (input.GetKeyDown("Enter")) {
            // Faz o que estiver na opção
        }
    }

    OnGUI() {}
}