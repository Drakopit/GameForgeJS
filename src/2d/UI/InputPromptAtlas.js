import { CanvasRenderTarget } from '../Graphics/CanvasRenderTarget.js';
/** Rasterizes descriptor art once and blits cached native Canvas sprites thereafter. */
export class InputPromptAtlas {
    constructor(assets = null) { this.assets = assets; this.tiles = new Map(); }
    Draw(ctx, descriptor, x, y, size = 32) {
        if (descriptor.image) {
            const image = this.assets?.images?.[descriptor.image], rect = descriptor.source;
            if (image && rect) {
                ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height, x, y, size, size);
                return;
            }
        }
        const key = JSON.stringify(descriptor);
        if (!this.tiles.has(key))
            this.tiles.set(key, this.Create(descriptor));
        ctx.drawImage(this.tiles.get(key).Canvas, x, y, size, size);
    }
    Create(glyph) {
        const target = new CanvasRenderTarget(80, 80), ctx = target.Context;
        ctx.strokeStyle = glyph.color ?? '#edf3f7';
        ctx.fillStyle = '#24374b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        if (glyph.shape === 'key')
            ctx.roundRect(5, 8, 70, 64, 10);
        else
            ctx.arc(40, 40, 33, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = glyph.color ?? '#edf3f7';
        const paths = { cross: [[26, 26, 54, 54], [54, 26, 26, 54]], square: [[26, 26, 54, 26], [54, 26, 54, 54], [54, 54, 26, 54], [26, 54, 26, 26]], triangle: [[40, 22, 59, 56], [59, 56, 21, 56], [21, 56, 40, 22]] };
        if (glyph.symbol === 'space') {
            ctx.beginPath();
            ctx.moveTo(21, 35);
            ctx.lineTo(21, 49);
            ctx.lineTo(59, 49);
            ctx.lineTo(59, 35);
            ctx.stroke();
        }
        else if (glyph.symbol === 'circle') {
            ctx.beginPath();
            ctx.arc(40, 40, 18, 0, Math.PI * 2);
            ctx.stroke();
        }
        else if (paths[glyph.symbol])
            for (const [x, y, endX, endY] of paths[glyph.symbol]) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }
        else {
            ctx.fillStyle = glyph.color ?? '#edf3f7';
            ctx.font = `bold ${String(glyph.label).length > 3 ? 18 : String(glyph.label).length > 1 ? 30 : 42}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(glyph.label ?? '?', 40, glyph.shape === 'stick' ? 36 : 53);
        }
        if (glyph.arrow) {
            ctx.font = '23px Arial';
            ctx.fillStyle = '#effaff';
            ctx.textAlign = 'center';
            ctx.fillText(glyph.arrow, 40, 61);
        }
        return target;
    }
    Dispose() { for (const tile of this.tiles.values())
        tile.Dispose(); this.tiles.clear(); }
}
