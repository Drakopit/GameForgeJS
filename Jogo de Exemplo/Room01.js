import { Screen } from "../Scripts/Window/Screen.js";
import { Scene } from "../Scripts/Root/Scene.js";
import { Player } from "./TopDown/Entities/Player.js";
import { NPC } from "./TopDown/Entities/NPC.js";
import { DebugMap } from "../Scripts/Root/DebugMap.js";
import { Vector2D } from "../Scripts/Math/Vector2D.js";
import { Camera } from "../Scripts/Root/Camera.js";
import { GameObject } from "../Scripts/Root/GameObject.js";

// Configurações do ambiente (Usando resolução do LG K7)
// Configurações da Tela do LG K7
// Viewport: 320x570, Resolution: 480x854
// Inch: 5, DPI: 196
// Configurações da tela do Lyf F90M (KaiOS)
// Viewport: 240x320, Resolution: 240x320
// Inch: 2,4, DPI: 167
export var Screen = new Screen("PrimeiraFase", 640, 480);
export var Scene = new Scene("PrimeiraFase", Screen);
export var DebugMap = new DebugMap(Screen);
export var Jogador = new Player(Screen);
export var NPC = new NPC(Screen);
export var Camera = new Camera(Jogador.position, new Vector2D(Screen.Width, Screen.Height));
export var GameWorld = {
    width: (DebugMap.mapWidth*DebugMap.tileW),
    height: (DebugMap.mapHeight*DebugMap.tileH)
};
export const WORLDSTATE = Object.freeze({
    GAME_MENU: 0,
    GAME_RUNING: 1,
    GAME_PAUSE: 2
});


export class Room01 extends GameObject {
    constructor() {}

    Start() {
        Screen.Init("Fase01");
        Scene.CallScene("PrimeiraFase", "Fase_01");
        DebugMap.SetTileSize(new Vector2D(64, 64));
        DebugMap.SetMapSize(new Vector2D(16, 16));
        Camera.Init(Screen, GameWorld);
    }

    Update(dt) {
        Screen.Refresh();
        // Adiciona todos os objetos da cena
        Player.Update();
        NPC.Update();
        Camera.Update(Jogador);
        
        Player.FixedUpdate(dt);
        NPC.FixedUpdate(dt);
        Camera.FixedUpdate(dt);
        
        Camera.Begin();        
            Player.DrawnSelf();
            NPC.DrawnSelf();
            Camera.DrawnSelf();
        Camera.End();
        
        Player.OnGUI();
        NPC.OnGUI();
        Camera.OnGUI();
    }
}