/**
 * Axis-aligned box collision volume for platforms and solid scenery.
 *
 * @param {Object} [options] - Collider settings.
 * @param {number[]} [options.size] - Width, height and depth.
 * @param {number[]} [options.offset] - Local center offset.
 */
export class BoxCollider3D extends Collider3D {
    constructor({ size, offset, isTrigger }?: {
        size?: number[];
        offset?: number[];
        isTrigger?: boolean;
    });
    size: number[];
    /**
     * Computes axis-aligned minimum and maximum world corners.
     * @param {Transform3D} transform - Object transform.
     * @returns {Object} Bounds containing `min` and `max` arrays.
     */
    GetBounds(transform: Transform3D): any;
}
import { Collider3D } from "./Collider3D.js";
