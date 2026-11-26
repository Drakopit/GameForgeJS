// @ts-check
import { Component } from "../../core/Component.js";
import { ParticleEmitter } from "../../core/Particles/ParticleEmitter.js";

/**
 * Draws a `ParticleEmitter` on a 2D canvas (the game's screen, or the editor's viewport):
 * soft, circle or square sprites, alpha or additive blending.
 *
 * @example
 * new ParticleEmitter(settings, { renderer: emitter => new ParticleRenderer2D(emitter, { screen }) }); // or Particles2D(settings)
 */
export class ParticleRenderer2D extends Component {
    /**
     * @param {import("../../core/Particles/ParticleEmitter.js").ParticleEmitter} emitter
     * @param {{screen?: {Context: CanvasRenderingContext2D}|null}} [options]
     */
    constructor(emitter, { screen = null } = {}) {
        super();
        this.emitter = emitter;
        this.screen = screen;
    }

    OnDrawn() {
        const screen = this.screen ?? /** @type {any} */ (this.emitter)?.level?.screen;
        if (screen?.Context) ParticleRenderer2D.Draw(screen.Context, this.emitter);
    }

    /**
     * Draws the emitter's live particles (x, y in canvas space after the context's transform).
     * @param {CanvasRenderingContext2D} ctx
     * @param {import("../../core/Particles/ParticleEmitter.js").ParticleEmitter} emitter
     */
    static Draw(ctx, emitter) {
        if (!emitter?.count) return;
        const { blend, sprite } = emitter.settings;
        ctx.save();
        ctx.globalCompositeOperation = blend === "additive" ? "lighter" : "source-over";
        emitter.ForEach((x, y, _z, color, size) => {
            const radius = Math.max(0, size) / 2;
            if (radius <= 0 || color[3] <= 0) return;
            const rgb = `${Math.round(color[0] * 255)}, ${Math.round(color[1] * 255)}, ${Math.round(color[2] * 255)}`;
            if (sprite === "square") {
                ctx.fillStyle = `rgba(${rgb}, ${color[3]})`;
                ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
                return;
            }
            if (sprite === "soft") {
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
                gradient.addColorStop(0, `rgba(${rgb}, ${color[3]})`);
                gradient.addColorStop(1, `rgba(${rgb}, 0)`);
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = `rgba(${rgb}, ${color[3]})`;
            }
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    OnDestroy() {
        this.emitter = null;
        this.screen = null;
    }
}

/**
 * Code-first 2D particles: a ParticleEmitter drawn on `screen` (default: the level's screen).
 * @param {Record<string, any>} [settings] - `ParticleEmitter` values.
 * @param {{screen?: any, target?: any, name?: string}} [options]
 * @example
 * level.AddEntity(Particles2D({ rate: 30, gravity: [0, 200, 0] }, { target: player }));
 */
export function Particles2D(settings = {}, { screen = null, ...options } = {}) {
    return new ParticleEmitter(settings, { ...options, renderer: emitter => new ParticleRenderer2D(emitter, { screen }) });
}
