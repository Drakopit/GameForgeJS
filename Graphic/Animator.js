import { Vector2D } from "../Math/Vector2D.js";

/**
 * @doc Class Animator
 * @namespace Graphic
 * @class Animator
 * @summary Controla a transição de diferentes animações para um mesmo Sprite.
 */
export class Animator {
    constructor(sprite) {
        this.sprite = sprite; // Referência à instância de Sprite.js do GameObject
        this.animations = {};
        this.currentAnimation = null;
    }

    /**
     * @description Registra uma nova animação
     * @param {string} name - Nome da animação (ex: "Idle", "Run")
     * @param {number} row - Linha na spritesheet
     * @param {number} frameCount - Quantidade de frames
     * @param {number} speed - Velocidade da animação (updatesPerFrame)
     */
    AddAnimation(name, image, row, totalFrames, speed) {
        // Salvamos a imagem junto com os dados da animação
        this.animations[name] = {
            image: image,
            row: row,
            totalFrames: totalFrames,
            speed: speed
        };
    }

    /**
     * @description Toca a animação se ela já não estiver tocando
     */
    Play(name) {
        if (this.currentAnimationName !== name) {
            let anim = this.animations[name];

            if (anim) {
                this.currentAnimationName = name;

                this.sprite.sprite = anim.image;
                this.sprite.row = anim.row;
                this.sprite.frameCount = anim.totalFrames;
                this.sprite.updatesPerFrame = anim.speed;

                // --- A NOVA MÁGICA AQUI ---
                // Descobre a largura exata de 1 frame automaticamente!
                let frameWidth = anim.image.width / anim.totalFrames;
                let frameHeight = anim.image.height;
                // Atualiza o tamanho do recorte no Sprite
                this.sprite.size = new Vector2D(frameWidth, frameHeight);

                this.sprite.index = 0;
            } else {
                console.warn(`Animator: Animação '${name}' não encontrada.`);
            }
        }
    }
}