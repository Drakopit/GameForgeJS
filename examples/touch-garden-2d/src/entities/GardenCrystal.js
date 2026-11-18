import { BoundsComponent } from 'gameforgejs/core';
import { GameObject } from 'gameforgejs/2d';

export class GardenCrystal extends GameObject {
    constructor(screen, position) {
        super();
        this.screen = screen;
        this.position.Copy(position);
        this.size.Set(20, 26);
        this.bounds = this.AddComponent(new BoundsComponent());
        this.collected = false;
        this.phase = position.x;
    }

    OnUpdate(dt) { this.phase += dt * 3; }

    TryCollect(player) {
        if (this.collected || !this.bounds.Intersects(player.bounds)) return false;
        this.collected = true;
        return true;
    }

    OnDrawn() {
        if (this.collected) return;
        const ctx = this.screen.Context;
        const x = this.position.x + 10;
        const y = this.position.y + 13 + Math.sin(this.phase) * 3;
        ctx.save(); ctx.fillStyle = '#edcd7d'; ctx.strokeStyle = '#fff2c2'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, y - 13); ctx.lineTo(x + 10, y); ctx.lineTo(x, y + 13); ctx.lineTo(x - 10, y); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    }
}
