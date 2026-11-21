import { Transform3D } from "../Core/Transform3D.js";
import { StandardMaterial } from "../Material/StandardMaterial.js";

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
    constructor({
        name = "Mesh",
        geometry = null,
        material = new StandardMaterial(),
        transform = new Transform3D(),
        castShadow = true,
        receiveShadow = true,
        visible = true,
        frustumCulled = true,
    } = {}) {
        this.name = name;
        this.geometry = geometry;
        this.material = material;
        this.transform = transform;
        this.castShadow = castShadow;
        this.receiveShadow = receiveShadow;
        this.visible = visible;
        this.frustumCulled = frustumCulled;
    }

    /**
     * Creates a mesh from existing geometry and material values.
     * @param {Geometry3D} geometry - Geometry to render.
     * @param {Material} [material] - Surface material.
     * @param {Object} [options={}] - Additional mesh options.
     * @returns {Mesh} Created mesh.
     */
    static FromGeometry(geometry, material = new StandardMaterial(), options = {}) {
        return new Mesh({ ...options, geometry, material });
    }
}
