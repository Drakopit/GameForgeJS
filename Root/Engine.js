/**
 * @doc Class Engine
 * @namespace Root
 * @class Engine
 * @author Patrick Faustino Camello
 * @summary That class was made, to compose the EngineHtml5 framework.
 * @description It's the of the framework. This class run the whole game/app
 * @Date 15/05/2019
 * @returns void
 */

import { Base } from "./Base.js";
import { Level } from "../Template/Level.js";

// Level Handler
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
			// TODO: Preciso pensar em como farei para simplificar essa parte
			// Por hora

			//#region Inicialize as fazer do Jogo aqui
				let level = new Level();
			//#endregion

			// Adicione as fazes ao handler
			LevelHandler.levels.push(level);
			
			// Configure a primeira fazer
			LevelHandler.current = LevelHandler.levels[LevelHandler.Index]; // Set first level
			
			// Configura o levelHandler para ser acessado pelos objetos filhos
			LevelHandler.current.LEVEL_HANDLER = LevelHandler;
			
			// Inicializa a fase em questão
			LevelHandler.current.OnStart(); // Initialize the first level

			// Inicializa o loop
			this.OnFixedUpdate();
		};
	}

	static OnFixedUpdate() {
		StartTime = performance.now();
		DeltaTime = (1000.0 / (StartTime - LastTime));

		// Verificações da engine
		if (LevelHandler.current.Next) {
			// Remove o level anterior
			this.RemoveLevel(LevelHandler.current.TelaId);
			// Configura o novo nível
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

	static OnDrawn() {}

	static RemoveLevel(levelId) {
		let element = document.getElementById(levelId);
		element.parentNode.removeChild(element);
		// .parentNode.removeChild(levelId);
	}
}
