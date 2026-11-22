/** @deprecated Use `PerspectiveCamera` from `gameforgejs/3d`. */
export class Camera3D {
    constructor(screen: any);
    screen: any;
    position: number[];
    target: number[];
    up: number[];
    viewMatrix: Float32Array<ArrayBuffer>;
    projectionMatrix: Float32Array<ArrayBuffer>;
    CalculateProjection(): void;
    /**
     * Updates the view matrix for the current frame.
     */
    Update(): void;
    /**
     * Follows the target object's position.
     * @param {GameObject3D} targetObject
     */
    Follow(targetObject: GameObject3D): void;
}
