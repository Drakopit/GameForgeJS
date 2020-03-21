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

// Time
var StartTime;
var LastTime;
var DeltaTime;

export class Engine extends Base {
	constructor() { super(); }

	static OnStart() {
		window.onload = () => {
			console.log('Engine was load!');
			var LevelHandler = window.LevelHandler;
			LevelHandler.levels.push(Level00, Level01, Level02);
			// Error not passind a instance
			LevelHandler.current = LevelHandler.levels[LevelHandler.Index + 1];
			LevelHandler.current.OnStart();
			this.OnFixedUpdate();
		};
	}

	static OnFixedUpdate() {
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

		LastTime = StartTime;
		let self = this;
		window.requestAnimationFrame(self.OnFixedUpdate.bind(self));
	}	
}
