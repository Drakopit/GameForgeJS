import { Screen } from "../Window/Screen.js";
import { Vector2D } from "../Math/Vector2D.js";

export class Sprite {
    constructor(screen, sprite) {
        if (sprite !== undefined) {
            this.sprite = new Image();
            this.sprite.src = sprite;
        } else {
            this.sprite;
        }
        this.screen = new Screen(screen.ScreenId, screen.Width, screen.Height);
        this.position = position || new Vector2D(0, 0);
        this.size = size || new Vector2D(32, 32);

        // Animação
        this.index = 0;
        this.frames = 3;
        this.scale = 1;
        this.speed = 0.2;
        this.direction = "horizontal";
        this.updateFrame = 0;
        this.updatesPerFrame = 0;
    }

    SetStaticSprite(spr, position) {
        this.sprite.src = spr;
        this.screen.Context.drawImage(this.sprite, position.GetValue().x, position.GetValue().y);
    }

    SetClipingSprite(spr, position, size, cutPosition, cutSize) {
        this.sprite.src = spr;
        this.screen.Context.drawImage(this.sprite,
            cutPosition.GetValue().x, cutPosition.GetValue().y,
            cutSize.GetValue().x, cutSize.GetValue().y,
            position.GetValue().x, position.GetValue().y,
            size.GetValue().x, size.GetValue().y);
    }

    SetSpriteAnimation(spr, x, y, direction) {
        this.sprite.src = spr;
        if (direction === "horizontal") {
            this.DrawClipingSprite(spr, x, y,
                this.size.GetValue().x / this.frames * this.scale, this.size.GetValue().y * this.scale,
                this.index * this.size.GetValue().x / this.frames, 0,
                this.size.GetValue().x / this.frames, this.size.GetValue().y);
        } else {
            this.DrawClipingSprite(spr, x, y,
                this.size.GetValue().x, this.size.GetValue().y,
                x, this.index * this.size.GetValue().y / this.frames,
                this.size.GetValue().x, this.size.GetValue().y);
        }
    }

    Update() {
        this.updateFrame++;

        if (this.updateFrame > this.updatesPerFrame) {
            this.updateFrame = 0;
            if (this.index < this.frames - 1) {
                this.index++;
            } else {
                this.index = 0;
            }
        }
    }

    Draw(x, y) {
        this.Update();
        this.SetSpriteAnimation(this.sprite, x, y, this.frames, this.direction);
    }
}