import { Level3D } from "../Template/Level3D.js";
import { ScreenUI } from "../Window/ScreenUI.js";
import { Player3D } from "./Player3D.js";
import { Coin3D } from "./Coin3D.js";
import { Floor3D } from "./Floor3D.js";
import { Camera3D } from "../Root/Camera3D.js";
import { Screen3D } from "../Window/Screen3D.js";
import { ActionManager } from "../Input/ActionManager.js";
import { AssetManager } from "../Root/AssetManager.js";
import { Skybox3D } from "../Graphic/Skybox3D.js";
import { DirectionalLight3D } from "../Graphic/Light3D.js";
import { Char } from "./Char.js";

const ARENA = {
    minX: -4.0,
    maxX: 4.0,
    minZ: -12.0,
    maxZ: -3.0,
};

const COIN_SPAWNS = [
    [-3.25, -10.75],
    [3.25, -10.15],
    [-3.30, -4.35],
    [3.15, -5.10],
    [0.00, -8.20],
];

export class CubeGameLevel extends Level3D {
    constructor() {
        super();
        this.TelaId = "CubeGame";
        this.caption = "GameForgeJS - 3D Mini Game";
        this.goalCoins = COIN_SPAWNS.length;
        this.score = 0;
        this.collectedCoins = 0;
        this.coinSpawnIndex = 0;
        this.gameState = "PLAYING";
    }

    OnStart() {
        this.entities = [];
        this.score = 0;
        this.collectedCoins = 0;
        this.coinSpawnIndex = 0;
        this.gameState = "PLAYING";

        const width = 640;
        const height = 480;
        this.screen3D = new Screen3D("gameCanvas3D", width, height);
        this.ui = new ScreenUI("gameCanvasUI", width, height);

        this.screen3D.Canvas.style.position = "absolute";
        this.screen3D.Canvas.style.left = "0px";
        this.screen3D.Canvas.style.top = "0px";
        this.screen3D.Canvas.style.zIndex = "1";

        this.mainCamera = new Camera3D(this.screen3D);
        this.lighting = new DirectionalLight3D({
            direction: [-0.45, 0.85, 0.35],
            color: [1.0, 0.95, 0.82],
            intensity: 0.85,
            ambientStrength: 0.34,
        });

        super.OnStart();

        const skyImageCross = AssetManager.instance.GetImage("sky_cross");
        if (skyImageCross) {
            this.skybox = new Skybox3D(this.screen3D, skyImageCross);
            this.AddEntity(this.skybox);
        }

        this.floor = new Floor3D(this.screen3D, ARENA);
        this.player = new Player3D(this.screen3D, ARENA);
        this.coin = new Coin3D(this.screen3D, { position: COIN_SPAWNS[0], value: 10 });
        this.model = new Char(this.screen3D, "character");

        this.AddEntity(this.floor);
        this.AddEntity(this.player);
        this.AddEntity(this.coin);
        this.AddEntity(this.model);
    }

    OnUpdate(dt) {
        if (ActionManager.IsActionDown("CANCEL")) {
            this.Back = true;
            return;
        }

        if (this.gameState === "WON") {
            if (ActionManager.IsActionDown("ATTACK")) {
                this.ResetGame();
            }
            this.UpdateCamera();
            return;
        }

        super.OnUpdate(dt);
        this.CheckCoinCollision();
        this.UpdateCamera();
    }

    ResetGame() {
        this.score = 0;
        this.collectedCoins = 0;
        this.coinSpawnIndex = 0;
        this.gameState = "PLAYING";
        this.player.Reset();
        this.coin.SetPosition(COIN_SPAWNS[0][0], COIN_SPAWNS[0][1]);
    }

    CheckCoinCollision() {
        if (!this.coin.active) return;

        const p1 = this.player.transform.position;
        const p2 = this.coin.transform.position;
        const distance = Math.hypot(p2[0] - p1[0], p2[2] - p1[2]);

        if (distance <= this.player.radius + this.coin.radius) {
            this.CollectCoin();
        }
    }

    CollectCoin() {
        this.score += this.coin.value;
        this.collectedCoins++;

        if (this.collectedCoins >= this.goalCoins) {
            this.gameState = "WON";
            this.coin.Collect();
            return;
        }

        this.coinSpawnIndex = (this.coinSpawnIndex + 1) % COIN_SPAWNS.length;
        const [x, z] = COIN_SPAWNS[this.coinSpawnIndex];
        this.coin.SetPosition(x, z);
    }

    UpdateCamera() {
        if (!this.mainCamera || !this.player) return;

        this.mainCamera.Follow(this.player);
        this.mainCamera.Update();
    }

    OnDrawn() {
        this.screen3D.Refresh();

        this.entities.forEach(entity => {
            if (typeof entity.OnDrawn === "function") {
                entity.OnDrawn(this.mainCamera, this.lighting);
            }
        });

        if (this.ui) {
            this.ui.Refresh();
        }
    }

    OnGUI() {
        if (!this.ui) return;

        const draw = this.ui.Draw;
        const ctx = draw.screen.Context;

        ctx.save();
        ctx.globalAlpha = 0.45;
        draw.Color = "#000000";
        draw.DrawRect(12, 12, 190, 72);
        ctx.restore();

        draw.SetTextAlign("left");
        draw.Font = "Arial";
        draw.FontSize = "20px";
        draw.Color = "#FFD76A";
        draw.DrawText(`Moedas: ${this.collectedCoins}/${this.goalCoins}`, 22, 40);
        draw.Color = "#FFFFFF";
        draw.FontSize = "16px";
        draw.DrawText(`Score: ${this.score}`, 22, 66);

        draw.Color = "#DDE7FF";
        draw.FontSize = "14px";
        draw.DrawText("W/S ou setas: mover | A/D: girar | Esc: menu", 18, 456);

        if (this.gameState === "WON") {
            ctx.save();
            ctx.globalAlpha = 0.72;
            draw.Color = "#05070D";
            draw.DrawRect(145, 178, 350, 110);
            ctx.restore();

            draw.SetTextAlign("center");
            draw.Color = "#FFD76A";
            draw.FontSize = "26px";
            draw.DrawText("Objetivo concluido!", 320, 220);
            draw.Color = "#FFFFFF";
            draw.FontSize = "15px";
            draw.DrawText("Pressione Z/Enter para jogar novamente", 320, 252);
        }
    }

    OnExit() {
        this.entities.forEach(entity => {
            if (typeof entity.OnExit === "function") {
                entity.OnExit();
            }
        });
        this.entities = [];

        if (this.screen3D?.Canvas) this.screen3D.Canvas.remove();
        if (this.ui?.Screen?.Canvas) this.ui.Screen.Canvas.remove();
    }
}
