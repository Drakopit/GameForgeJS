// @ts-check
import { IndustrialScene } from './IndustrialScene.js';
import { ReactorPass } from './ReactorPass.js';
import { WaterPass } from './WaterPass.js';
import { PostProcessPass } from './PostProcessPass.js';

/** Ordered passes, no animation loop: background/props -> reflection -> particles -> post. */
export class FoundryRenderer {
    /** @param {import('../entities/FoundryWorld.js').FoundryWorld} world @param {import('gameforgejs/2d').Screen} screen */
    constructor(world, screen) {
        this.world = world; this.scene = new IndustrialScene(world); this.reactor = new ReactorPass(world);
        this.water = new WaterPass(world); this.post = new PostProcessPass(world, screen);
    }
    Resize() { this.scene.Resize(); this.post.Resize(); }
    Draw() {
        const w = this.world, ctx = w.target.Context;
        this.scene.Draw(ctx); this.reactor.Draw(ctx);
        for (const actor of w.props) actor.OnDrawn();
        this.water.Draw();
        w.rain.Draw(ctx);
        ctx.save(); ctx.globalCompositeOperation = w.settings.current.additive ? 'lighter' : 'source-over';
        w.particles.Draw(ctx); w.splashes.Draw(ctx); ctx.restore();
        if (w.settings.debug) this.DrawDebug();
        this.post.Draw();
    }
    DrawDebug() {
        const w = this.world, ctx = w.target.Context;
        ctx.save(); ctx.strokeStyle = '#99ff97'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, w.surfaceY); ctx.lineTo(w.width, w.surfaceY); ctx.stroke();
        for (const actor of w.props) if (actor.active) {
            const x = actor.position.x + actor.radius, y = actor.position.y + actor.radius;
            ctx.beginPath(); ctx.arc(x, y, actor.radius, 0, Math.PI * 2); ctx.stroke();
            const bounds = actor.bounds.GetAABB();
            ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
            ctx.strokeStyle = '#f6bb6d'; ctx.beginPath(); ctx.moveTo(x, y);
            ctx.lineTo(x + actor.velocity.vx * 0.15, y + actor.velocity.vy * 0.15); ctx.stroke(); ctx.strokeStyle = '#99ff97';
        }
        ctx.restore();
    }
    Dispose() { this.scene.Dispose(); this.post.Dispose(); }
}
