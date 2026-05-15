import { GameObject } from "../Root/GameObject.js";
import { Vector2D } from "../Math/Vector2D.js";
import { AssetManager } from "../Root/AssetManager.js";
import { Draw } from "../Graphic/Draw.js";

const DEFAULT_BULLET_CONFIG = {
    width: 10,
    height: 5,
    speed: 600,
    despawnLeft: -1000,
    despawnRight: 3000,
    color: "#69D2FF",
};

export class Bullet extends GameObject {
    constructor(screen, config = {}) {
        super();
        this.config = { ...DEFAULT_BULLET_CONFIG, ...config };
        this.name = "Bullet";
        this.zIndex = 60;
        this.size = new Vector2D(this.config.width, this.config.height);
        this.speed = this.config.speed;
        this.active = false;
        this.direction = 1;

        this.draw = new Draw(screen);
        this.image = AssetManager.instance.HasImage("tiro_laser")
            ? AssetManager.instance.GetImage("tiro_laser")
            : null;
    }

    Fire(startX, startY, direction) {
        this.position = new Vector2D(startX, startY);
        this.direction = direction;
        this.active = true;
    }

    OnUpdate(dt) {
        if (!this.active) return;

        this.position.x += (this.speed * this.direction) * (dt || 0.016);

        if (this.position.x > this.config.despawnRight || this.position.x < this.config.despawnLeft) {
            this.active = false;
        }
    }

    OnDrawn() {
        if (!this.active) return;

        if (this.image) {
            this.draw.DrawSprite(this.image, this.position.x, this.position.y);
            return;
        }

        this.draw.Color = this.config.color;
        this.draw.DrawRect(this.position.x, this.position.y, this.size.x, this.size.y);
    }
}
