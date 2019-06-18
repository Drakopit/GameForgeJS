import { Base } from "../../Scripts/Root/Base.js";
import { Vector2D } from "../../Scripts/Math/Vector2D.js";
import { Sprite } from "../../Scripts/Drawing/Sprite.js";

export class Coin extends Base {
    constructor(screen) {
        super();
        this.value = Math.ceil(Math.random() * 100);
        this.position = new Vector2D(128, 128);
        this.size = new Vector2D(44, 40);
        this.solid = true;

        this.spritefileName = "../../Assets/Sprites/Coin.png";
        this.sprite = new Sprite(screen, this.spritefileName);
        this.sprite.size = this.size;
        this.sprite.position = this.position;
        this.sprite.frameCount = 8;
        this.sprite.updatesPerFrame = 3;

        this.row = 0;
    }

    get Value() {
        return this.value;
    }

    set Value(value) {
        this.value = value;
    }

    DrawnSelf(dt) {
        this.sprite.Animation(this.spritefileName, this.position, "horizontal", this.row);
    }
}