import { Screen } from "../Scripts/Window/Screen.js";
import { Scene } from "../Scripts/Root/Scene.js";
import { Player } from "./Entities/Player.js";
import { NPC } from "./Entities/NPC.js";
import { Collide2D } from "../Scripts/Math/Collide2D.js";
import { Physic2D } from "../Scripts/Math/Physic2D.js";
import { Menu } from "../Scripts/GUI/Menu.js";
import { DebugMap } from "../Scripts/Root/DebugMap.js";
import { Vector2D } from "../Scripts/Math/Vector2D.js";

var Objects = new Array();
var p = document.createElement('p');
document.body.appendChild(p);

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

        // Adiciona objetos à lista
        Objects.push(this.debugMap, this.jogador, this.npc);
    }

    Loop(dt) {
        this.screen.Refresh();
        // Adiciona todos os objetos da cena
        for (let i = 0; i <= Objects.length; i++) {
            for (let j = i+1; j < Objects.length; j++) {
                let colidido = Objects[i];
                let colisor = Objects[j];
                if (Objects[i].ObjectType == 'Entity' && Objects[j].ObjectType == 'Entity') {
                    if (Collide2D.isCollidingAABB(colidido, colisor)) {
                        Physic2D.reactinCollision(colidido, colisor);
                        p.innerText = "Esta colidindo!";
                        p.style.color = "red";
                    } else {
                        p.innerText = "Não esta colidindo!";
                        p.style.color = "blue";
                    }
                }
            }
        }
        for (const object of Objects) {
            object.Update();
            object.FixedUpdate(dt);
            object.DrawnSelf(dt);
            object.OnGUI(dt);
        }
        console.log(`Ratio: ${this.screen.Width/this.screen.ratio}, ${this.screen.Height/this.screen.ratio}`)
    }
}