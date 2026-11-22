/**
 * Aspect-preserving world layout and coordinate conversion, independent of DOM/renderers.
 * @param {number} width Positive authored world width.
 * @param {number} height Positive authored world height.
 */
export class ResponsiveLayout {
    constructor(width: any, height: any);
    width: any;
    height: any;
    /**
     * Center the authored rectangle above an optional control strip.
     * @param {number} width Available logical Screen width.
     * @param {number} height Available logical Screen height.
     * @param {{reserveBottom?: number}} [options] Bottom area excluded from the world.
     * @returns {{scale:number,x:number,y:number,width:number,height:number}} Fitted rectangle.
     */
    Fit(width: number, height: number, { reserveBottom }?: {
        reserveBottom?: number;
    }): {
        scale: number;
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /**
     * Convert a logical Screen point into authored world coordinates.
     * @param {{x:number,y:number}} point Logical Screen position, after Touch.ToScreen.
     * @param {{x:number,y:number,scale:number}} view Result of Fit.
     * @returns {Vector2D} World position; points in letterboxing remain outside the world.
     */
    ToWorld(point: {
        x: number;
        y: number;
    }, view: {
        x: number;
        y: number;
        scale: number;
    }): Vector2D;
    /**
     * Convert an authored world point into logical Screen coordinates.
     * @param {{x:number,y:number}} point Authored world position.
     * @param {{x:number,y:number,scale:number}} view Result of Fit.
     * @returns {Vector2D} Logical Screen position.
     */
    ToScreen(point: {
        x: number;
        y: number;
    }, view: {
        x: number;
        y: number;
        scale: number;
    }): Vector2D;
}
import { Vector2D } from '../Math/Vector2D.js';
