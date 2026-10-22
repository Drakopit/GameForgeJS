/**
 * @doc Class MathExt
 * @namespace Math
 * @class MathExt
 * @author Patrick Faustino Camello
 * @summary That class was made, to compose the GameForgeJS framework.
 * @Date 15/05/2019
 * @example
 *  This is a static class, you can just use his functions 
 * @returns void
 */

import { Vector2D } from "./Vector2D.js";

/**
 * General scalar and 2D interpolation helpers shared by demos.
 */
export class MathExt {
    constructor() {}

    static Distance(p1, p2) {
        let distX = p1.position.GetValue().x - p2.position.GetValue().x
        let distY = p1.position.GetValue().y - p2.position.GetValue().y;
        return this.Module(distX + distY);
    }

    static DistanceVector(p1, p2) {
        let distX = (p1.position.GetValue().x - p2.position.GetValue().x);
        let distY = (p1.position.GetValue().y - p2.position.GetValue().y);
        return new Vector2D(this.Module(distX), this.Module(distY));
    }

    static Module(value) {
        return (value < 0) ? value * -1 : value;
    }

    /**
     * @doc Method
     * @description Linearly interpolates between two values.
     * @param {number} a - Starting value.
     * @param {number} b - Target value.
     * @param {number} t - Interpolation factor, clamped to the 0..1 range.
     * @returns {number}
     */
    static Lerp(a, b, t) {
        return a + (b - a) * Math.min(Math.max(t, 0), 1);
    }

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
    static LerpSnap(a, b, t, threshold = 0.5) {
        const result = this.Lerp(a, b, t);
        return Math.abs(result - b) < threshold ? b : result;
    }
}
