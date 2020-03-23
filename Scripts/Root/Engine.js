import { Base } from "./Base.js";
import { Level00 } from "../../Jogo de Exemplo/Level00.js";
import { Level01 } from "../../Jogo de Exemplo/Level01.js";
import { Level02 } from "../../Jogo de Exemplo/Level02.js";

// Levels (That's global because need be acessed from anywhere)
window.LevelHandler = {
	levels: [],
	current: undefined,
	Index: 0
};

// It's necessary to calcule deltaTime
var StartTime;
var LastTime;
var DeltaTime;

export class Engine extends Base {
	constructor() { super(); }

	// Starts Engine
	static OnStart() {
		window.onload = () => {
			// Debug message
			console.log('Engine was load!');
			// Get a LevelHandler global to a local
			// To let it more easy.
			let LevelHandler = window.LevelHandler;
			LevelHandler.levels.push(Level00, Level01, Level02);
			// Error not passind a instance
			LevelHandler.current = LevelHandler.levels[LevelHandler.Index + 1];
			// Starts Level
			LevelHandler.current.OnStart();
			this.OnFixedUpdate();
		};
	}

	static OnFixedUpdate() {
		// Get delta time
		StartTime = performance.now();
		DeltaTime = (1000.0 / (StartTime - LastTime));

		// Verificações da engine
		if (LevelHandler.current.Next) {
			LevelHandler.Index++;
			LevelHandler.current = levels[LevelHandler.Index];
		}

		// Código da cena à ser atualizado
		LevelHandler.current.OnUpdate();
		LevelHandler.current.OnFixedUpdate(DeltaTime);
		LevelHandler.current.OnDrawn(DeltaTime);
		LevelHandler.current.OnGUI();

		// Calcule time elapsed
		LastTime = StartTime;

		// Get reference to call animationFrame
		let self = this;
		window.requestAnimationFrame(self.OnFixedUpdate.bind(self));
	}
}
