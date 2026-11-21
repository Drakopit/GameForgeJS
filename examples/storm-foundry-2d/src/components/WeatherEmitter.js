// @ts-check
import { Component } from 'gameforgejs/core';

const MAX_BIRTHS_PER_UPDATE = 100;
const RAIN_COLOR = Object.freeze({ r: 133, g: 189, b: 207 });

/** Depth affects streak length, brightness, speed and impact position on the pool. */
export class WeatherEmitter extends Component {
    /** @param {import('../entities/FoundryWorld.js').FoundryWorld} world */
    constructor(world) { super(); this.world = world; this.carry = 0; }
    /** @param {number} dt */
    OnUpdate(dt) {
        this.carry = Math.min(MAX_BIRTHS_PER_UPDATE, this.carry + this.world.settings.current.rainRate * dt);
        const count = Math.floor(this.carry); this.carry -= count;
        for (let index = 0; index < count; index++) this.Emit(false);
    }
    /** @param {boolean} prewarm */
    Emit(prewarm) {
        const w = this.world, depth = w.random.Range(0.35, 1.35);
        w.rain.Emit(w.random.Range(-100, w.width + 140), prewarm ? w.random.Range(-30, w.surfaceY) : -30, {
            vx: w.settings.current.wind * depth, vy: 440 * depth + 120, lifetime: 3,
            size: depth * 0.8, endSize: depth * 0.8, depth, color: RAIN_COLOR,
            opacity: depth * 0.5, shape: 'streak',
        });
    }
    /** @param {import('gameforgejs/2d').Particle} particle */
    StepRain(particle) {
        const w = this.world;
        particle.velocity.x = w.settings.current.wind * particle.depth + w.gust * particle.depth;
        const surface = w.surfaceY + (particle.depth - 0.35) * w.height * 0.17;
        if (particle.position.y < surface) return;
        particle.active = false;
        if (w.random.Next() < 0.16) w.water.Impact(particle.position.x, surface, particle.depth * 0.3, 0.2 + particle.depth * 0.12);
        if (w.random.Next() < 0.045) w.Splash(particle.position.x, surface, 0.3);
    }
}
