import {Base} from "Base.js"

class GameObject extends Base {
    constructor() {}

    Init() {
    }

    set Sprite(Sprite) {
        this.Sprite = Sprite;
    }
    get Sprite() {
        return this.Sprite;
    }

    DrawSelf() {
        super.DrawSelf();

        // context.getImageData(sx, sy, sw, sh);
    }
}