/**
 * Draws a `ParticleEmitter` on a 2D canvas (the game's screen, or the editor's viewport):
 * soft, circle or square sprites, alpha or additive blending.
 *
 * @example
 * level.AddEntity(new ParticleRenderer2D(emitter, { screen: level.screen }));
 */
export class ParticleRenderer2D extends Component {
    /**
     * Draws the emitter's live particles (x, y in canvas space after the context's transform).
     * @param {CanvasRenderingContext2D} ctx
     * @param {import("../../core/Particles/ParticleEmitter.js").ParticleEmitter} emitter
     */
    static Draw(ctx: CanvasRenderingContext2D, emitter: import("../../core/Particles/ParticleEmitter.js").ParticleEmitter): void;
    /**
     * @param {import("../../core/Particles/ParticleEmitter.js").ParticleEmitter} emitter
     * @param {{screen?: {Context: CanvasRenderingContext2D}|null}} [options]
     */
    constructor(emitter: import("../../core/Particles/ParticleEmitter.js").ParticleEmitter, { screen }?: {
        screen?: {
            Context: CanvasRenderingContext2D;
        } | null;
    });
    emitter: import("../index.js").ParticleEmitter;
    screen: {
        Context: CanvasRenderingContext2D;
    };
}
import { Component } from "../../core/Component.js";
