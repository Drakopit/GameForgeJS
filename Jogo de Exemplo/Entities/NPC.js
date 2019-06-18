import { Draw } from "../../Scripts/Drawing/Draw.js";
import { GameObject } from "../../Scripts/Root/GameObject.js";
import { Vector2D } from "../../Scripts/Math/Vector2D.js";

export class NPC extends GameObject {
    constructor(screen) {
        super();
        this.draw = new Draw(screen);
        this.position = new Vector2D(256, 64);
        this.size = new Vector2D(64, 64);
    }

    DrawnSelf(deltaTime) {
        this.draw.Color = `blue`;
        this.draw.DrawRect(this.position.GetValue().x, this.position.GetValue().y, this.size.GetValue().x, this.size.GetValue().x);
    }
}