import { Level3D } from "../Template/Level3D.js";
import { ScreenUI } from "../Window/ScreenUI.js";
import { Player3D } from "./Player3D.js";
import { Coin3D } from "./Coin3D.js";
import { Floor3D } from "./Floor3D.js";
import { Camera3D } from "../Root/Camera3D.js";

export class CubeGameLevel extends Level3D {
    constructor() {
        super("gameCanvas3D", 800, 600);
        this.TelaId = "CubeGame";
        this.caption = "GameForgeJS - 3D Mini Game";

        this.ui = new ScreenUI("gameCanvasUI", 800, 600);
        this.score = 0;
    }

    OnStart() {
        super.OnStart();

        this.mainCamera = new Camera3D(this.screen3D);

        this.floor = new Floor3D(this.screen3D);
        this.player = new Player3D(this.screen3D);
        this.coin = new Coin3D(this.screen3D);

        this.AddEntity(this.floor);
        this.AddEntity(this.player);
        this.AddEntity(this.coin);
    }

    OnUpdate(dt) {
        super.OnUpdate(dt);

        // --- Checagem de Colisão 3D ---
        const p1 = this.player.transform.position;
        const p2 = this.coin.transform.position;

        // Aplica o Teorema de Pitágoras no espaço 3D
        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];
        const dz = p2[2] - p1[2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Se a distância for menor que a soma dos tamanhos (0.5 do player + 0.2 da moeda = 0.7)
        if (distance < 0.7) {
            this.score += 10;
            this.coin.Respawn();
        }

        if (this.mainCamera && this.player) {
            this.mainCamera.Follow(this.player);
            this.mainCamera.Update();
        }
    }

    OnDrawn() {
        this.screen3D.Refresh();

        // Passa a câmera para cada entidade
        this.entities.forEach(entity => {
            if (typeof entity.OnDrawn === "function") {
                entity.OnDrawn(this.mainCamera);
            }
        });

        // Desenha a UI 2D por cima
        if (this.ui) {
            this.ui.Refresh();
            this.OnGUI();
        }
    }

    OnGUI() {
        const draw = this.ui.Draw;

        draw.Color = "#FFD700";
        draw.FontSize = "30px";
        draw.Font = "Arial Bold";
        draw.SetTextAlign("left");
        draw.DrawText(`Score: ${this.score}`, 20, 50);

        draw.Color = "#FFFFFF";
        draw.FontSize = "16px";
        draw.DrawText("Use W, A, S, D para se mover na dimensão 3D", 20, 580);
    }
}