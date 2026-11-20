// @ts-check
import { CanvasRenderTarget } from 'gameforgejs/2d';

const CHROMATIC_LAYERS = Object.freeze([
    { tint: '#ff0000', direction: -1 }, { tint: '#00ffff', direction: 1 },
]);

/** Bounded Canvas composites: low-resolution glow, tint ghosts, grade and vignette. */
export class PostProcessPass {
    /** @param {import('../entities/FoundryWorld.js').FoundryWorld} world @param {import('gameforgejs/2d').Screen} screen */
    constructor(world, screen) {
        this.world = world; this.screen = screen;
        this.glow = new CanvasRenderTarget(1, 1); this.chromatic = new CanvasRenderTarget(1, 1);
        this.Resize();
    }
    Resize() {
        const w = Math.max(1, Math.ceil(this.world.width / 3)), h = Math.max(1, Math.ceil(this.world.height / 3));
        this.glow.Resize(w, h); this.chromatic.Resize(w, h);
    }
    Draw() {
        const w = this.world, s = w.settings.current, ctx = this.screen.Context;
        if (!ctx) return;
        ctx.save(); ctx.clearRect(0, 0, w.width, w.height);
        if (!w.settings.reducedMotion) {
            const amount = w.trauma ** 2 * s.shake * 12;
            ctx.translate(Math.sin(w.age * 83) * amount, Math.cos(w.age * 67) * amount);
        }
        ctx.drawImage(w.target.Canvas, 0, 0);
        if (s.glow > 0) {
            const target = this.glow;
            target.Clear(); target.Context.filter = 'blur(3px)';
            target.Context.drawImage(w.target.Canvas, 0, 0, target.Canvas.width, target.Canvas.height);
            target.Context.filter = 'none'; ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = s.glow * 0.28;
            ctx.drawImage(target.Canvas, 0, 0, w.width, w.height);
        }
        if (s.chroma > 0) {
            const target = this.chromatic, tc = target.Context;
            for (const layer of CHROMATIC_LAYERS) {
                tc.globalCompositeOperation = 'source-over'; target.Clear();
                tc.drawImage(w.target.Canvas, 0, 0, target.Canvas.width, target.Canvas.height);
                tc.globalCompositeOperation = 'multiply'; tc.fillStyle = layer.tint; tc.fillRect(0, 0, target.Canvas.width, target.Canvas.height);
                ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = s.chroma * 0.17;
                ctx.drawImage(target.Canvas, layer.direction * s.chroma * 5, 0, w.width, w.height);
            }
            tc.globalCompositeOperation = 'source-over';
        }
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'soft-light';
        ctx.fillStyle = `rgba(25,135,149,${s.grade})`; ctx.fillRect(0, 0, w.width, w.height);
        ctx.globalCompositeOperation = 'source-over';
        if (s.vignette > 0) {
            const vignette = ctx.createRadialGradient(w.width * 0.52, w.height * 0.46, w.height * 0.18,
                w.width * 0.5, w.height * 0.5, Math.max(w.width, w.height) * 0.65);
            vignette.addColorStop(0, 'rgba(0,0,0,0)'); vignette.addColorStop(1, `rgba(0,3,10,${s.vignette})`);
            ctx.fillStyle = vignette; ctx.fillRect(0, 0, w.width, w.height);
        }
        if (s.scanlines > 0) {
            ctx.fillStyle = `rgba(0,0,0,${s.scanlines})`;
            for (let y = 0; y < w.height; y += 4) ctx.fillRect(0, y, w.width, 1);
        }
        ctx.restore();
    }
    Dispose() { this.glow.Dispose(); this.chromatic.Dispose(); }
}
