import { Level3D } from "../Template/Level3D.js";
import { CubeEntity } from "./CubeEntity.js";
import { ScreenUI } from "../Window/ScreenUI.js"; // Importando sua nova classe!
import { Screen3D } from "../Window/Screen3D.js";
import { Camera3D } from "../Root/Camera3D.js";


export class TechDemo3DLevel extends Level3D {
	constructor() {
		super();
		this.TelaId = "Demo3D";
		this.caption = "GameForgeJS - 3D Cube com ScreenUI";
	}

	OnStart() {
		const width = 640;
		const height = 480;
		this.screen3D = new Screen3D("gameCanvas3D", width, height);
		this.ui = new ScreenUI("gameCanvasUI", width, height);
		// Ajuste de zIndex para sobreposição correta
		this.screen3D.Canvas.style.position = "absolute";
		this.screen3D.Canvas.style.zIndex = "1";

		this.mainCamera = new Camera3D(this.screen3D);

		this.myCube = new CubeEntity(this.screen3D);
		this.AddEntity(this.myCube);

		super.OnStart();

	}

	OnUpdate(dt) {
		super.OnUpdate(dt);

		if (this.mainCamera && this.myCube) {
			this.mainCamera.Follow(this.myCube);
			this.mainCamera.Update();
		}
	}

	OnDrawn() {
		// 1. Renderiza o mundo 3D
		this.screen3D.Refresh();

		this.entities.forEach(entity => {
			if (typeof entity.OnDrawn === "function") {
				entity.OnDrawn(this.mainCamera);
			}
		});

		// 2. Atualiza a camada de UI
		if (this.ui) {
			this.ui.Refresh(); // Limpa os textos antigos
			this.OnGUI();      // Desenha os novos textos
		}
	}

	OnGUI() {
		// Acessa o Draw diretamente da sua nova ScreenUI
		const draw = this.ui.Draw;

		draw.Color = "#00FF00";
		draw.FontSize = "24px";
		draw.DrawText("ScreenUI HUD Example!", 20, 40);
		draw.DrawText("That's an example of a 3D level with a ScreenUI overlay.", 20, 70);

		draw.Color = "#FFFFFF";
		draw.DrawText(`FPS: ${this.FPS}`, 680, 40);

		// Se suas entidades tiverem interface, você pode passar a UI para elas
		this.entities.forEach(entity => {
			if (typeof entity.OnGUI === "function") entity.OnGUI(this.ui);
		});
	}


	OnExit() {
		// Limpeza estrita de memória exigida pela GameForgeJS
		if (this.screen3D && this.screen3D.Canvas) this.screen3D.Canvas.remove();
		if (this.ui && this.ui.Screen && this.ui.Screen.Canvas) this.ui.Screen.Canvas.remove();
	}
}