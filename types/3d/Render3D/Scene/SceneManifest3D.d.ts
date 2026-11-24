/**
 * Creates simple Render3D scenes from JSON-compatible game manifests.
 *
 * A game or an authoring tool owns the manifest data; this factory converts
 * its camera, lights, primitives and basic materials into runtime objects.
 * A 3D `gameforgejs.scene` document is accepted too: it is converted with
 * `SceneDocument.ToManifest3D()` first (prefabs resolved).
 *
 * @example
 * const { scene, camera } = SceneManifest3D.Create(levelManifest, {
 *     aspect: canvas.width / canvas.height,
 * });
 */
export class SceneManifest3D {
    /**
     * Builds a scene, camera and manifest-owned content collection.
     * @param {Object} [manifest={}] - Scene manifest definition.
     * @param {Object} [options] - Creation context.
     * @param {number} [options.aspect=1] - Camera aspect ratio.
     * @returns {Object} Object containing `scene`, `camera`, `lights` and `objects`.
     */
    static Create(manifest?: any, { aspect }?: {
        aspect?: number;
    }): any;
    /**
     * Returns a SceneManifest3D document: scene documents are converted, manifests pass through.
     * @param {Object} manifest - SceneManifest3D or 3D gameforgejs.scene document.
     * @returns {Object}
     */
    static Normalize(manifest?: any): any;
    /**
     * Creates a perspective camera from a manifest definition.
     * @param {Object} [definition={}] - Camera values.
     * @param {number} [aspect=1] - Current viewport aspect ratio.
     * @returns {PerspectiveCamera} Created camera.
     */
    static CreateCamera(definition?: any, aspect?: number): PerspectiveCamera;
    /**
     * Adds declared lights and primitive objects to an existing scene.
     * @param {Scene3D} scene - Target scene.
     * @param {Object} [manifest={}] - Scene manifest definition.
     * @returns {Object} Added `lights` and `objects`.
     */
    static Populate(scene: Scene3D, manifest?: any): any;
    /**
     * Creates one supported light definition.
     * @param {Object} [definition={}] - Manifest light, selected by `type`.
     * @returns {Light} Render3D light.
     */
    static CreateLight(definition?: any): Light;
    /**
     * Creates a primitive mesh and applies its declared transform.
     * @param {Object} [definition={}] - Manifest object definition.
     * @returns {Mesh} Scene mesh.
     */
    static CreateObject(definition?: any): Mesh;
    /**
     * Creates cube, beveled cube, plane, sphere or ring geometry.
     * @param {Object} [definition={}] - Primitive definition.
     * @returns {Geometry3D} Generated geometry.
     */
    static CreateGeometry(definition?: any): Geometry3D;
    /**
     * Creates a material from JSON-compatible scene values.
     * @param {Object} [definition={}] - Material definition.
     * @returns {Material} Created material.
     */
    static CreateMaterial(definition?: any): Material;
}
import { PerspectiveCamera } from "../Camera/PerspectiveCamera.js";
import { Scene3D } from "./Scene3D.js";
import { Mesh } from "../Mesh/Mesh.js";
