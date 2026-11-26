/**
 * Code-first 2D particles: a ParticleEmitter drawn on `screen` (default: the level's screen).
 * @param {Record<string, any>} [settings] - `ParticleEmitter` values.
 * @param {{screen?: any, target?: any, name?: string}} [options]
 * @example
 * level.AddEntity(Particles2D({ rate: 30, gravity: [0, 200, 0] }, { target: player }));
 */
export function Particles2D(settings?: Record<string, any>, { screen, ...options }?: {
    screen?: any;
    target?: any;
    name?: string;
}): ParticleEmitter;
/**
 * Draws a `ParticleEmitter` on a 2D canvas (the game's screen, or the editor's viewport):
 * soft, circle or square sprites, alpha or additive blending.
 *
 * @example
 * new ParticleEmitter(settings, { renderer: emitter => new ParticleRenderer2D(emitter, { screen }) }); // or Particles2D(settings)
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
    emitter: ParticleEmitter;
    screen: {
        Context: CanvasRenderingContext2D;
    };
}
import { ParticleEmitter } from "../../core/Particles/ParticleEmitter.js";
import { Component } from "../../core/Component.js";
