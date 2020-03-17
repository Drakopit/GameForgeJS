import { Screen } from "../Scripts/Window/Screen.js";
import { Menu } from "../Scripts/GUI/Menu.js";
import { Input } from "../Scripts/Inputs/Input.js";
import { Level } from "./Level.js";
import { Draw } from "../Scripts/Drawing/Draw.js";


////////////////////////
//////// OBJECTS ////////
//////////////////////////

// Tela
export var Tela = new Screen("MenuPrincipal", 640, 480);// Máquina de estado do Level

// Menu Base
export var MenuPrincipal = new Menu(Tela);

// Keyboard events
var Teclado = new Input(Tela);

// Draw
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
// Estado inicial
var menuState;

export class Level00 extends Level {
	constructor() {
		super();
		this.caption = "Menu Principal";
	}

	static OnStart() {
		Tela.Init("MenuPrincipal");
		console.log("Start");
		MenuPrincipal.OnStart();
		menuState = MENU_STATE.RUNNING;
	}

	static OnUpdate() {
		MenuPrincipal.OnUpdate();
	}

	static OnFixedUpdate(dt) {
		Tela.Refresh();

		// FPS
		if (UpdateFPS > UpdateFPSPerFrame) {
			UpdateFPS = 0;
			FPS = Math.ceil(1000 / dt);
		}
		UpdateFPS++;	

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

	static OnDrawn() {
		draw.Color = "lime";
		draw.DrawText(`FPS: ${FPS}`, 10, 10);	
	}

	static OnGUI() {
		MenuPrincipal.OnGUI();
	}
}

/**
 * @doc FPSCounter
 * @description Method that update the current FPS
 */
// Level00.prototype.FPSCounter = function() {
// 	if (UpdateFPS > UpdateFPSPerFrame) {
// 		UpdateFPS = 0;
// 		FPS = Math.floor(1 / deltaTime);
// 	}
// 	UpdateFPS++;
// }