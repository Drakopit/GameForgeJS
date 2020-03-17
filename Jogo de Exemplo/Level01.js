import { Screen } from "../Scripts/Window/Screen.js";
import { Scene } from "../Scripts/Root/Scene.js";
import { Player } from "./TopDown/Entities/Player.js";
import { NPC } from "./TopDown/Entities/NPC.js";
import { DebugMap } from "../Scripts/Root/DebugMap.js";
import { Vector2D } from "../Scripts/Math/Vector2D.js";
import { Camera } from "../Scripts/Root/Camera.js";
import { Level } from "./Level.js";


////////////////////////
//////// OBJECTS ////////
//////////////////////////

// Tela
export var Tela = new Screen("PrimeiraFase", 640, 480);
// Mapa carregado de um JSON
export var Mapa = new Scene("PrimeiraFase", Tela);
// Mapa de Debug
export var MapaTeste = new DebugMap(Tela);
var MapStructure = [];
// Jogador
export var Jogador = new Player(Tela);
// Npc
export var Npc = new NPC(Tela);
// Camera
export var ViewPort = new Camera(Jogador.position, new Vector2D(Tela.Width, Tela.Height));
// Constante de dimensões do Jogo
var GameWorld;
// Máquina de estado do Level
const WORLD_STATE = Object.freeze({
	GAME_MENU: 0,
	GAME_RUNING: 1,
	GAME_PAUSE: 2
});
// Estado inicial
var worldState = WORLD_STATE.GAME_RUNING;

// Entidades no Level
var Entities = [];

export class Level01 extends Level {
	constructor() {
		super();
		this.caption = "Primeira Fase";
	}

	static OnStart() {
		Tela.Init("Fase01");
		// Mapa.CallScene("PrimeiraFase", "Fase_01");
		// Necessário pra usar o MapaTeste
		MapStructure = [
			1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
			1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1,
			1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1,
			1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1,
			1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
			1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
			1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
			1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
			1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
			1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
			1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
			1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
			1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
		];
		MapaTeste.SetTileSize(new Vector2D(64, 64));
		MapaTeste.SetMapSize(new Vector2D(16, 16));
		GameWorld = {
			width: (MapaTeste.mapWidth * MapaTeste.tileW),
			height: (MapaTeste.mapHeight * MapaTeste.tileH)
		}
		ViewPort.Init(Tela, GameWorld);
		Entities.push(Jogador, Npc)
	}

	static OnUpdate() { }

	static OnFixedUpdate(dt) {
		Tela.Refresh();
		switch (worldState) {
			case WORLD_STATE.GAME_MENU:

				break;
			case WORLD_STATE.GAME_PAUSE:
				// Pause do Jogo
				break;
			case WORLD_STATE.GAME_RUNING:
				// Adiciona todos os objetos da cena
				for (const object of Entities) {
					object.OnUpdate();
					object.OnFixedUpdate(dt);
					ViewPort.OnUpdate(Jogador);
					ViewPort.OnBegin();
					object.DrawnSelf();
					ViewPort.OnDrawnSelf();
					ViewPort.OnEnd();
					object.OnGUI(dt);
				}
				break;
			default:
		}
	}
}