import { GameObject } from "../Root/GameObject.js";
import { Vector2D } from "../Math/Vector2D.js";
import { AssetManager } from "../Root/AssetManager.js";
import { Draw } from "../Graphic/Draw.js";

export class Bullet extends GameObject {
    constructor(screen) {
        super();
        this.name = "Bullet";
        this.size = new Vector2D(10, 5);
        this.speed = 600; // Super rápido
        this.active = false; // Controle do Object Pool
        
        this.draw = new Draw(screen);
        // Puxa a imagem da memória, sem fazer "new Image()"
        this.image = AssetManager.instance.GetImage("tiro_laser"); 
    }

    // Método chamado pelo Pool quando o tiro é disparado
    Fire(startX, startY) {
        this.position = new Vector2D(startX, startY);
        this.active = true;
    }

    OnUpdate(dt) {
        if (!this.active) return; // Se não está em uso, ignora a lógica

        // Move o tiro para a direita
        this.position.x += this.speed * (dt || 0.016);

        // Se sair da tela, desativa para o Pool poder reutilizá-lo
        if (this.position.x > 850) {
            this.active = false; 
        }
    }

    OnDrawn() {
        if (!this.active) return;
        // Desenha a imagem do tiro
        this.draw.DrawSprite(this.image, this.position.x, this.position.y);
    }
}