import { GameObject } from "../Root/GameObject.js";
import { Vector2D } from "../Math/Vector2D.js";
import { AssetManager } from "../Root/AssetManager.js";
import { Draw } from "../Graphic/Draw.js";

export class Bullet extends GameObject {
    constructor(screen) {
        super();
        this.name = "Bullet";
        this.size = new Vector2D(10, 5);
        this.speed = 600; 
        this.active = false; 
        this.direction = 1; // 1 para direita, -1 para esquerda
        
        this.draw = new Draw(screen);
        this.image = AssetManager.instance.GetImage("tiro_laser"); 
    }

    // Método chamado pelo Pool quando o tiro é disparado
    Fire(startX, startY, direction) {
        this.position = new Vector2D(startX, startY);
        this.direction = direction; // Salva a direção que o player estava olhando
        this.active = true;
    }

    OnUpdate(dt) {
        if (!this.active) return; 

        // Move o tiro na direção correta
        this.position.x += (this.speed * this.direction) * (dt || 0.016);

        // Limpa o tiro da memória se for muito longe pros lados
        if (this.position.x > 3000 || this.position.x < -1000) {
            this.active = false; 
        }
    }

    OnDrawn() {
        if (!this.active) return;
        this.draw.DrawSprite(this.image, this.position.x, this.position.y);
    }
}