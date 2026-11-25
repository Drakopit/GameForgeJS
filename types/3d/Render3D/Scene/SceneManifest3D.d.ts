/**
 * Creates Render3D scenes from scene documents and JSON-compatible manifests: the one scene
 * pipeline shared by games and the GameForgeJS Editor's 3D view.
 *
 * A 3D `gameforgejs.scene` document is converted with `SceneDocument.ToManifest3D()` first
 * (prefabs resolved). Objects may be primitives (`primitive`), several parts (`parts`) or a
 * resources.json model (`model`); materials may name resources.json images (`albedoMap`,
 * `normalMap`, ...) and `.gfshader` assets (`{ type: "shader", shader }`).
 *
 * Assets come from a resolver, `{ image(name), texture(name, options), shader(name), model(name) }`
 * (each returns null / false while missing). The default reads the shared AssetManager, where a
 * game's resources.json is loaded; the editor passes one that reads project files and sets
 * `lenient: true` (placeholders while something loads, instead of errors).
 *
 * @example
 * const { scene, camera } = SceneManifest3D.Create(context.assets.jsons.level_1, {
 *     aspect: canvas.width / canvas.height,
 * });
 */
export class SceneManifest3D {
    /**
     * Builds a scene, camera, skybox and the manifest's lights and objects.
     * @param {Object} [manifest={}] - Scene manifest or 3D scene document.
     * @param {Object} [options] - Creation context.
     * @param {number} [options.aspect=1] - Camera aspect ratio.
     * @param {Object} [options.assets] - Asset resolver or AssetManager (default: the shared AssetManager).
     * @returns {Object} `scene`, `camera`, `skybox`, `lights`, `objects` and `nodes` (see `Populate`).
     */
    static Create(manifest?: any, { aspect, assets }?: {
        aspect?: number;
        assets?: any;
    }): any;
    /**
     * Returns a SceneManifest3D document: scene documents are converted, manifests pass through.
     * @param {Object} manifest - SceneManifest3D or 3D gameforgejs.scene document.
     * @returns {Object}
     */
    static Normalize(manifest?: any): any;
    /**
     * The asset resolver for `assets`: a resolver passes through; an AssetManager (or nothing,
     * meaning the shared one) is wrapped. Textures are cached per image and options.
     * @param {Object|null} [assets]
     * @returns {{image: Function, texture: Function, shader: Function, model: Function, lenient?: boolean}}
     */
    static Assets(assets?: any | null): {
        image: Function;
        texture: Function;
        shader: Function;
        model: Function;
        lenient?: boolean;
    };
    /**
     * Creates a perspective camera from a manifest definition.
     * @param {Object} [definition={}] - Camera values.
     * @param {number} [aspect=1] - Current viewport aspect ratio.
     * @returns {PerspectiveCamera} Created camera.
     */
    static CreateCamera(definition?: any, aspect?: number): PerspectiveCamera;
    /**
     * A skybox from a resources.json image (`settings.skybox`), or null while it is missing.
     * @param {string} name - Image name.
     * @param {Object} [assets] - Asset resolver or AssetManager.
     * @returns {Skybox|null}
     */
    static CreateSkybox(name: string, assets?: any): Skybox | null;
    /**
     * Adds declared lights and objects to an existing scene.
     *
     * With `manifest.transforms` (every node: id, parent, local transform) objects and point/spot
     * lights with a `parent` follow the node hierarchy; objects without one keep their own transform.
     * @param {Scene3D} scene - Target scene.
     * @param {Object} [manifest={}] - Scene manifest definition.
     * @param {Object} [options]
     * @param {Object} [options.assets] - Asset resolver or AssetManager.
     * @returns {{lights: Light[], objects: (Mesh|null)[], nodes: Map<string, Object>}} `objects[i]`
     *   is the first mesh of `manifest.objects[i]`; `nodes` maps each object id to
     *   `{ root, meshes, materials, model, pending }` (see `BuildObject`).
     */
    static Populate(scene: Scene3D, manifest?: any, { assets }?: {
        assets?: any;
    }): {
        lights: Light[];
        objects: (Mesh | null)[];
        nodes: Map<string, any>;
    };
    /**
     * Creates one supported light definition.
     * @param {Object} [definition={}] - Manifest light, selected by `type`.
     * @returns {Light} Render3D light.
     */
    static CreateLight(definition?: any): Light;
    /**
     * Builds the renderable of one object: its transform and meshes.
     *
     * - `model`: a resources.json model with its own materials (a Material with explicit colours
     *   or maps replaces them; `{ type: "toon" }` converts them);
     * - `parts`: `[{ primitive, transform, material, castShadow }]` under the object's transform;
     * - otherwise `primitive` (a cube when nothing is declared; nothing for group nodes, i.e.
     *   a `nodeType` without a primitive).
     * @param {Object} [definition={}] - Manifest object.
     * @param {Object} [options]
     * @param {Object} [options.assets] - Asset resolver or AssetManager.
     * @param {Transform3D} [options.root] - Use this transform (e.g. from the node hierarchy).
     * @returns {{root: Transform3D, meshes: Mesh[], materials: Object[], model: Object|null, pending: boolean}}
     *   `pending` is true while a model is not loaded yet (lenient resolvers only).
     */
    static BuildObject(definition?: any, { assets, root }?: {
        assets?: any;
        root?: Transform3D;
    }): {
        root: Transform3D;
        meshes: Mesh[];
        materials: any[];
        model: any | null;
        pending: boolean;
    };
    /**
     * Creates one primitive mesh with its declared transform (`BuildObject` for a single mesh).
     * @param {Object} [definition={}] - Manifest object definition.
     * @param {Object} [assets] - Asset resolver or AssetManager.
     * @returns {Mesh} Scene mesh.
     */
    static CreateObject(definition?: any, assets?: any): Mesh;
    /**
     * Creates cube, beveled cube, plane, sphere or ring geometry.
     * @param {Object} [definition={}] - Primitive definition.
     * @returns {Geometry3D} Generated geometry.
     */
    static CreateGeometry(definition?: any): Geometry3D;
    /**
     * Creates a material from JSON-compatible scene values: standard (default), `toon`, `unlit`,
     * `surface` (preset), `celestial` or `shader` (a `.gfshader` asset with per-object
     * `properties`). Texture slots and texture properties may name resources.json images
     * (`anisotropy` applies to them).
     * @param {Object} [definition={}] - Material definition.
     * @param {Object} [assets] - Asset resolver or AssetManager.
     * @returns {Material} Created material.
     */
    static CreateMaterial(definition?: any, assets?: any): Material;
    /**
     * `{ type: "shader", shader: "<.gfshader name in resources.json>", properties: { … } }`.
     * Texture properties naming an image use that image. A lenient resolver (the editor) gets a
     * neutral placeholder while the shader loads or fails to compile; games get the error.
     * @param {Object} definition - Material definition.
     * @param {Object} [assets] - Asset resolver or AssetManager.
     * @returns {Material}
     */
    static CreateShaderMaterial(definition: any, assets?: any): Material;
}
import { PerspectiveCamera } from "../Camera/PerspectiveCamera.js";
import { Skybox } from "../Skybox/Skybox.js";
import { Scene3D } from "./Scene3D.js";
import { Mesh } from "../Mesh/Mesh.js";
import { Transform3D } from "../Core/Transform3D.js";
