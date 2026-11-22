/**
 * Renderable geometry instance with a material, transform and shadow flags.
 *
 * @param {Object} [options] - Mesh definition.
 * @param {string} [options.name="Mesh"] - Debug/display name.
 * @param {Geometry3D|null} [options.geometry=null] - Geometry buffers.
 * @param {Material} [options.material] - Surface material.
 * @param {Transform3D} [options.transform] - World transform.
 * @param {boolean} [options.frustumCulled=true] - Reject meshes outside camera planes; disable for custom displaced geometry.
 */
export class Mesh {
    /**
     * Creates a mesh from existing geometry and material values.
     * @param {Geometry3D} geometry - Geometry to render.
     * @param {Material} [material] - Surface material.
     * @param {Object} [options={}] - Additional mesh options.
     * @returns {Mesh} Created mesh.
     */
    static FromGeometry(geometry: Geometry3D, material?: Material, options?: any): Mesh;
    constructor({ name, geometry, material, transform, castShadow, receiveShadow, visible, frustumCulled, }?: {
        name?: string;
        geometry?: any;
        material?: StandardMaterial;
        transform?: Transform3D;
        castShadow?: boolean;
        receiveShadow?: boolean;
        visible?: boolean;
        frustumCulled?: boolean;
    });
    name: string;
    geometry: any;
    material: StandardMaterial;
    transform: Transform3D;
    castShadow: boolean;
    receiveShadow: boolean;
    visible: boolean;
    frustumCulled: boolean;
}
import { StandardMaterial } from "../Material/StandardMaterial.js";
import { Transform3D } from "../Core/Transform3D.js";
