import { Screen } from "../Scripts/Window/Screen.js";
import { Menu } from "../Scripts/GUI/Menu.js";
import { Input, KeyCode } from "../Scripts/Inputs/Input.js";
import { Level } from "./Level.js";
import { KeyBoard, KeyResponse } from "../Scripts/Inputs/KeyBoard.js";

// Estrutura que carrega todas informações de cunho global do level
var StructLevel = {
	Tela: null, // Tela
	MenuPrincipal: null, // Menu Base
	Teclado: null, // Keyboard events
	KeyCode: null, // KeyCodes
	MENU_STATE: null, // Estado do Menu
	menuState: null // Estado inicial
}

export class Level00 extends Level {
	constructor() {
		super();
		// Título da fase
		this.caption = "Menu Principal";
		document.title = this.caption;

		// Administrador de níveis
		this.levelHandler;
	}

	OnStart() {
		// Inicializa as depêndencias do nível
		this.InitializeDependencies();

		// Inicializa o Menu
		StructLevel.MenuPrincipal.OnStart();
		
		// Seta o estado do Menu
		StructLevel.menuState = StructLevel.MENU_STATE.RUNNING;
	}

	OnUpdate() {
		// Atualiza o Menus
		StructLevel.MenuPrincipal.OnUpdate();
	}

	OnFixedUpdate(dt) {
		// Atualiza a Tela
		StructLevel.Tela.Refresh();
		
		// TODO: Verificar melhora no método de receber informações do teclado
		// Escolhe uma opção do Menu
		if (KeyResponse.getKeyDown == KeyCode["Enter"]) {
			StructLevel.menuState = StructLevel.MenuPrincipal.currentSelected;
			
			// Reseta a Tecla
			KeyResponse.getKeyDown = 0;
		}

		switch (StructLevel.menuState) {
			case StructLevel.MENU_STATE.NEWGAME:
				console.log("Novo Jogo: ");
				this.levelHandler.current.Next = true;
				StructLevel.menuState = StructLevel.MENU_STATE.RUNNING
				// StructLevel = null;
				break;
			case StructLevel.MENU_STATE.LOADGAME:
				console.log("Carregar Jogo!");
				StructLevel.menuState = StructLevel.MENU_STATE.RUNNING
				break;
			case StructLevel.MENU_STATE.OPTIONS:
				console.log("Opções!");
				StructLevel.menuState = StructLevel.MENU_STATE.RUNNING
				break;
			case StructLevel.MENU_STATE.QUIT:
				console.log("Sair!");
				StructLevel.menuState = StructLevel.MENU_STATE.RUNNING
				break;
			default: StructLevel.menuState = StructLevel.MENU_STATE.RUNNING;
		}
	}

	OnGUI() {
		StructLevel.MenuPrincipal.OnGUI();
	}
}

Level00.prototype.InitializeDependencies = function() {
	// Tela
	StructLevel.Tela = new Screen("MenuPrincipal", 640, 480);// Máquina de estado do Level
	StructLevel.Tela.Init("MenuPrincipal");	// Inicializa a tela do Jogo

	// Keyboard Events
	StructLevel.Teclado = new Input(StructLevel.Tela);
	StructLevel.Teclado.AddEvents(KeyBoard.GetKeyDown, KeyBoard.GetKeyUp, KeyBoard.GetKeyPress);

	// Menu Base
	StructLevel.MenuPrincipal = new Menu(StructLevel.Tela, StructLevel.Teclado);

	// Estado do Menu
	StructLevel.MENU_STATE = Object.freeze({
		RUNNING: null,
		NEWGAME: 0,
		LOADGAME: 1,
		OPTIONS: 2,
		QUIT: 3
	});
	// Estado inicial
	StructLevel.menuState = StructLevel.MENU_STATE.RUNNING;
}