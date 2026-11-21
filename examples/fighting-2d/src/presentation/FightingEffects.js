import { Vector2D } from 'gameforgejs/core';

const Settings = Object.freeze({ duration: 0.22, shakeSeconds: 0.16, maximumSparks: 16 });
export class FightingEffects {
    constructor() { this.Reset(); }
    Reset() { this.sparks = []; this.elapsed = this.shakeRemaining = this.shakeIntensity = 0; }
    Impact(position, color, blocked) {
        if (this.sparks.length >= Settings.maximumSparks) this.sparks.shift();
        this.sparks.push({ position: new Vector2D(position.x, position.y), color, blocked, remaining: Settings.duration });
    }
    Shake(intensity) { this.shakeRemaining = Settings.shakeSeconds; this.shakeIntensity = Math.max(this.shakeIntensity, intensity); }
    OnUpdate(dt) {
        this.elapsed += dt; this.shakeRemaining = Math.max(0, this.shakeRemaining - dt);
        if (!this.shakeRemaining) this.shakeIntensity = 0;
        for (const spark of this.sparks) spark.remaining -= dt;
        this.sparks = this.sparks.filter(spark => spark.remaining > 0);
    }
    Offset() {
        const strength = this.shakeIntensity * this.shakeRemaining / Settings.shakeSeconds;
        return new Vector2D(Math.sin(this.elapsed * 90) * strength, Math.cos(this.elapsed * 130) * strength * 0.6);
    }
    Draw(ctx) {
        for (const spark of this.sparks) {
            const progress = spark.remaining / Settings.duration;
            const radius = (spark.blocked ? 20 : 35) * (1 - progress) + 5;
            ctx.save(); ctx.globalAlpha = progress; ctx.strokeStyle = spark.color; ctx.lineWidth = spark.blocked ? 5 : 3;
            ctx.beginPath(); ctx.arc(spark.position.x, spark.position.y, radius, 0, Math.PI * 2); ctx.stroke();
            if (!spark.blocked) {
                ctx.strokeStyle = '#fff8c5'; ctx.lineWidth = 4;
                for (let i = 0; i < 6; i++) {
                    const angle = i / 6 * Math.PI * 2;
                    ctx.beginPath(); ctx.moveTo(spark.position.x, spark.position.y);
                    ctx.lineTo(spark.position.x + Math.cos(angle) * radius * 1.5, spark.position.y + Math.sin(angle) * radius * 1.5); ctx.stroke();
                }
            }
            ctx.restore();
        }
    }
}
