import { Level3D } from "../Template/Level3D.js";
import { CubeEntity } from "./CubeEntity.js";
import { ScreenUI } from "../Window/ScreenUI.js"; // Importando sua nova classe!

export class TechDemo3DLevel extends Level3D {
	constructor() {
		super("gameCanvas3D", 800, 600);
		this.TelaId = "Demo3D";
		this.caption = "GameForgeJS - 3D Cube com ScreenUI";

		// CORREÇÃO DA SOBREPOSIÇÃO: Garante que o 3D também seja absoluto e fique no fundo
		this.screen3D.Canvas.style.position = "absolute";
		this.screen3D.Canvas.style.left = "0px";
		this.screen3D.Canvas.style.top = "0px";
		this.screen3D.Canvas.style.zIndex = "1"; // Fica atrás da UI (que tem zIndex 100)

		// Instancia a nova classe de Interface com apenas 1 linha!
		this.ui = new ScreenUI("gameCanvasUI", 800, 600);
	}

	OnStart() {
		super.OnStart();

		const myCube = new CubeEntity(this.screen3D);
		this.AddEntity(myCube);
	}

	OnDrawn() {
		// 1. Renderiza o mundo 3D
		super.OnDrawn();

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
		draw.DrawText("ScreenUI Classe Externa!", 20, 40);

		draw.Color = "#FFFFFF";
		draw.DrawText(`FPS: ${this.FPS}`, 750, 40);

		// Se suas entidades tiverem interface, você pode passar a UI para elas
		this.entities.forEach(entity => {
			if (typeof entity.OnGUI === "function") entity.OnGUI(this.ui);
		});
	}
}