import { BoundsComponent, Vector2D, VelocityComponent } from 'gameforgejs/core';
import { GameObject } from 'gameforgejs/2d';
import { GardenMotion } from '../components/GardenMotion.js';
import { GardenSettings as Settings } from '../data/GardenSettings.js';

export class GardenPlayer extends GameObject {
    constructor(screen, controls, obstacles) {
        super();
        this.screen = screen;
        this.obstacles = obstacles;
        this.size.Set(Settings.playerSize, Settings.playerSize);
        this.bounds = this.AddComponent(new BoundsComponent());
        this.motion = this.AddComponent(new GardenMotion(controls));
        this.velocity = this.AddComponent(new VelocityComponent({ useFixedUpdate: true }));
        this.Reset();
    }

    Reset() {
        this.position.Copy(Settings.spawn);
        this.velocity.SetVelocity(0, 0);
        this.motion.Reset();
        this.bumps = 0;
    }

    OnFixedUpdate(dt) {
        const previous = this.position.Clone();
        super.OnFixedUpdate(dt);
        const arena = Settings.arena;
        this.position.x = Math.max(arena.x, Math.min(arena.x + arena.width - this.size.x, this.position.x));
        this.position.y = Math.max(arena.y, Math.min(arena.y + arena.height - this.size.y, this.position.y));
        if (this.obstacles.some(obstacle => this.bounds.Intersects(obstacle.bounds))) {
            this.position.Copy(previous);
            this.velocity.SetVelocity(0, 0);
            this.bumps++;
        }
    }

    OnDrawn() {
        const ctx = this.screen.Context;
        const center = this.position.Add(new Vector2D(this.size.x / 2, this.size.y / 2));
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath(); ctx.ellipse(center.x, center.y + 13, 18, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = this.motion.dashRemaining > 0 ? '#fff0b8' : '#72e1c5';
        ctx.strokeStyle = '#dce9cf'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(center.x, center.y, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#123e47';
        ctx.beginPath(); ctx.arc(center.x + this.motion.facing.x * 7, center.y + this.motion.facing.y * 7, 4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
}
