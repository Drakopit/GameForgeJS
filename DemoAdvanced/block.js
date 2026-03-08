import { GameObject } from "../Root/GameObject.js";
import { Vector2D } from "../Math/Vector2D.js";
import { Draw } from "../Graphic/Draw.js";

export class Block extends GameObject {
    constructor(screen, x, y, width, height) {
        super();
        this.name = "Block";
        this.position = new Vector2D(x, y);
        this.size = new Vector2D(width, height);
        this.draw = new Draw(screen);
    }

    OnDrawn() {
        // Desenha o bloco como um retângulo cinza (você pode trocar por sprite depois)
        this.draw.Color = "#555555";
        this.draw.DrawRect(this.position.x, this.position.y, this.size.x, this.size.y);
    }
}