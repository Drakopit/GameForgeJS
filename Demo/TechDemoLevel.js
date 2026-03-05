import { Level } from "../Template/Level.js";
import { Player } from "./Player.js";
import { Coin } from "./Coin.js";
import { Draw } from "../Graphic/Draw.js";
import { Collide2D } from "../Math/Collide2D.js";

export class TechDemoLevel extends Level {
    constructor(screen) {
        super(screen);
        this.TelaId = "DemoLevel";
        this.caption = "GameForgeJS - Tech Demo";
        this.screen = screen;
        this.score = 0;
        this.draw = new Draw(this.screen);
    }

    OnStart() {
        super.OnStart(); // Configura título da página e chama OnStart das entidades

        // Instancia os objetos
        this.player = new Player(this.screen);
        this.coin = new Coin(this.screen);

        // Adiciona na lista de entidades para a engine atualizá-los e desenhá-los automaticamente
        this.AddEntity(this.player);
        this.AddEntity(this.coin);
    }

    OnUpdate(dt) {
        super.OnUpdate(dt); // Atualiza todas as entidades filhas

        // Checagem de Colisão (Player x Coin)
        if (Collide2D.isCollidingAABB(this.player, this.coin)) {
            this.score += 10;
            this.coin.Respawn(); // Muda a moeda de lugar
        }
    }

    OnGUI() {
        super.OnGUI(); // Deixa as entidades desenharem suas GUIs (se tiverem)
        
        // Desenha a Interface (Placar e Instruções)
        this.draw.Color = "#FFFFFF";
        this.draw.Font = "Arial";
        this.draw.FontSize = "24px";
        this.draw.DrawText(`Score: ${this.score}`, 20, 40);
        
        this.draw.FontSize = "16px";
        this.draw.DrawText(`FPS: ${this.FPS}`, 700, 30);
        
        this.draw.FontSize = "14px";
        this.draw.DrawText(`Use W, A, S, D para mover e coletar!`, 20, 580);
    }
}