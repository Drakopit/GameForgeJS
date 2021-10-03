import { Screen } from "../Scripts/Window/Screen.js";
import { Scene } from "../Scripts/Root/Scene.js";
import { Player } from "./TopDown/Entities/Player.js";
import { NPC } from "./TopDown/Entities/NPC.js";
import { DebugMap } from "../Scripts/Root/DebugMap.js";
import { Vector2D } from "../Scripts/Math/Vector2D.js";
import { Camera } from "../Scripts/Root/Camera.js";
import { Level } from "./Level.js";

// Estrutura que carrega todas informações de cunho global do level
var StructLevel = {
	// Tela
	Tela: null,
	// Mapa carregado de um JSON
	Mapa: null,
	// Mapa de Teste
	MapaTeste: null,
	// Jogador
	Jogador: null,
	// Npc
	Npc: null,
	// Camera
	ViewPort: null,
	// Constante de dimensões do Jogo
	GameWorld: null,
	// Máquina de estado do Level
	WORLD_STATE: null,
	// Estado inicial
	worldState: null,
	// Entidades
	Entities: []
}

export class Level02 extends Level {
	constructor() {
		super();
		this.caption = "Segunda Fase";
	}

	OnStart() {
		// Tela.Init("Fase02");
		StructLevel.Mapa.CallScene("PrimeiraFase", "Fase_02");
		// Necessário pra usar o MapaTeste
		StructLevel.MapStructure = [
			1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
			1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
			1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
			1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
			1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
			1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
			1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
			1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
			1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
			1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
			1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
			1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
			1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
		];
		StructLevel.MapaTeste.SetTileSize(new Vector2D(64, 64));
		StructLevel.MapaTeste.SetMapSize(new Vector2D(16, 16));
		StructLevel.ViewPort.Init(StructLevel.Tela, StructLevel.GameWorld);
	}

	OnUpdate() { }

	OnFixedUpdate(dt) {
		StructLevel.Tela.Refresh();

		switch (StructLevel.worldState) {
			case StructLevel.WORLD_STATE.GAME_MENU:

				break;
			case StructLevel.WORLD_STATE.GAME_PAUSE:
				// Pause do Jogo
				break;
			case StructLevel.WORLD_STATE.GAME_RUNING:
				this.WorldRunning(dt);
				break;
			default:
		}
	}
}

Level02.prototype.WorldRunning = (dt) => {
	StructLevel.Tela.Refresh();

	// Adiciona todos os objetos da cena
	for (const object of StructLevel.Entities) {
		object.OnUpdate();
		object.OnFixedUpdate(dt);
		StructLevel.ViewPort.Update(StructLevel.Jogador);
		StructLevel.ViewPort.Begin();
		object.OnDrawnSelf();
		StructLevel.ViewPort.DrawnSelf();
		StructLevel.ViewPort.End();
		object.OnGUI(dt);
	}
};

Level02.prototype.InitializeDependencies = () => {
	// Tela
	StructLevel.Tela = new Screen("PrimeiraFase", 640, 480);
	StructLevel.Tela.Init("Fase02");
	// Mapa carregado de um JSON
	StructLevel.Mapa = new Scene("PrimeiraFase", StructLevel.Tela);
	// Mapa de Teste
	StructLevel.MapaTeste = new DebugMap(StructLevel.Tela);
	// Jogador
	StructLevel.Jogador = new Player(StructLevel.Tela);
	// Npc
	StructLevel.Npc = new NPC(StructLevel.Tela);
	// Camera
	StructLevel.ViewPort = new Camera(StructLevel.Jogador.position, new Vector2D(StructLevel.Tela.Width, StructLevel.Tela.Height));
	// Constante de dimensões do Jogo
	StructLevel.GameWorld = {
		width: (StructLevel.MapaTeste.mapWidth * StructLevel.MapaTeste.tileW),
		height: (StructLevel.MapaTeste.mapHeight * StructLevel.MapaTeste.tileH)
	};
	// Máquina de estado do Level
	StructLevel.WORLD_STATE = Object.freeze({
		GAME_MENU: 0,
		GAME_RUNING: 1,
		GAME_PAUSE: 2
	});
	// Estado inicial
	StructLevel.worldState = StructLevel.WORLD_STATE.GAME_RUNING;

	// Carrega as entidades
	StructLevel.Entities.push(StructLevel.Jogador, StructLevel.Npc);
}