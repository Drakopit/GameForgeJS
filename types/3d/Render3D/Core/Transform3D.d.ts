/**
 * Mutable 3D position, Euler rotation and scale used by Render3D meshes.
 *
 * @param {Object} [options] - Initial transform values.
 * @param {number[]} [options.position] - Three-component world position.
 * @param {Object|number[]} [options.rotation] - Euler rotation in radians.
 * @param {number[]} [options.scale] - Three-component scale.
 * @param {boolean} [options.inheritScale=true] - Opt-out: when false, the parent's scale only
 *     spaces this transform's position and never deforms its shape (`Mat4.attachRigid`).
 *     Scene nodes and model meshes use the default full inheritance.
 */
export class Transform3D {
    constructor({ position, rotation, scale, matrix, parent, inheritScale, }?: {
        position?: number[];
        rotation?: {
            x: number;
            y: number;
            z: number;
        };
        scale?: number[];
        matrix?: any;
        parent?: any;
        inheritScale?: boolean;
    });
    position: number[];
    rotation: {
        x: any;
        y: any;
        z: any;
    };
    scale: number[];
    matrix: Float32Array<any>;
    parent: any;
    inheritScale: boolean;
    /**
     * Updates the transform translation.
     * @param {number} x - World x coordinate.
     * @param {number} y - World y coordinate.
     * @param {number} z - World z coordinate.
     * @returns {Transform3D} This transform.
     */
    SetPosition(x: number, y: number, z: number): Transform3D;
    SetRotation(x: any, y: any, z: any): this;
    SetScale(x: any, y?: any, z?: any): this;
    /**
     * Produces a local model matrix.
     * @param {Float32Array} [out] - Optional output matrix.
     * @returns {Float32Array} Model matrix.
     */
    GetMatrix(out?: Float32Array): Float32Array;
}
