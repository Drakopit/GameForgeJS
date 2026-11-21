import { GameObject } from 'gameforgejs/2d';
import { Vector2D } from 'gameforgejs/core';

export class AtlasView extends GameObject {
    constructor(level) { super(); this.level = level; }
    Layout() {
        const screen = this.level.screen, width = screen.Width - 24, height = Math.max(100, screen.Height - 260);
        const scale = Math.min(width / 960, height / 640);
        return {scale, x: (screen.Width - 960 * scale) / 2, y: 100 + (height - 640 * scale) / 2};
    }
    ToWorld(point) { const layout = this.Layout(); return new Vector2D((point.x - layout.x) / layout.scale, (point.y - layout.y) / layout.scale); }
    OnDrawn() {
        const level = this.level, ctx = level.screen.Context, layout = this.Layout();
        ctx.fillStyle = '#102c42'; ctx.fillRect(0, 0, level.screen.Width, level.screen.Height);
        ctx.save(); ctx.translate(layout.x, layout.y); ctx.scale(layout.scale, layout.scale);
        if (level.mode === 'stage') this.DrawStage(ctx); else this.DrawMap(ctx);
        ctx.restore();
    }
    DrawMap(ctx) {
        const level = this.level, progress = level.progress;
        const scale = this.Layout().scale, radius = Math.max(24, 17 / scale);
        for (const [index, color] of ['#21485b', '#32625f', '#497a65'].entries()) {
            ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(495, 350, 450 - index * 18, 240 - index * 17, -0.12, 0, Math.PI * 2); ctx.fill();
        }
        for (const [from, to] of progress.edges) {
            const start = progress.nodes.get(from), end = progress.nodes.get(to), open = progress.cleared.has(from);
            ctx.strokeStyle = open ? '#e8cb8d' : '#324e56'; ctx.lineWidth = open ? 9 : 6; ctx.setLineDash(open ? [] : [9, 9]);
            ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
        }
        ctx.setLineDash([]);
        for (const [index, node] of [...progress.nodes.values()].entries()) {
            const open = progress.Available(node.id), cleared = progress.cleared.has(node.id);
            ctx.fillStyle = cleared ? '#85e1b0' : open ? '#f3cb78' : '#233e50'; ctx.strokeStyle = '#132e40'; ctx.lineWidth = 5;
            ctx.beginPath(); ctx.arc(node.x, node.y, radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = open ? '#132c38' : '#7893a1'; ctx.textAlign = 'center';
            ctx.font = `bold ${Math.max(21, 14 / scale)}px Arial`; ctx.fillText(cleared ? '✓' : String(index + 1), node.x, node.y + Math.max(7, 5 / scale));
            if (scale > 0.65) { ctx.fillStyle = '#f4ead3'; ctx.font = '15px Arial'; ctx.fillText(node.name, node.x, node.y + 47); }
        }
        const p = level.navigator.position;
        ctx.fillStyle = '#fff4d6'; ctx.beginPath(); ctx.moveTo(p.x, p.y - radius - 10); ctx.lineTo(p.x - 12, p.y - radius - 30); ctx.lineTo(p.x + 12, p.y - radius - 30); ctx.fill();
    }
    DrawStage(ctx) {
        const trial = this.level.trial;
        ctx.fillStyle = '#284e58'; ctx.fillRect(80, 125, 820, 410); ctx.strokeStyle = '#c2cf99'; ctx.lineWidth = 5; ctx.strokeRect(80, 125, 820, 410);
        ctx.strokeStyle = '#48716b'; ctx.lineWidth = 1;
        for (let x = 100; x < 900; x += 40) { ctx.beginPath(); ctx.moveTo(x, 125); ctx.lineTo(x, 535); ctx.stroke(); }
        trial.GetShards().forEach((point, index) => {
            if (trial.collected.has(index)) return;
            ctx.fillStyle = '#ffe2a0'; ctx.beginPath(); ctx.moveTo(point.x, point.y - 17); ctx.lineTo(point.x + 11, point.y); ctx.lineTo(point.x, point.y + 17); ctx.lineTo(point.x - 11, point.y); ctx.fill();
        });
        for (const point of trial.GetHazards()) { ctx.fillStyle = '#ed8268'; ctx.beginPath(); ctx.arc(point.x, point.y, 20, 0, Math.PI * 2); ctx.fill(); }
        ctx.fillStyle = '#a7f3de'; ctx.beginPath(); ctx.arc(trial.position.x, trial.position.y, 17, 0, Math.PI * 2); ctx.fill();
    }
}
