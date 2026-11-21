// @ts-check
import { Base } from '../../core/Base.js';
import { Vector2D } from '../../core/Math/Vector2D.js';

/** @typedef {{r: number, g: number, b: number}} ParticleColor */
/**
 * @typedef {Object} ParticleOptions
 * @property {number} [vx]
 * @property {number} [vy]
 * @property {number} [lifetime]
 * @property {number} [size]
 * @property {number} [endSize]
 * @property {number} [gravity]
 * @property {number} [wind]
 * @property {number} [drag]
 * @property {number} [opacity]
 * @property {number} [depth]
 * @property {ParticleColor} [color]
 * @property {ParticleColor} [endColor]
 * @property {'disc'|'streak'} [shape]
 */
const WHITE = Object.freeze({ r: 255, g: 255, b: 255 });

/** A time-based, reusable particle. Position and velocity use pixels/seconds. */
export class Particle extends Base {
    /** @param {number} [x] @param {number} [y] @param {ParticleOptions} [options] */
    constructor(x = 0, y = 0, options = {}) {
        super();
        this.position = new Vector2D();
        this.velocity = new Vector2D();
        this.active = false;
        this.age = 0;
        this.lifetime = 1;
        this.size = 1;
        this.endSize = 0;
        this.gravity = 0;
        this.wind = 0;
        this.drag = 0;
        this.opacity = 1;
        this.depth = 1;
        /** @type {ParticleColor} */ this.color = WHITE;
        /** @type {ParticleColor} */ this.endColor = WHITE;
        /** @type {'disc'|'streak'} */ this.shape = 'disc';
        this.Reset(x, y, options);
    }
    // Legacy scalar positions remain views of the canonical vector.
    get x() { return this.position.x; }
    set x(value) { this.position.x = value; }
    get y() { return this.position.y; }
    set y(value) { this.position.y = value; }
    /** @param {number} x @param {number} y @param {ParticleOptions} [options] */
    Reset(x, y, options = {}) {
        const values = { x, y, vx: options.vx ?? 0, vy: options.vy ?? 0, lifetime: options.lifetime ?? 1,
            size: options.size ?? 3, endSize: options.endSize ?? 0, gravity: options.gravity ?? 0,
            wind: options.wind ?? 0, drag: options.drag ?? 0, opacity: options.opacity ?? 1, depth: options.depth ?? 1 };
        for (const [name, value] of Object.entries(values)) if (!Number.isFinite(value)) throw new TypeError(`Invalid particle ${name}.`);
        if (values.lifetime <= 0 || values.size < 0 || values.endSize < 0 || values.drag < 0
            || values.opacity < 0 || values.opacity > 1 || values.depth <= 0) throw new RangeError('Invalid particle range.');
        for (const color of [options.color, options.endColor]) {
            if (color && !['r', 'g', 'b'].every(key => {
                const channel = color[/** @type {'r'|'g'|'b'} */ (key)];
                return Number.isFinite(channel) && channel >= 0 && channel <= 255;
            })) throw new RangeError('Particle colors use RGB channels between 0 and 255.');
        }
        this.position.Set(x, y); this.velocity.Set(values.vx, values.vy);
        Object.assign(this, { lifetime: values.lifetime, size: values.size, endSize: values.endSize,
            gravity: values.gravity, wind: values.wind, drag: values.drag, opacity: values.opacity, depth: values.depth });
        this.color = options.color ?? WHITE; this.endColor = options.endColor ?? this.color;
        this.shape = options.shape ?? 'disc'; this.age = 0; this.active = true;
    }
    /** @param {number} [dt] */
    OnUpdate(dt = 1 / 60) {
        if (!Number.isFinite(dt) || dt < 0) throw new RangeError('Particle delta must be finite and nonnegative.');
        if (!this.active) return;
        this.age += dt;
        if (this.age >= this.lifetime) { this.active = false; return; }
        const retention = Math.exp(-this.drag * dt);
        this.velocity.x = (this.velocity.x + this.wind * dt) * retention;
        this.velocity.y = (this.velocity.y + this.gravity * dt) * retention;
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
    }
    isAlive() { return this.active && this.age < this.lifetime; }
    /** @param {CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D} ctx */
    Draw(ctx) {
        if (!this.active) return;
        const t = this.age / this.lifetime;
        const size = this.size + (this.endSize - this.size) * t;
        const r = Math.round(this.color.r + (this.endColor.r - this.color.r) * t);
        const g = Math.round(this.color.g + (this.endColor.g - this.color.g) * t);
        const b = Math.round(this.color.b + (this.endColor.b - this.color.b) * t);
        ctx.globalAlpha = this.opacity * (1 - t);
        if (this.shape === 'streak') {
            ctx.strokeStyle = `rgb(${r},${g},${b})`; ctx.lineWidth = size;
            ctx.beginPath(); ctx.moveTo(this.position.x, this.position.y);
            ctx.lineTo(this.position.x - this.velocity.x * 0.025, this.position.y - this.velocity.y * 0.025); ctx.stroke();
        } else {
            ctx.fillStyle = `rgb(${r},${g},${b})`; ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, Math.max(0.1, size), 0, Math.PI * 2); ctx.fill();
        }
    }
}
