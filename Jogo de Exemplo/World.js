import { Screen } from "../Scripts/Window/Screen.js";
import { Scene } from "../Scripts/Root/Scene.js";
import { Player } from "./Entities/Player.js";
import { NPC } from "./Entities/NPC.js";
import { DebugMap } from "../Scripts/Root/DebugMap.js";
import { Vector2D } from "../Scripts/Math/Vector2D.js";
import { Camera } from "../Scripts/Root/Camera.js";
import { Coin } from "./Entities/Coin.js";

var Objects = new Array();
export class World {
    constructor() {
        // Configurações do ambiente (Usando resolução do LG K7)
        // Configurações da Tela do LG K7
        // Viewport: 320x570, Resolution: 480x854
        // Inch: 5, DPI: 196
        // Configurações da tela do Lyf F90M (KaiOS)
        // Viewport: 240x320, Resolution: 240x320
        // Inch: 2,4, DPI: 167
        this.screen = new Screen("PrimeiraFase", 640, 480);
        this.screen.Init("Fase01");

        this.scene = new Scene("PrimeiraFase", this.screen);
        this.scene.CallScene("PrimeiraFase", "Fase_01");

        // Debug
        this.debugMap = new DebugMap(this.screen);
        this.debugMap.SetTileSize(new Vector2D(64, 64));
        this.debugMap.SetMapSize(new Vector2D(16, 16));

        // Entidades
        this.jogador = new Player(this.screen);
        this.npc = new NPC(this.screen);

        // Camera
        this.camera = new Camera(this.jogador.position, new Vector2D(this.screen.Width, this.screen.Height));
        let GameWorld = {
            width: (this.debugMap.mapWidth*this.debugMap.tileW),
            height: (this.debugMap.mapHeight*this.debugMap.tileH)
        };
        this.camera.Init(this.screen, GameWorld);

        // Dinheiro
        this.coin = new Coin(this.screen);

        // Adiciona objetos à lista
        Objects.push(this.debugMap,this.jogador, this.npc, this.coin);
    }

    Loop(dt) {
        this.screen.Refresh();
        // Adiciona todos os objetos da cena
        for (const object of Objects) {
            object.Update();
            object.FixedUpdate(dt);
            this.camera.Update(this.jogador);
            this.camera.Begin();
            object.DrawnSelf();
            this.camera.DrawnSelf();
            this.camera.End();
            object.OnGUI(dt);
        }
    }
}