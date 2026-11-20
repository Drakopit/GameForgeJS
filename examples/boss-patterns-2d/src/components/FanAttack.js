import { Vector2D } from 'gameforgejs/core';

export class FanAttack {
    constructor(level) { this.level = level; this.name = 'Aimed fan'; }
    Prepare() { const delta = this.level.player.position.Subtract(this.level.boss.position); this.angle = Math.atan2(delta.y, delta.x); }
    Begin(phase) {
        const count = 5 + phase * 2;
        for (let index = 0; index < count; index++) {
            const angle = this.angle + (index - (count - 1) / 2) * 0.16;
            this.level.Emit(this.level.boss.position, new Vector2D(Math.cos(angle), Math.sin(angle)).MultiplyScalar(this.level.rules.boss.projectileSpeed), 'enemy');
        }
    }
    Update() { return true; }
    Draw(ctx) {
        const p = this.level.boss.position;
        ctx.strokeStyle = '#f6d59a'; ctx.fillStyle = '#e8b97822'; ctx.beginPath(); ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, 340, this.angle - 0.6, this.angle + 0.6); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
}
