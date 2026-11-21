import { Component } from '../../core/Component.js';
import { Vector3D } from '../../core/Math/Vector3D.js';
/**
 * Seeded bounded rain simulation in world coordinates. FixedUpdate owns motion;
 * a native renderer component can consume drops without owning another loop.
 * @param {Object} [options] Count (0–2048), bounds, speed, wind, seed, heightAt and onImpact.
 */
export class RainEmitter extends Component {
    constructor({ count = 96, bounds = { width: 16, depth: 16, height: 10 }, speed = 12, wind = new Vector3D(1, 0, 0), seed = 1, heightAt = () => 0, onImpact = () => { } } = {}) {
        super();
        if (!Number.isInteger(count) || count < 0 || count > 2048 || ![bounds.width, bounds.depth, bounds.height, speed].every(v => Number.isFinite(v) && v > 0))
            throw new RangeError('Invalid rain budget or bounds.');
        if(!Number.isInteger(seed)||![wind.x,wind.y,wind.z].every(Number.isFinite)||typeof heightAt!=='function'||typeof onImpact!=='function')throw new TypeError('Rain requires a finite wind, integer seed and surface callbacks.');
        this.bounds = { ...bounds };
        this.speed = speed;
        this.wind = new Vector3D(wind.x, wind.y, wind.z);
        this.seed = seed >>> 0;
        this.heightAt = heightAt;
        this.onImpact = onImpact;
        this.impacts = 0;
        this.drops = Array.from({ length: count }, () => ({ position: new Vector3D(), impact: new Vector3D(), splash: 0 }));
        this.activeCount = count;
        for (const drop of this.drops)
            this.Spawn(drop, true);
    }
    Random() { this.seed = (Math.imul(this.seed, 1664525) + 1013904223) >>> 0; return this.seed / 4294967296; }
    Spawn(drop, initial = false) {
        const b = this.bounds;
        drop.position.Set((this.Random() - 0.5) * b.width, initial ? this.Random() * b.height : b.height, (this.Random() - 0.5) * b.depth);
    }
    SetIntensity(intensity) {
        if (!Number.isFinite(intensity) || intensity < 0 || intensity > 1)
            throw new RangeError('Rain intensity must be between zero and one.');
        const count = Math.round(this.drops.length * intensity);
        for (let i = this.activeCount; i < count; i++) {
            this.Spawn(this.drops[i], true);
            this.drops[i].splash = 0;
        }
        this.activeCount = count;
    }
    OnFixedUpdate(dt) {
        if (!Number.isFinite(dt) || dt < 0)
            throw new RangeError('Rain delta must be nonnegative.');
        for (let i = 0; i < this.activeCount; i++) {
            const drop = this.drops[i];
            drop.splash = Math.max(0, drop.splash - dt);
            const p = drop.position;
            p.x += this.wind.x * dt;
            p.z += this.wind.z * dt;
            p.y -= this.speed * dt;
            const floor = this.heightAt(p.x, p.z);
            if (p.y <= floor) {
                const hit = new Vector3D(p.x, floor, p.z);
                drop.impact.Copy(hit);
                this.impacts++;
                this.onImpact(hit);
                this.Spawn(drop);
                drop.splash = 0.2;
            }
            if (Math.abs(p.x) > this.bounds.width / 2 || Math.abs(p.z) > this.bounds.depth / 2)
                this.Spawn(drop);
        }
    }
    OnDestroy() { this.drops.length = 0; this.onImpact = () => { }; }
}
