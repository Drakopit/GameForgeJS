import { Screen } from "../Scripts/Window/Screen.js";
import { Menu } from "../Scripts/GUI/Menu.js";
import { Input } from "../Scripts/Inputs/Input.js";
import { Level } from "./Level.js";
import { Draw } from "../Scripts/Drawing/Draw.js";


////////////////////////
//////// OBJECTS ////////
//////////////////////////

// Screen
export var Tela = new Screen("MenuPrincipal", 640, 480);// Máquina de estado do Level

// Menu Base
export var MenuPrincipal = new Menu(Tela);

// Input class
var Teclado = new Input(Tela);

// Draw class
var draw = new Draw(Tela);

// FPS
var UpdateFPS = 0;
var UpdateFPSPerFrame = 10;
var FPS = 60;

// Estado do Menu
const MENU_STATE = Object.freeze({
	RUNNING: 0,
	NEWGAME: 1,
	LOADGAME: 2,
	OPTIONS: 3,
	QUIT: 4
});

// Intial state of menu
var menuState;

export class Level00 extends Level {
	constructor() {
		super();
		// Caption of the level
		this.caption = "Menu Principal";
	}

	static OnStart() {
		// Initialize screen
		Tela.Init("MenuPrincipal");
		// Starts menu
		MenuPrincipal.OnStart();
		// Set's menu state
		menuState = MENU_STATE.RUNNING;
	}

	static OnUpdate() {
		// Update menu logic
		MenuPrincipal.OnUpdate();
	}

	static OnFixedUpdate(dt) {
		// Refresh screen
		Tela.Refresh();

		// Update FPS
		this.UpdateFPSMethod(dt);	
		// Menu dynamics
		this.MenuDynamic();
	}

	static MenuDynamic() {
		// Check's if key Enter was pressed
		// And change menu state
		if (Teclado.GetKeyDown("Enter"))
			menuState = MenuPrincipal.currentSelected;
		
			// See the choice in menu
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

	static UpdateFPSMethod(dt) {
		if (UpdateFPS > UpdateFPSPerFrame) {
			UpdateFPS = 0;
			FPS = Math.ceil(1000 / dt);
		}
		// Count updates
		UpdateFPS++;
	}

	static OnDrawn() {
		// Draw FPS on screen
		draw.Color = "lime";
		draw.DrawText(`FPS: ${FPS}`, 10, 10);	
	}

	static OnGUI() {
		// Draw Menu on Gui
		MenuPrincipal.OnGUI();
	}
}