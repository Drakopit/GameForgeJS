import { Draw } from "../../Scripts/Drawing/Draw.js";
import { GameObject } from "../../Scripts/Root/GameObject.js";

export class NPC extends GameObject {
    constructor(screen) {
        super();
        this.draw = new Draw(screen);
    }

    DrawSelf(deltaTime) {
        let red = Math.random() * 255;
        let green = Math.random() * 255;
        let blue = Math.random() * 255;
        this.draw.Color = `rgb(${Math.floor(red)}, ${Math.floor(green)}, ${Math.floor(blue)})`;
        this.draw.DrawRect(200, 50, 32, 32);
    }
}