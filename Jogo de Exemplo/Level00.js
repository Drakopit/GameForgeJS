import { Screen } from "../Scripts/Window/Screen.js";
import { Menu } from "../Scripts/GUI/Menu.js";
import { Input } from "../Scripts/Inputs/Input.js";
import { Level } from "./Level.js";


////////////////////////
//////// OBJECTS ////////
//////////////////////////

// Tela
export var Tela = new Screen("MenuPrincipal", 640, 480);// Máquina de estado do Level
Tela.Init("MenuPrincipal");	// Inicializa a tela do Jogo

// Menu Base
export var MenuPrincipal = new Menu(Tela);

// Keyboard events
var Teclado = new Input(Tela);

// Estado do Menu
const MENU_STATE = Object.freeze({
	RUNNING: 0,
	NEWGAME: 1,
	LOADGAME: 2,
	OPTIONS: 3,
	QUIT: 4
});
// Estado inicial
var menuState;

export class Level00 extends Level {
	constructor() {
		super();
		this.caption = "Menu Principal";
	}

	static Start() {
		// Tela.Init("MenuPrincipal");
		console.log("Start");
		MenuPrincipal.OnStart();
		menuState = MENU_STATE.RUNNING;
	}

	static Update() {
		MenuPrincipal.OnUpdate();
	}

	static FixedUpdate(dt) {
		Tela.Refresh();

		if (Teclado.GetKeyDown("Enter")) menuState = MenuPrincipal.currentSelected;

		switch (menuState) {
			case MENU_STATE.NEWGAME:
				alert("Novo Jogo!");
				break;
			case MENU_STATE.LOADGAME:
				alert("Carregar Jogo!");
				break;
			case MENU_STATE.OPTIONS:
				alert("Opções!");
				break;
			case MENU_STATE.QUIT:
				alert("Sair!");
				break;
			default: menuState = MENU_STATE.RUNNING;
		}
	}

	static OnGUI() {
		MenuPrincipal.OnGUI();
	}
}