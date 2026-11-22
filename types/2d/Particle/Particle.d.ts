/** A time-based, reusable particle. Position and velocity use pixels/seconds. */
export class Particle extends Base {
    /** @param {number} [x] @param {number} [y] @param {ParticleOptions} [options] */
    constructor(x?: number, y?: number, options?: ParticleOptions);
    position: Vector2D;
    velocity: Vector2D;
    active: boolean;
    age: number;
    lifetime: number;
    size: number;
    endSize: number;
    gravity: number;
    wind: number;
    drag: number;
    opacity: number;
    depth: number;
    /** @type {ParticleColor} */ color: ParticleColor;
    /** @type {ParticleColor} */ endColor: ParticleColor;
    /** @type {'disc'|'streak'} */ shape: "disc" | "streak";
    set x(value: number);
    get x(): number;
    set y(value: number);
    get y(): number;
    /** @param {number} x @param {number} y @param {ParticleOptions} [options] */
    Reset(x: number, y: number, options?: ParticleOptions): void;
    /** @param {number} [dt] */
    OnUpdate(dt?: number): void;
    isAlive(): boolean;
    /** @param {CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D} ctx */
    Draw(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void;
}
export type ParticleColor = {
    r: number;
    g: number;
    b: number;
};
export type ParticleOptions = {
    vx?: number;
    vy?: number;
    lifetime?: number;
    size?: number;
    endSize?: number;
    gravity?: number;
    wind?: number;
    drag?: number;
    opacity?: number;
    depth?: number;
    color?: ParticleColor;
    endColor?: ParticleColor;
    shape?: "disc" | "streak";
};
import { Base } from '../../core/Base.js';
import { Vector2D } from '../../core/Math/Vector2D.js';
