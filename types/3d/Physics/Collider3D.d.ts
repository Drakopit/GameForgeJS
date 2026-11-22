/**
 * Base collision volume offset from a Render3D object's transform.
 *
 * @param {Object} [options] - Collider settings.
 * @param {string} [options.type="collider"] - Collision shape category.
 * @param {number[]} [options.offset] - Local center offset.
 * @param {boolean} [options.isTrigger=false] - Trigger-only marker for games.
 */
export class Collider3D {
    constructor({ type, offset, isTrigger }?: {
        type?: string;
        offset?: number[];
        isTrigger?: boolean;
    });
    type: string;
    offset: number[];
    isTrigger: boolean;
    /**
     * Computes the collision center in world coordinates.
     * @param {Transform3D} transform - Object transform.
     * @returns {number[]} World center position.
     */
    GetCenter(transform: Transform3D): number[];
}
