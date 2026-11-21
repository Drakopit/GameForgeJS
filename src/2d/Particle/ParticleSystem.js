// @ts-check
import { Component } from '../../core/Component.js';
import { ObjectPool } from '../../core/ObjectPool.js';
import { Particle } from './Particle.js';

/**
 * Bounded particle component on the normal GameObject lifecycle. Emit accepts
 * particle settings; dropped emissions are counted, never expanded past capacity.
 * @param {Object} [options] - Capacity, optional Screen and an optional per-step hook.
 */
export class ParticleSystem extends Component {
    /** @param {{capacity?: number, screen?: {Context: CanvasRenderingContext2D} | null, onStep?: ((particle: Particle, dt: number) => void) | null}} [options] */
    constructor({ capacity = 512, screen = null, onStep = null } = {}) {
        super();
        if (!Number.isInteger(capacity) || capacity < 1 || capacity > 20000) throw new RangeError('Particle capacity must be 1..20000.');
        this.pool = new ObjectPool(() => new Particle(), capacity, { maxSize: capacity });
        /** @type {Particle[]} */ this.particles = [];
        this.screen = screen; this.onStep = onStep; this.dropped = 0;
        this.capacity = capacity;
    }
    /** @param {number} x @param {number} y @param {import('./Particle.js').ParticleOptions} [options] */
    Emit(x, y, options = {}) {
        const particle = this.pool.Get();
        if (!particle) { this.dropped++; return null; }
        try { particle.Reset(x, y, options); }
        catch (error) { this.pool.Release(particle); throw error; }
        this.particles.push(particle);
        return particle;
    }
    /** @param {number} [dt] */
    OnUpdate(dt = 1 / 60) {
        if (!Number.isFinite(dt) || dt < 0) throw new RangeError('Particle delta must be finite and nonnegative.');
        for (let index = this.particles.length - 1; index >= 0; index--) {
            const particle = this.particles[index];
            particle.OnUpdate(dt);
            if (particle.active) this.onStep?.(particle, dt);
            if (!particle.active) {
                this.pool.Release(particle);
                this.particles[index] = this.particles[this.particles.length - 1]; this.particles.pop();
            }
        }
    }
    /** @param {CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D} ctx */
    Draw(ctx) {
        ctx.save();
        for (const particle of this.particles) particle.Draw(ctx);
        ctx.restore();
    }
    OnDrawn() { if (this.screen) this.Draw(this.screen.Context); }
    Clear() {
        for (const particle of this.particles) this.pool.Release(particle);
        this.particles.length = 0; this.dropped = 0;
    }
    OnDestroy() { this.Clear(); this.pool.pool.length = 0; this.onStep = null; }
}
