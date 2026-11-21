import { GameObject } from 'gameforgejs/2d';
import { GardenSettings as Settings } from '../data/GardenSettings.js';

export class GardenBackground extends GameObject {
    constructor(screen) { super(); this.screen = screen; }

    OnDrawn() {
        const ctx = this.screen.Context;
        const arena = Settings.arena;
        ctx.save();
        ctx.fillStyle = '#0b202c'; ctx.fillRect(0, 0, this.screen.width, this.screen.height);
        ctx.fillStyle = '#1a403f'; ctx.beginPath(); ctx.roundRect(arena.x, arena.y, arena.width, arena.height, 16); ctx.fill();
        ctx.strokeStyle = 'rgba(145,198,158,0.12)'; ctx.lineWidth = 1;
        const tile = 36;
        for (let x = arena.x + tile; x < arena.x + arena.width; x += tile) {
            ctx.beginPath(); ctx.moveTo(x, arena.y); ctx.lineTo(x, arena.y + arena.height); ctx.stroke();
        }
        for (let y = arena.y + tile; y < arena.y + arena.height; y += tile) {
            ctx.beginPath(); ctx.moveTo(arena.x, y); ctx.lineTo(arena.x + arena.width, y); ctx.stroke();
        }
        ctx.strokeStyle = '#52877b'; ctx.strokeRect(arena.x + 4, arena.y + 4, arena.width - 8, arena.height - 8);
        ctx.restore();
    }
}
