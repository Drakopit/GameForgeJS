import { GameObject } from "../Root/GameObject.js";
import { Vector2D } from "../Math/Vector2D.js";
import { Draw } from "../Graphic/Draw.js";

export class Enemy extends GameObject {
    constructor(screen, playerRef) {
        super();
        this.name = "Enemy";
        // Nasce no canto superior direito
        this.position = new Vector2D(700, 50); 
        this.size = new Vector2D(32, 32);
        this.speed = 100; // Um pouco mais lento que o jogador (que tem 200)
        
        this.draw = new Draw(screen);
        this.player = playerRef; // Salva o alvo que ele deve perseguir
    }

    OnUpdate(dt) {
        const delta = dt || 0.016;

        // Se o player existir, persegue ele!
        if (this.player) {
            // Lógica simples de perseguição nos eixos X e Y
            if (this.position.x < this.player.position.x) {
                this.position.x += this.speed * delta;
            } else if (this.position.x > this.player.position.x) {
                this.position.x -= this.speed * delta;
            }

            if (this.position.y < this.player.position.y) {
                this.position.y += this.speed * delta;
            } else if (this.position.y > this.player.position.y) {
                this.position.y -= this.speed * delta;
            }
        }
    }

    OnDrawn() {
        // Desenha o Inimigo como um quadrado vermelho
        this.draw.Color = "#FF0000";
        this.draw.DrawRect(this.position.x, this.position.y, this.size.x, this.size.y);
    }
}