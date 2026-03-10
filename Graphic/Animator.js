import { Vector2D } from "../Math/Vector2D.js";

/**
 * @doc Class Animator
 * @namespace Graphic
 * @class Animator
 * @summary Controla a transição de diferentes animações para um mesmo Sprite.
 */
export class Animator {
    constructor(sprite) {
        this.sprite = sprite;
        this.animations = {};
        this.currentAnimation = null;
        this.currentAnimationName = null;
    }

    /**
     * @description Registra uma nova animação
     * @param {string} name - Nome da animação (ex: "Idle", "Run")
     * @param {number} row - Linha na spritesheet
     * @param {number} frameCount - Quantidade de frames
     * @param {number} speed - Velocidade da animação (updatesPerFrame)
     */
    AddAnimation(name, image, row, totalFrames, speed, pivotX = 0.5, pivotY = 1, groundOffset = 0) {
        this.animations[name] = {
            image,
            row,
            totalFrames,
            speed,
            pivotX,
            pivotY,
            groundOffset
        };
    }

    /**
     * @description Toca a animação se ela já não estiver tocando
     */
    Play(name) {
        if (this.currentAnimationName === name) return;

        let anim = this.animations[name];
        if (!anim) return;

        this.currentAnimationName = name;
        this.currentAnimation = anim;

        this.sprite.sprite = anim.image;
        this.sprite.row = anim.row;
        this.sprite.frameCount = anim.totalFrames;
        this.sprite.updatesPerFrame = anim.speed;

        let frameWidth = anim.image.width / anim.totalFrames;
        let frameHeight = anim.image.height;

        this.sprite.size = new Vector2D(frameWidth, frameHeight);

        this.sprite.index = 0;
    }
}