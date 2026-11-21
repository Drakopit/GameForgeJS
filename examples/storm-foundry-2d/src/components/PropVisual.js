// @ts-check
import { Component } from 'gameforgejs/core';

/** Draws into the scene's framework-owned render target during the standard draw hook. */
export class PropVisual extends Component {
    /** @param {import('../entities/FoundryProp.js').FoundryProp} actor @param {import('../entities/FoundryWorld.js').FoundryWorld} world */
    constructor(actor, world) { super(); this.actor = actor; this.world = world; }
    OnDrawn() {
        const a = this.actor;
        if (!a.active) return;
        const ctx = this.world.target.Context, r = a.radius;
        ctx.save(); ctx.translate(a.position.x + r, a.position.y + r); ctx.rotate(a.rotation);
        const metal = ctx.createRadialGradient(-r * 0.4, -r * 0.4, 1, 0, 0, r);
        metal.addColorStop(0, '#9cb6b8'); metal.addColorStop(0.25, '#3b5d69'); metal.addColorStop(1, '#09141e');
        ctx.fillStyle = metal; ctx.strokeStyle = '#9ec9ca'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#f6b45e'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, r * 0.62, -1, 1.1); ctx.stroke();
        ctx.strokeStyle = '#85e4e8'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(-r * 0.6, 0); ctx.lineTo(r * 0.6, 0); ctx.stroke();
        ctx.restore();
    }
}
