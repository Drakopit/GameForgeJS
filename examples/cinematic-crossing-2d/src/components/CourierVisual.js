import { Component } from 'gameforgejs/core';

export class CourierVisual extends Component {
    constructor(level) { super(); this.level = level; this.time = 0; }
    OnUpdate(dt) { this.time += dt; }
    OnDrawn() {
        const level = this.level, ctx = level.screen.Context, position = this.owner.position;
        level.camera.Begin(); ctx.save(); ctx.translate(position.x, position.y);
        ctx.fillStyle = '#132c3d'; ctx.beginPath(); ctx.ellipse(0, 4, 22, 7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#eeaa61'; ctx.beginPath(); ctx.moveTo(-17, 0); ctx.lineTo(0, -54); ctx.lineTo(18, 0); ctx.fill();
        ctx.fillStyle = '#f4dcac'; ctx.beginPath(); ctx.arc(0, -57, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff0b1'; ctx.shadowColor = '#ffc15c'; ctx.shadowBlur = 28;
        ctx.fillRect(20, -27 + Math.sin(this.time * 4) * 2, 10, 16);
        ctx.restore(); level.camera.End();
    }
}
