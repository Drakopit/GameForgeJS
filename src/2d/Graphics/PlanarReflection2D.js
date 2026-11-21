/**
 * Deterministic Canvas strip reflection of an existing scene above a water line.
 * No canvas, timer or renderer is allocated. Same-target draws read only above water.
 */
export class PlanarReflection2D {
    /**
     * @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} ctx Destination context.
     * @param {CanvasImageSource} source Completed above-water scene.
     * @param {{width:number,height:number,waterY:number,time?:number,opacity?:number,displacement?:(row:number)=>number}} options Logical viewport and optional ripple displacement.
     */
    static Draw(ctx, source, { width, height, waterY, time = 0, opacity = 0.55, displacement = () => 0 }) {
        ctx.save();
        ctx.globalAlpha = opacity;
        for (let row = 0; row < height - waterY; row += 4) {
            const sample = Math.max(0, waterY - row * 1.6 - 4);
            const shift = Math.sin(row * 0.11 + time * 1.9) * 2.5 + Math.sin(row * 0.04 - time) * 2 + displacement(row);
            ctx.drawImage(source, 0, sample, width, 4, shift, waterY + row, width, 4);
        }
        ctx.restore();
    }
}
