import { Component } from 'gameforgejs/core';

export class CombatVisual extends Component {
    constructor(level, kind) { super(); this.level = level; this.kind = kind; }
    OnDrawn() {
        if (this.owner.active === false) return;
        const owner = this.owner, ctx = this.level.screen.Context;
        if (!owner.health.alive) return;
        this.level.view.Begin(); ctx.save(); ctx.translate(owner.position.x, owner.position.y);
        ctx.fillStyle = '#071b2877'; ctx.beginPath(); ctx.ellipse(0, owner.radius * 0.7, owner.radius * 1.2, owner.radius * 0.45, 0, 0, Math.PI * 2); ctx.fill();
        if (owner.health.invulnerabilityTimer > 0) ctx.globalAlpha = 0.5;
        if (this.kind === 'boss') {
            ctx.fillStyle = '#996d5e'; ctx.strokeStyle = '#ecaa6b'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.roundRect(-34, -38, 68, 70, 12); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#674f57'; ctx.fillRect(-52, -23, 19, 42); ctx.fillRect(33, -23, 19, 42);
            ctx.fillStyle = '#ffcf70'; ctx.fillRect(-18, -20, 11, 7); ctx.fillRect(7, -20, 11, 7);
            ctx.beginPath(); ctx.arc(0, 8, 10 + this.level.brain.phase, 0, Math.PI * 2); ctx.fill();
        } else {
            ctx.fillStyle = this.owner.motion.dash > 0 ? '#ffffff' : '#92e1d8';
            ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(-18, 19); ctx.lineTo(18, 19); ctx.fill();
            ctx.fillStyle = '#f8e4b3'; ctx.beginPath(); ctx.arc(0, -16, 9, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore(); this.level.view.End();
    }
}
