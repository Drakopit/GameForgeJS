import { Vector2D } from '../Math/Vector2D.js';
/**
 * Aspect-preserving world layout and coordinate conversion, independent of DOM/renderers.
 * @param {number} width Positive authored world width.
 * @param {number} height Positive authored world height.
 */
export class ResponsiveLayout {
    constructor(width, height) {
        if (![width, height].every(value => Number.isFinite(value) && value > 0))
            throw new RangeError('Design dimensions must be positive.');
        this.width = width;
        this.height = height;
    }
    /**
     * Center the authored rectangle above an optional control strip.
     * @param {number} width Available logical Screen width.
     * @param {number} height Available logical Screen height.
     * @param {{reserveBottom?: number}} [options] Bottom area excluded from the world.
     * @returns {{scale:number,x:number,y:number,width:number,height:number}} Fitted rectangle.
     */
    Fit(width, height, { reserveBottom = 0 } = {}) {
        if (![width, height].every(value => Number.isFinite(value) && value > 0) || !Number.isFinite(reserveBottom) || reserveBottom < 0 || reserveBottom >= height) {
            throw new RangeError('Invalid viewport dimensions or reserved area.');
        }
        const scale = Math.min(width / this.width, (height - reserveBottom) / this.height);
        return { scale, x: (width - this.width * scale) / 2, y: (height - reserveBottom - this.height * scale) / 2, width: this.width * scale, height: this.height * scale };
    }
    /**
     * Convert a logical Screen point into authored world coordinates.
     * @param {{x:number,y:number}} point Logical Screen position, after Touch.ToScreen.
     * @param {{x:number,y:number,scale:number}} view Result of Fit.
     * @returns {Vector2D} World position; points in letterboxing remain outside the world.
     */
    ToWorld(point, view) { return new Vector2D((point.x - view.x) / view.scale, (point.y - view.y) / view.scale); }
    /**
     * Convert an authored world point into logical Screen coordinates.
     * @param {{x:number,y:number}} point Authored world position.
     * @param {{x:number,y:number,scale:number}} view Result of Fit.
     * @returns {Vector2D} Logical Screen position.
     */
    ToScreen(point, view) { return new Vector2D(view.x + point.x * view.scale, view.y + point.y * view.scale); }
}
