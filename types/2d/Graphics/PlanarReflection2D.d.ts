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
    static Draw(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, source: CanvasImageSource, { width, height, waterY, time, opacity, displacement }: {
        width: number;
        height: number;
        waterY: number;
        time?: number;
        opacity?: number;
        displacement?: (row: number) => number;
    }): void;
}
