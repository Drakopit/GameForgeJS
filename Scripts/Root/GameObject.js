import { Sprite } from "../Drawing/Sprite.js"
import { Vector2D } from "../Math/Vector2D.js";
import { Util } from "./Utils.js";
import { Collide2D } from "../Math/Collide2D.js";

export class GameObject {
    constructor() {
        this.id = Util.NewUUIDv4();
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

        this.Tag = "Entity";
        this.name = "Drako";
    }

    OnStart() {}

    OnUpdate() {}

    OnFixedUpdate(dt) {}

    OnDraw() {}

    OnGUI() {}

    OnCollision(other, callback) {
        if (other instanceof GameObject && Collide2D.isCollidingAABB(this, other)) {
            return () => callback;
        }
    };

    OnDestroy() {}
}