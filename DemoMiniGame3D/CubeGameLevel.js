import { Level3D } from "../Template/Level3D.js";
import { ScreenUI } from "../Window/ScreenUI.js";
import { Player3D } from "./Player3D.js";
import { Coin3D } from "./Coin3D.js";
import { Floor3D } from "./Floor3D.js";
import { Camera3D } from "../Root/Camera3D.js";
import { Screen3D } from "../Window/Screen3D.js";
import { Input } from "../Input/Input.js";
import { AssetManager } from "../Root/AssetManager.js";
import { Skybox3D } from "../Graphic/Skybox3D.js";
import { Char } from "./Char.js";

export class CubeGameLevel extends Level3D {
    constructor() {
        super();
        this.TelaId = "CubeGame";
        this.caption = "GameForgeJS - 3D Mini Game";
        this.score = 0;
    }

    OnStart() {
        // 1. Instancia as telas apenas quando a fase 3D for ativada pelo LevelHandler
        const width = 640;
        const height = 480;
        this.screen3D = new Screen3D("gameCanvas3D", width, height);
        this.ui = new ScreenUI("gameCanvasUI", width, height);

        // Ajuste de zIndex para sobreposição correta
        this.screen3D.Canvas.style.position = "absolute";
        this.screen3D.Canvas.style.zIndex = "1";

        this.mainCamera = new Camera3D(this.screen3D);

        // super.OnStart() configura o WebGL e chama OnStart das entidades já adicionadas.
        // Deve ser chamado ANTES de AddEntity para evitar dupla inicialização.
        super.OnStart();

        const skyImageCross = AssetManager.instance.GetImage("sky_cross");
        if (skyImageCross) {
            this.skybox = new Skybox3D(this.screen3D, skyImageCross);
            this.AddEntity(this.skybox);
        }

        this.floor  = new Floor3D(this.screen3D);
        this.player = new Player3D(this.screen3D);
        this.coin   = new Coin3D(this.screen3D);
        this.model  = new Char(this.screen3D, "character"); 

        this.AddEntity(this.floor);
        this.AddEntity(this.player);
        this.AddEntity(this.coin);
        this.AddEntity(this.model);
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

        if (Input.GetKeyDown("Escape")) {
            this.Back = true;
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

    OnExit() {
        // Limpeza estrita de memória exigida pela GameForgeJS
        if (this.screen3D && this.screen3D.Canvas) this.screen3D.Canvas.remove();
        if (this.ui && this.ui.Screen && this.ui.Screen.Canvas) this.ui.Screen.Canvas.remove();
    }
}