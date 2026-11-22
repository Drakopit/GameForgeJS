/**
 * Perspective camera holding view and projection matrices for Render3D.
 *
 * @param {Object} [options] - Projection and pose settings.
 * @param {number} [options.fov=60] - Vertical field of view in degrees.
 * @param {number} [options.aspect=1] - Viewport aspect ratio.
 * @param {number[]} [options.position] - Camera world position.
 * @param {number[]} [options.target] - Initial look-at target.
 */
export class PerspectiveCamera {
    constructor({ fov, aspect, near, far, position, target, up, }?: {
        fov?: number;
        aspect?: number;
        near?: number;
        far?: number;
        position?: number[];
        target?: number[];
        up?: number[];
    });
    isCamera3D: boolean;
    fov: number;
    aspect: number;
    near: number;
    far: number;
    position: number[];
    target: number[];
    up: number[];
    viewMatrix: Float32Array<ArrayBuffer>;
    projectionMatrix: Float32Array<ArrayBuffer>;
    /**
     * Sets world position and rebuilds the view matrix.
     * @param {number} x - World x coordinate.
     * @param {number} y - World y coordinate.
     * @param {number} z - World z coordinate.
     * @returns {PerspectiveCamera} This camera.
     */
    SetPosition(x: number, y: number, z: number): PerspectiveCamera;
    /**
     * Aims the camera at a world-space point.
     * @param {number[]} target - Three-component world position.
     * @returns {PerspectiveCamera} This camera.
     */
    LookAt(target: number[]): PerspectiveCamera;
    UpdateProjection(aspect?: number): this;
    UpdateView(): this;
    /**
     * Project a semantic world vector into logical HUD coordinates for labels or picking.
     * @param {{x:number,y:number,z:number}} point World position.
     * @param {number} width Logical Screen width.
     * @param {number} height Logical Screen height.
     * @returns {{x:number,y:number,depth:number,visible:boolean}} Screen point and clip visibility.
     */
    Project(point: {
        x: number;
        y: number;
        z: number;
    }, width: number, height: number): {
        x: number;
        y: number;
        depth: number;
        visible: boolean;
    };
}
