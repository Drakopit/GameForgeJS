/**
 * Sphere collision volume typically paired with a moving player body.
 *
 * @param {Object} [options] - Collider settings.
 * @param {number} [options.radius=0.5] - Sphere radius.
 * @param {number[]} [options.offset] - Local center offset.
 */
export class SphereCollider3D extends Collider3D {
    constructor({ radius, offset, isTrigger }?: {
        radius?: number;
        offset?: number[];
        isTrigger?: boolean;
    });
    radius: number;
}
import { Collider3D } from "./Collider3D.js";
