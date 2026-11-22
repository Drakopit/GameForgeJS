/**
 * Reusable offscreen Canvas surface for reflection/compositing passes. Never
 * enters the DOM, creates a loop or owns the visible Screen. Dispose on exit.
 */
export class CanvasRenderTarget {
    /** @param {number} width @param {number} height */
    constructor(width: number, height: number);
    Canvas: OffscreenCanvas | HTMLCanvasElement;
    /** @type {CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D} */
    Context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    /** @param {number} width @param {number} height */
    Resize(width: number, height: number): void;
    Clear(): void;
    Dispose(): void;
}
