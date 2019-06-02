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
        this.screen = screen;
        this.position = new Vector2D(0, 0);
        this.size = new Vector2D(32, 32);

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
        if (spr === undefined && this.sprite === undefined) {
            throw 'Esta classe não funciona, se você não atribuir uma sprite à ela!';
        }
        this.sprite.src = spr || this.sprite.src;
        this.screen.Context.drawImage(this.sprite, position.GetValue().x, position.GetValue().y);
    }

    SetClipingSprite(spr, position, size, cutPosition, cutSize) {
        if (spr === undefined && this.sprite === undefined) {
            throw 'Esta classe não funciona, se você não atribuir uma sprite à ela!';
        }
        this.sprite.src = spr || this.sprite.src;
        this.screen.Context.drawImage(this.sprite,
            cutPosition.GetValue().x, cutPosition.GetValue().y,
            cutSize.GetValue().x, cutSize.GetValue().y,
            position.GetValue().x, position.GetValue().y,
            size.GetValue().x, size.GetValue().y);
    }

    SetSpriteAnimation(spr, x, y, direction) {
        if (spr === undefined && this.sprite === undefined) {
            throw 'Esta classe não funciona, se você não atribuir uma sprite à ela!';
        }
        this.sprite.src = spr || this.sprite.src;
        if (direction === "horizontal") {
            console.log("Indice:", this.index);
            console.log("Tamanho do Player: ", this.size.toString());
            this.screen.Context.drawImage(this.sprite,
                this.index * this.size.GetValue().x / this.frames, 0,
                this.size.GetValue().x / this.frames, this.size.GetValue().y,
                x, y,
                this.size.GetValue().x / this.frames * this.scale, this.size.GetValue().y * this.scale);
        } else {
            this.screen.Context.drawImage(this.sprite,
                y, this.index * this.size.GetValue().y / this.frames,
                this.size.GetValue().x / this.frames, this.size.GetValue().y,
                x, y,
                this.size.GetValue().x / this.frames * this.scale, this.size.GetValue().y * this.scale);
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

    Draw(position) {
        this.position = position;
		console.log("Position:", position);
        this.Update();
        this.SetSpriteAnimation(this.sprite, position.GetValue().x, position.GetValue().y, this.frames, this.direction);
    }
}