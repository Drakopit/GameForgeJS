/**
 * General scalar and angle interpolation helpers.
 */
export class MathExt {
    static Distance(p1: any, p2: any): any;
    static DistanceVector(p1: any, p2: any): Vector2D;
    static Module(value: any): any;
    /**
     * @doc Method
     * @description Linearly interpolates between two values.
     * @param {number} a - Starting value.
     * @param {number} b - Target value.
     * @param {number} t - Interpolation factor, clamped to the 0..1 range.
     * @returns {number}
     */
    static Lerp(a: number, b: number, t: number): number;
    /**
     * Interpolates radians along the shortest arc, clamping t to 0..1.
     * The result stays continuous around a and may lie outside -PI..PI.
     * @param {number} a - Starting angle in radians.
     * @param {number} b - Target angle in radians.
     * @param {number} t - Interpolation factor.
     * @returns {number} Interpolated angle in radians.
     */
    static LerpAngle(a: number, b: number, t: number): number;
    /**
     * @doc Method
     * @description Interpolates and snaps to b when the remaining difference is below threshold.
     *              Avoids an indefinitely small remaining difference at the end of an animation.
     * @param {number} a
     * @param {number} b
     * @param {number} t
     * @param {number} threshold
     * @returns {number}
     */
    static LerpSnap(a: number, b: number, t: number, threshold?: number): number;
}
import { Vector2D } from "./Vector2D.js";
