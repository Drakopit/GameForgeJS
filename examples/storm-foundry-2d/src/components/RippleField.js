// @ts-check
import { Component } from 'gameforgejs/core';

/** @typedef {{active: boolean, x: number, y: number, age: number, life: number, radius: number, power: number, stretch: number}} Ripple */

/** Fixed-capacity analytic surface waves, shared by weather and prop impacts. */
export class RippleField extends Component {
    /** @param {number} capacity */
    constructor(capacity) {
        super();
        /** @type {Ripple[]} */ this.rings = Array.from({ length: capacity }, () =>
            ({ active: false, x: 0, y: 0, age: 0, life: 1, radius: 0, power: 0, stretch: 0.25 }));
        this.cursor = 0; this.totalImpacts = 0;
    }
    /** @param {number} x @param {number} y @param {number} [power] @param {number} [stretch] */
    Impact(x, y, power = 1, stretch = 0.3) {
        const ring = this.rings[this.cursor]; this.cursor = (this.cursor + 1) % this.rings.length;
        Object.assign(ring, { active: true, x, y, age: 0, life: 0.8 + power * 0.45, radius: 0, power, stretch });
        this.totalImpacts++;
    }
    /** @param {number} dt */
    OnUpdate(dt) {
        for (const ring of this.rings) if (ring.active) {
            ring.age += dt; ring.radius = ring.age * (55 + ring.power * 32);
            if (ring.age >= ring.life) ring.active = false;
        }
    }
    /** @param {import('../data/FoundryTypes.js').PaintContext} ctx */
    Draw(ctx) {
        ctx.save(); ctx.lineWidth = 1;
        for (const ring of this.rings) if (ring.active) {
            const fade = (1 - ring.age / ring.life) ** 2;
            ctx.strokeStyle = `rgba(118,237,236,${fade * 0.38})`;
            ctx.beginPath(); ctx.ellipse(ring.x, ring.y, ring.radius, ring.radius * ring.stretch, 0, 0, Math.PI * 2); ctx.stroke();
            ctx.strokeStyle = `rgba(255,196,135,${fade * 0.15})`;
            ctx.beginPath(); ctx.ellipse(ring.x, ring.y, ring.radius * 0.65, ring.radius * ring.stretch * 0.65, 0, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    }
    Clear() { for (const ring of this.rings) ring.active = false; this.cursor = 0; this.totalImpacts = 0; }
}
