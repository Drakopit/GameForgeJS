/**
 * Group of Render3D meshes sharing a convenient model-level transform.
 *
 * @param {Mesh[]} [meshes=[]] - Mesh parts belonging to the loaded model.
 */
export class Model3D {
    constructor(meshes?: any[]);
    meshes: any[];
    transform: Transform3D;
    /**
     * Adds all model parts to a scene and applies its current transform.
     * @param {Scene3D} scene - Target scene.
     * @returns {Model3D} This model.
     */
    AddTo(scene: Scene3D): Model3D;
    SetPosition(x: any, y: any, z: any): this;
    SetRotation(x: any, y: any, z: any): this;
    SetScale(x: any, y?: any, z?: any): this;
    ApplyTransform(): void;
}
import { Transform3D } from "../Render3D/index.js";
