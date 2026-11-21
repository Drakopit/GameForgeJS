// @ts-check
/**
 * Reusable offscreen Canvas surface for reflection/compositing passes. Never
 * enters the DOM, creates a loop or owns the visible Screen. Dispose on exit.
 */
export class CanvasRenderTarget {
    /** @param {number} width @param {number} height */
    constructor(width, height) {
        this.Canvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(1, 1) : document.createElement('canvas');
        const context = this.Canvas.getContext('2d');
        if (!context) throw new Error('Canvas 2D context is unavailable.');
        /** @type {CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D} */
        this.Context = /** @type {CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D} */ (context);
        this.Resize(width, height);
    }
    /** @param {number} width @param {number} height */
    Resize(width, height) {
        if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) throw new RangeError('Render target dimensions must be positive integers.');
        if (this.Canvas.width !== width) this.Canvas.width = width;
        if (this.Canvas.height !== height) this.Canvas.height = height;
    }
    Clear() { this.Context.clearRect(0, 0, this.Canvas.width, this.Canvas.height); }
    Dispose() { this.Canvas.width = 0; this.Canvas.height = 0; }
}
