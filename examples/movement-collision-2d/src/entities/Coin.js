import { GameObject } from "gameforgejs/2d";
import { Vector2D } from "gameforgejs/core";
import { Draw } from "gameforgejs/2d";

export class Coin extends GameObject {
    constructor(screen, area = { x: 20, y: 20, width: 600, height: 440 }) {
        super();
        this.name = "Coin";
        this.size = new Vector2D(20, 20); // Tamanho da caixa de colisão
        this.area = area; // Região onde a moeda pode nascer (inclui o tamanho da moeda)
        this.draw = new Draw(screen);
        this.Respawn();
    }

    Respawn() {
        // Nasce em uma posição aleatória dentro da tela
        const randomX = Math.floor(Math.random() * (this.area.width - this.size.x)) + this.area.x;
        const randomY = Math.floor(Math.random() * (this.area.height - this.size.y)) + this.area.y;
        this.position = new Vector2D(randomX, randomY);
    }

    OnDrawn() {
        // Desenha a moeda como um círculo amarelo
        this.draw.Color = "#FFD700";
        // DrawCircle precisa do centro, então somamos metade do tamanho (10)
        this.draw.DrawCircle(this.position.x + 10, this.position.y + 10, 10);
    }
}