import { GameObject, Camera } from 'gameforgejs/2d';
import { Vector2D } from 'gameforgejs/core';

export class ArenaView extends GameObject {
    constructor(level) {
        super(); this.level = level; this.time = 0;
        this.camera = new Camera(new Vector2D(), new Vector2D()); this.camera.Init(level.screen, level.rules.arena);
    }
    OnUpdate(dt) { this.time += dt; }
    Layout() {
        const screen = this.level.screen;
        const scale = Math.min((screen.Width - 20) / (screen.Width < 600 ? 480 : 960), Math.max(100, screen.Height - 250) / 640);
        const visibleWidth = (screen.Width - 20) / scale;
        const center = Math.max(visibleWidth / 2, Math.min(960 - visibleWidth / 2, this.level.player?.position.x ?? 480));
        return {scale, x: screen.Width / 2 - center * scale, y: 105 + (Math.max(100, screen.Height - 250) - 640 * scale) / 2};
    }
    Begin() {
        const layout = this.Layout(), screen = this.level.screen, ctx = screen.Context;
        ctx.save(); ctx.beginPath(); ctx.rect(10, 105, screen.Width - 20, Math.max(100, screen.Height - 250)); ctx.clip();
        this.camera.SetZoom(layout.scale); this.camera.position.Set(-layout.x / layout.scale, -layout.y / layout.scale); this.camera.Begin();
    }
    End() { this.camera.End(); this.level.screen.Context.restore(); }
    OnDrawn() {
        const level = this.level, ctx = level.screen.Context;
        ctx.fillStyle = '#101e2b'; ctx.fillRect(0, 0, level.screen.Width, level.screen.Height); this.Begin();
        ctx.fillStyle = level.room.floor; ctx.fillRect(50, 50, 860, 540);
        ctx.strokeStyle = '#4b5960'; ctx.lineWidth = 1;
        for (let x = 70; x < 910; x += 40) for (let y = 70; y < 580; y += 40) ctx.strokeRect(x, y, 40, 40);
        ctx.strokeStyle = level.room.trim; ctx.lineWidth = 6; ctx.strokeRect(60, 60, 840, 520);
        for (const x of [100, 860]) for (const y of [100, 540]) {
            ctx.fillStyle = '#696156'; ctx.fillRect(x - 17, y - 10, 34, 28); ctx.fillStyle = '#edb66c';
            ctx.beginPath(); ctx.ellipse(x, y - 16, 8 + Math.sin(this.time * 4) * 2, 18, 0, 0, Math.PI * 2); ctx.fill();
        }
        ctx.strokeStyle = '#72807555'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(480, 320, 130, 0, Math.PI * 2); ctx.stroke();
        if (!level.boss.active) {
            ctx.fillStyle = level.exitOpen ? '#79e1b8' : '#775c62';
            ctx.fillRect(444, 67, 72, 32);
            ctx.fillStyle = '#191d28';
            ctx.textAlign = 'center';
            ctx.font = 'bold 14px system-ui';
            ctx.fillText('EXIT', 480, 89);
            for (const [i, [x, y]] of (level.room.switches ?? []).entries()) {
                ctx.fillStyle = level.switches.has(i) ? '#79e1b8' : '#eac079';
                ctx.beginPath(); ctx.arc(x, y, 25, 0, Math.PI * 2); ctx.fill();
            }
        }
        level.hazards.Draw(ctx);
        if (level.boss.active && level.brain.state === 'windup' && !level.result) level.brain.pattern.Draw(ctx);
        this.End();
    }
}
