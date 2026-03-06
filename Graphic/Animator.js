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
    AddAnimation(name, row, frameCount, speed = 5) {
        this.animations[name] = { row, frameCount, speed };
    }

    /**
     * @description Toca a animação se ela já não estiver tocando
     */
    Play(name) {
        if (this.currentAnimation === name) return; // Evita resetar a animação a cada frame
        
        const anim = this.animations[name];
        if (!anim) throw new Error(`Animação '${name}' não encontrada.`);

        this.currentAnimation = name;
        this.sprite.row = anim.row;
        this.sprite.frameCount = anim.frameCount;
        this.sprite.updatesPerFrame = anim.speed;
        this.sprite.Reset(); // Volta pro frame 0 da nova animação
    }
}