import { Sprite } from "../Drawing/Sprite.js"
import { Vector2D } from "../Math/Vector2D.js";

export class GameObject {
    constructor() {
        this.id;
        this.hspeed = 64;
        this.vspeed = 64;
        this.solid = true;
        this.position = new Vector2D(0, 0);
        this.previousPosition = this.position;
        this.startPosition = this.position;
        this.size = new Vector2D(0, 0);
        this.direction = 90;
        this.friction = 0.5;
        this.gravity = 9.80665; // Força da gravidade
        this.gravityDirection = 180;
        this.deth;
        this.danping = 0.5;
        this.mass;
        this.sprite = new Sprite();

        this.ObjectType = "Entity";
    }

    Start() {}

    Update() {}

    FixedUpdate() {}

    DrawnSelf() {}

    OnGUI() {}
}