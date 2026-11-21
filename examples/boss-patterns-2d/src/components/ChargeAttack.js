import { Vector2D, MathExt } from 'gameforgejs/core';
import { CircleHit, KeepInArena } from '../data/CombatMath.js';

export class ChargeAttack {
    constructor(level) { this.level = level; this.name = 'Marked charge'; }
    Prepare() {
        this.from = this.level.boss.position.Clone(); this.to = KeepInArena(this.level.player.position, this.level.rules.arena, this.level.boss.radius); this.time = 0;
    }
    Begin() { this.level.hazards.Add(this.from); }
    Update(dt) {
        this.time += dt; const t = Math.min(1, this.time / 0.55), level = this.level;
        level.boss.position.Set(MathExt.Lerp(this.from.x, this.to.x, t), MathExt.Lerp(this.from.y, this.to.y, t));
        if (CircleHit(level.boss.position, level.boss.radius, level.player.position, level.player.radius)) level.player.health.Damage(1, level.boss);
        return t === 1;
    }
    Draw(ctx) { ctx.strokeStyle = '#ffdb9a88'; ctx.lineWidth = 80; ctx.beginPath(); ctx.moveTo(this.from.x, this.from.y); ctx.lineTo(this.to.x, this.to.y); ctx.stroke(); }
}
