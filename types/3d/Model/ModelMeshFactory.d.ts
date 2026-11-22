/**
 * Converts model asset parts already loaded by `AssetManager` into Render3D meshes.
 */
export class ModelMeshFactory {
    /**
     * Builds a `Model3D` from a queued model asset.
     * @param {string} modelName - AssetManager model key.
     * @param {Object} [options] - Mesh naming and material options.
     * @param {Material|null} [options.material=null] - Shared material override.
     * @param {Function|null} [options.materialFactory=null] - Per-part material factory.
     * @returns {Model3D} Renderable model wrapper.
     */
    static FromAsset(modelName: string, { material, materialFactory, name }?: {
        material?: Material | null;
        materialFactory?: Function | null;
    }): Model3D;
    static CreateMaterial(part: any, index: any, modelName: any): StandardMaterial;
    static CreateTexture(textureInfo: any): Texture;
    static ApplyNodeTransform(mesh: any, node: any): void;
    static QuaternionToEuler(rotation: any): {
        x: number;
        y: number;
        z: number;
    };
}
import { Model3D } from "./Model3D.js";
import { StandardMaterial } from "../Render3D/index.js";
import { Texture } from "../Render3D/index.js";
