import { Base } from "./Base.js";
import { Level00 } from "../../Jogo de Exemplo/Level00.js";
import { Level01 } from "../../Jogo de Exemplo/Level01.js";
import { Level02 } from "../../Jogo de Exemplo/Level02.js";

// Levels
export var LevelHandler = {
	levels: [],
	current: 0,
	Index: 0
};

// Time
var StartTime;
var LastTime;
var DeltaTime;

export class Engine extends Base {
	constructor() { super(); }

	static OnStart() {
		window.onload = () => {
			let level00 = new Level00();
			let level01 = new Level01();
			let level02 = new Level02();
			
			LevelHandler.levels.push(level00, level01, level02);
			LevelHandler.current = LevelHandler.levels[LevelHandler.Index];
			LevelHandler.current.levelHandler = LevelHandler;
			
			// Inicializa o nível em questão
			LevelHandler.current.OnStart();

			// Inicializa o loop
			this.OnFixedUpdate();
		};
	}

	static OnFixedUpdate() {
		StartTime = performance.now();
		DeltaTime = (1000.0 / (StartTime - LastTime));

		// Verificações da engine
		if (LevelHandler.current.Next) {
			LevelHandler.Index++;
			LevelHandler.current = LevelHandler.levels[LevelHandler.Index];
			LevelHandler.current.OnStart();
			LevelHandler.current.Next = false;
		}

		// Código da cena à ser atualizado
		LevelHandler.current.OnUpdate();
		LevelHandler.current.OnFixedUpdate(DeltaTime);
		LevelHandler.current.OnDrawn();
		LevelHandler.current.OnGUI();

		this.OnDrawn();

		LastTime = StartTime;
		let self = this;
		window.requestAnimationFrame(self.OnFixedUpdate.bind(self));
	}

	static OnDrawn() {
	}
}
