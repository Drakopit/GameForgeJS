import { Vector2D } from 'gameforgejs/core';

export class RingAttack {
    constructor(level) { this.level = level; this.name = 'Ember ring'; this.turn = 0; }
    Prepare() { this.turn += 0.19; }
    Begin(phase) {
        const count = 12 + phase * 3;
        for (let index = 0; index < count; index++) {
            const angle = index / count * Math.PI * 2 + this.turn;
            this.level.Emit(this.level.boss.position, new Vector2D(Math.cos(angle), Math.sin(angle)).MultiplyScalar(this.level.rules.boss.projectileSpeed * 0.9), 'enemy');
        }
        if (phase > 0) this.level.hazards.Add(this.level.player.position);
    }
    Update() { return true; }
    Draw(ctx) { const p = this.level.boss.position; ctx.strokeStyle = '#ffd590'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, 90, 0, Math.PI * 2); ctx.stroke(); }
}
