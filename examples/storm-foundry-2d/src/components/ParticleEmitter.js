// @ts-check
import { Component } from 'gameforgejs/core';
import { HueColor } from '../data/Palette.js';

const MAX_BIRTHS_PER_UPDATE = 80;

/** Live emitter tuning changes future births; existing particles keep their curves. */
export class ParticleEmitter extends Component {
    /** @param {import('../entities/FoundryWorld.js').FoundryWorld} world */
    constructor(world) { super(); this.world = world; this.carry = 0; }
    /** @param {number} dt */
    OnUpdate(dt) {
        const s = this.world.settings.current;
        this.carry = Math.min(MAX_BIRTHS_PER_UPDATE, this.carry + s.spawnRate * dt);
        const count = Math.floor(this.carry); this.carry -= count;
        this.Emit(count);
    }
    /** @param {number} count @param {number} [power] */
    Emit(count, power = 1) {
        const w = this.world, s = w.settings.current;
        const color = HueColor(s.hue), endColor = HueColor(s.endHue);
        for (let index = 0; index < count; index++) {
            const angle = -Math.PI / 2 + w.random.Range(-s.spread, s.spread);
            const speed = s.speed * power * w.random.Range(0.4, 1.2);
            w.particles.Emit(w.emitter.x + w.random.Range(-8, 8), w.emitter.y + w.random.Range(-8, 8), {
                vx: Math.cos(angle) * speed + s.wind * 0.25, vy: Math.sin(angle) * speed,
                lifetime: s.lifetime * w.random.Range(0.65, 1), size: s.size, endSize: s.endSize,
                gravity: s.gravity, wind: s.wind * 0.3, drag: s.drag, color, endColor, opacity: 0.9,
            });
        }
    }
}
