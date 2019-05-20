import { Sprite } from "../Drawing/Sprite.js"
import { Vector2D } from "../Math/Vector2D.js";

class GameObject {
    constructor() {
        this.x, this.y, this.z, this.deth = 0;
        this.position = new Vector2D(0, 0);
        this.sprite = new Sprite();
    }

    Init() {}

    set Sprite(Sprite) {
        this.Sprite = Sprite;
    }
    get Sprite() {
        return this.Sprite;
    }

    DrawSelf() {
        // context.getImageData(sx, sy, sw, sh);
    }
}