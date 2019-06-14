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
        this.frameCount = 1;
        this.scale = 1;
        this.direction = "horizontal";
        this.row = 0; // Primeira linha
        this.updateFrame = 0;
        this.updatesPerFrame = 2;
    }

    Static(spr, position) {
        if (spr === undefined && this.sprite === undefined) {
            throw 'Esta classe não funciona, se você não atribuir uma sprite à ela!';
        }
        this.sprite.src = spr || this.sprite.src;
        this.screen.Context.drawImage(this.sprite, position.GetValue().x, position.GetValue().y);
    }

    Cliping(spr, position, size, cutPosition, cutSize) {
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

    Animation(spr = undefined, position, direction, row) {
        if (spr === undefined && this.sprite === undefined) {
            throw 'Esta classe não funciona, se você não atribuir uma sprite à ela!';
        }
        this.sprite.src = spr || this.sprite.src;
        this.position = position;
        this.row = (row !== undefined) ? row: this.row;

        if (direction === "horizontal") {
            console.log("Indice:", this.index);
            console.log("Linha: ", this.row);
            console.log("Tamanho do Player: ", this.size);
            /**
             * @example
             * this.screen.Context.drawImage(spirte, posicaoXCorte, posicaoYCorte,
             * larguraCorte, alturaCorte,
             * posicaoXSprite, posicaoYSprite,
             * larguraSprite, alturaSprite)
             */
            this.screen.Context.drawImage(this.sprite,
                this.index * this.size.GetValue().x, this.row * this.size.GetValue().y,
                this.size.GetValue().x, this.size.GetValue().y,
                this.position.GetValue().x, this.position.GetValue().y,
                this.size.GetValue().x * this.scale, this.size.GetValue().y * this.scale);
        } else {
            this.screen.Context.drawImage(this.sprite,
                0, this.index * this.size.GetValue().y,
                this.size.GetValue().x, this.size.GetValue().y,
                this.position.GetValue().x, this.position.GetValue().y,
                this.size.GetValue().x * this.scale, this.size.GetValue().y * this.scale);
        }

        // Atualiza a posição do sprite
        this.Update();
    }

    Update() {
        if (this.updateFrame > this.updatesPerFrame) {
            this.updateFrame = 0;
            
            if (this.index == this.frameCount && this.row == 3) {
                this.index = 0;
                this.row = 0;
            } else if (this.index <= this.frameCount) {
                this.index++;
            } else {
                this.row++;
                this.index = 0;
                this.updateFrame = 0;
            }
        }
        this.updateFrame++;
    }
}