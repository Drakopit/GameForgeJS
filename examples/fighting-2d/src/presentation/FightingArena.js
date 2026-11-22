import { ScreenSettings as SCREEN } from '../data/FightingSettings.js';

export class FightingArena {
    /** @param {{floorTop: number, floorHeight: number}} arena - The level's arena (from its scene). */
    DrawArena(ctx, arena) {
        const ARENA = arena;
        const sky = ctx.createLinearGradient(0, 0, 0, SCREEN.height);
        sky.addColorStop(0, "#17203A");
        sky.addColorStop(0.48, "#253A5C");
        sky.addColorStop(1, "#10131D");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, SCREEN.width, SCREEN.height);

        this.DrawMoon(ctx);
        this.DrawCityLayer(ctx, 86, "#19243A", 0.85);
        this.DrawCityLayer(ctx, 128, "#111A2B", 1);

        const floorGradient = ctx.createLinearGradient(0, ARENA.floorTop, 0, SCREEN.height);
        floorGradient.addColorStop(0, "#3B445A");
        floorGradient.addColorStop(0.34, "#252D3F");
        floorGradient.addColorStop(1, "#121620");
        ctx.fillStyle = floorGradient;
        ctx.fillRect(0, ARENA.floorTop, SCREEN.width, ARENA.floorHeight);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, ARENA.floorTop + 1);
        ctx.lineTo(SCREEN.width, ARENA.floorTop + 1);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
        for (let x = -60; x < SCREEN.width + 120; x += 80) {
            ctx.beginPath();
            ctx.moveTo(x, SCREEN.height);
            ctx.lineTo(x + 120, ARENA.floorTop);
            ctx.stroke();
        }
    }

    DrawMoon(ctx) {
        ctx.save();
        ctx.fillStyle = "rgba(238, 246, 255, 0.85)";
        ctx.beginPath();
        ctx.arc(782, 88, 42, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(23, 32, 58, 0.55)";
        ctx.beginPath();
        ctx.arc(766, 76, 42, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    DrawCityLayer(ctx, baseY, color, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        for (let x = 0; x < SCREEN.width; x += 48) {
            const height = 72 + ((x * 17) % 96);
            ctx.fillRect(x, baseY + (170 - height), 38, height);
            if (x % 96 === 0) {
                ctx.fillRect(x + 12, baseY + (150 - height), 14, 22);
            }
        }
        ctx.restore();
    }
}
