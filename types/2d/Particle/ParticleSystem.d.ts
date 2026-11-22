/**
 * Bounded particle component on the normal GameObject lifecycle. Emit accepts
 * particle settings; dropped emissions are counted, never expanded past capacity.
 * @param {Object} [options] - Capacity, optional Screen and an optional per-step hook.
 */
export class ParticleSystem extends Component {
    /** @param {{capacity?: number, screen?: {Context: CanvasRenderingContext2D} | null, onStep?: ((particle: Particle, dt: number) => void) | null}} [options] */
    constructor({ capacity, screen, onStep }?: {
        capacity?: number;
        screen?: {
            Context: CanvasRenderingContext2D;
        } | null;
        onStep?: ((particle: Particle, dt: number) => void) | null;
    });
    pool: ObjectPool<Particle>;
    /** @type {Particle[]} */ particles: Particle[];
    screen: {
        Context: CanvasRenderingContext2D;
    };
    onStep: (particle: Particle, dt: number) => void;
    dropped: number;
    capacity: number;
    /** @param {number} x @param {number} y @param {import('./Particle.js').ParticleOptions} [options] */
    Emit(x: number, y: number, options?: import("./Particle.js").ParticleOptions): Particle;
    /** @param {number} [dt] */
    OnUpdate(dt?: number): void;
    /** @param {CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D} ctx */
    Draw(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void;
    Clear(): void;
}
import { Component } from '../../core/Component.js';
import { Particle } from './Particle.js';
import { ObjectPool } from '../../core/ObjectPool.js';
