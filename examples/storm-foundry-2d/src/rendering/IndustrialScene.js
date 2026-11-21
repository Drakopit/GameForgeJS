// @ts-check
import { CanvasRenderTarget } from 'gameforgejs/2d';
import { SeededRandom } from '../data/SeededRandom.js';

/** Static procedural architecture is cached once per resize, not rebuilt per frame. */
export class IndustrialScene {
    /** @param {import('../entities/FoundryWorld.js').FoundryWorld} world */
    constructor(world) { this.world = world; this.cache = new CanvasRenderTarget(1, 1); this.Resize(); }
    Resize() {
        const w = this.world.width, h = this.world.height, floor = this.world.surfaceY;
        this.cache.Resize(Math.round(w), Math.round(h));
        const ctx = this.cache.Context, random = new SeededRandom(9137);
        const sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, '#030914'); sky.addColorStop(0.5, '#112d3c'); sky.addColorStop(1, '#061018');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
        const haze = ctx.createRadialGradient(w * 0.7, floor * 0.65, 5, w * 0.7, floor * 0.65, w * 0.65);
        haze.addColorStop(0, '#1b4a55'); haze.addColorStop(1, 'rgba(9,21,36,0)');
        ctx.fillStyle = haze; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#c1d6cb'; ctx.globalAlpha = 0.38;
        ctx.beginPath(); ctx.arc(w * 0.82, h * 0.2, Math.min(w, h) * 0.045, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        for (let layer = 0; layer < 3; layer++) {
            const baseline = floor - (2 - layer) * 24;
            for (let x = -20; x < w; x += random.Range(26, 64)) {
                const width = random.Range(22, 62), height = random.Range(55, 210) * h / 800 + layer * 12;
                ctx.fillStyle = ['#102832', '#0c202a', '#08171f'][layer]; ctx.fillRect(x, baseline - height, width, height);
                ctx.strokeStyle = '#1e3d46'; ctx.lineWidth = 0.6; ctx.strokeRect(x, baseline - height, width, height);
                for (let wy = baseline - height + 10; wy < baseline - 8; wy += 12) {
                    for (let wx = x + 5; wx < x + width - 4; wx += 9) {
                        if (random.Next() > 0.3) continue;
                        ctx.fillStyle = random.Next() > 0.8 ? '#a0774c' : '#376d75';
                        ctx.fillRect(wx, wy, 3, random.Next() > 0.7 ? 6 : 2);
                    }
                }
                if (layer === 2 && random.Next() > 0.7) {
                    ctx.fillStyle = '#4d9f9f'; ctx.fillRect(x + width * 0.5, baseline - height - 20, 1, 20);
                    ctx.fillStyle = '#df8e4a'; ctx.fillRect(x + width * 0.5 - 2, baseline - height - 22, 4, 3);
                }
            }
        }
        const mist = ctx.createLinearGradient(0, floor - 180, 0, floor + 15);
        mist.addColorStop(0, 'rgba(29,72,77,0)'); mist.addColorStop(0.85, 'rgba(20,58,65,0.52)'); mist.addColorStop(1, '#0a1820');
        ctx.fillStyle = mist; ctx.fillRect(0, floor - 180, w, 200);
        // Receding conduits and rails give the wet platform a physical horizon.
        ctx.strokeStyle = '#193b43'; ctx.lineWidth = 2;
        for (const y of [floor - 36, floor - 12]) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
        for (let x = 0; x < w; x += 82) { ctx.fillStyle = '#23454c'; ctx.fillRect(x, floor - 58, 3, 58); }
        ctx.fillStyle = '#c98c48'; ctx.fillRect(0, floor - 2, w, 2);
    }
    /** @param {import('../data/FoundryTypes.js').PaintContext} ctx */
    Draw(ctx) { ctx.drawImage(this.cache.Canvas, 0, 0); }
    Dispose() { this.cache.Dispose(); }
}
