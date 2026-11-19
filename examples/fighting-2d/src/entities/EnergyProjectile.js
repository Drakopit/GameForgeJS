import { Vector2D } from 'gameforgejs/core';
import { GameObject } from 'gameforgejs/2d';

export class EnergyProjectile extends GameObject {
    constructor(screen) { super(); this.screen = screen; this.active = false; this.previous = new Vector2D(); }
    Fire(owner, attack) {
        this.owner = owner; this.attack = attack; this.direction = owner.facingRight ? 1 : -1;
        this.radius = attack.radius * (owner.stats.powerSize ?? 1);
        this.speed = attack.speed * (owner.stats.powerSpeed ?? 1);
        this.position.Set(owner.position.x + this.direction * 52, owner.position.y - 72);
        this.previous.Copy(this.position);
        this.size.Set(this.radius * 2, this.radius * 2);
        this.remaining = attack.lifetime; this.phase = 0; this.active = true;
    }
    OnUpdate(dt) {
        if (!this.active) return;
        this.previous.Copy(this.position);
        this.position.x += this.direction * this.speed * dt;
        this.remaining -= dt; this.phase += dt;
        const arena = this.level.arena;
        if (this.remaining <= 0 || this.position.x < arena.left - this.radius || this.position.x > arena.right + this.radius) this.active = false;
    }
    GetSweepBox() {
        return { position: new Vector2D(Math.min(this.previous.x, this.position.x) - this.radius, this.position.y - this.radius),
            size: new Vector2D(Math.abs(this.position.x - this.previous.x) + this.radius * 2, this.radius * 2) };
    }
    OnDrawn() {
        if (!this.active) return;
        const ctx = this.screen.Context;
        const radius = this.radius * (1 + Math.sin(this.phase * 20) * 0.06);
        ctx.save(); ctx.translate(this.position.x, this.position.y); ctx.scale(this.direction, 1);
        const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, radius * 2);
        glow.addColorStop(0, '#ffffff'); glow.addColorStop(0.25, this.owner.tint); glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow; ctx.fillRect(-radius * 3, -radius * 2, radius * 5, radius * 4);
        ctx.fillStyle = this.owner.tint;
        ctx.beginPath(); ctx.moveTo(radius, 0); ctx.lineTo(-radius * 3, -radius * 0.55); ctx.lineTo(-radius * 2, 0); ctx.lineTo(-radius * 3, radius * 0.55); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#eaffff'; ctx.beginPath(); ctx.ellipse(0, 0, radius, radius * 0.8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = this.owner.tint; ctx.lineWidth = 3; ctx.stroke();
        ctx.restore();
    }
}
