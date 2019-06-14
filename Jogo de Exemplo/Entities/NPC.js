import { Draw } from "../../Scripts/Drawing/Draw.js";
import { GameObject } from "../../Scripts/Root/GameObject.js";
import { Vector2D } from "../../Scripts/Math/Vector2D.js";

export class NPC extends GameObject {
    constructor(screen) {
        super();
        this.draw = new Draw(screen);
        this.position = new Vector2D(200, 50);
        this.size = new Vector2D(32, 32);
    }

    DrawSelf(deltaTime) {
        this.draw.Color = `blue`;
        this.draw.DrawRect(this.position.GetValue().x, this.position.GetValue().y, this.size.GetValue().x, this.size.GetValue().x);
    }

    OnGUI() {
        this.draw.Color = 'Red';
        this.draw.DrawText(`Posição ${JSON.stringify(this.position)}` , 10, 15);
        this.draw.DrawText(`Tamanho ${JSON.stringify(this.size)}` , 10, 30);
    }
}