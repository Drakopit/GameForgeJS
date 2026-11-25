import { ToonMaterial } from "../Material/ToonMaterial.js";
import { CelestialBodyMaterial } from "../Material/CelestialBodyMaterial.js";
import { Transform3D } from "../Core/Transform3D.js";
import { SurfaceMaterial } from '../Material/SurfaceMaterial.js';
import { PerspectiveCamera } from "../Camera/PerspectiveCamera.js";
import { AmbientLight } from "../Light/AmbientLight.js";
import { DirectionalLight } from "../Light/DirectionalLight.js";
import { HemisphereLight } from "../Light/HemisphereLight.js";
import { PointLight } from "../Light/PointLight.js";
import { SpotLight } from "../Light/SpotLight.js";
import { StandardMaterial } from "../Material/StandardMaterial.js";
import { UnlitMaterial } from "../Material/UnlitMaterial.js";
import { ShaderMaterial } from "../Material/ShaderMaterial.js";
import { ShaderAsset } from "../Shader/ShaderAsset.js";
import { Mesh } from "../Mesh/Mesh.js";
import { PrimitiveMesh } from "../Mesh/PrimitiveMesh.js";
import { Texture } from "../Texture/Texture.js";
import { Skybox } from "../Skybox/Skybox.js";
import { Scene3D } from "./Scene3D.js";
import { ModelMeshFactory } from "../../Model/ModelMeshFactory.js";
import { SceneDocument } from "../../../core/Scene/SceneDocument.js";
import { AssetManager } from "../../../core/Assets/AssetManager.js";

/** Texture slots a material definition may name by resources.json image name. */
const TEXTURE_SLOTS = ["albedoMap", "normalMap", "roughnessMap", "aoMap", "ormMap", "heightMap", "emissiveMap"];

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
    static Create(manifest = {}, { aspect = 1, assets = null } = {}) {
        manifest = this.Normalize(manifest);
        const resolver = this.Assets(assets);
        const backgroundColor = manifest.backgroundColor ?? [0.03, 0.04, 0.07, 1];
        const scene = new Scene3D({
            backgroundColor,
            // { color, near, far } from the scene's settings.fog; without a color it fades to the background.
            fog: manifest.fog ? { color: backgroundColor.slice(0, 3), ...manifest.fog } : null,
            planarReflection: manifest.planarReflection ?? null,
        });
        const camera = this.CreateCamera(manifest.camera, aspect);
        scene.Add(camera);
        const skybox = manifest.skybox ? this.CreateSkybox(manifest.skybox, resolver) : null;
        if (skybox) scene.Add(skybox);
        const content = this.Populate(scene, manifest, { assets: resolver });
        return { scene, camera, skybox, ...content };
    }

    /**
     * Returns a SceneManifest3D document: scene documents are converted, manifests pass through.
     * @param {Object} manifest - SceneManifest3D or 3D gameforgejs.scene document.
     * @returns {Object}
     */
    static Normalize(manifest = {}) {
        return SceneDocument.IsScene(manifest) && manifest.dimension === "3d" ? new SceneDocument(manifest).ToManifest3D() : manifest;
    }

    /**
     * The asset resolver for `assets`: a resolver passes through; an AssetManager (or nothing,
     * meaning the shared one) is wrapped. Textures are cached per image and options.
     * @param {Object|null} [assets]
     * @returns {{image: Function, texture: Function, shader: Function, model: Function, lenient?: boolean}}
     */
    static Assets(assets = null) {
        if (assets && typeof assets.texture === "function") return assets;
        const manager = () => assets ?? AssetManager.instance;
        const cache = new Map();
        return {
            image: name => (name && manager()?.HasImage?.(name) ? manager().GetImage(name) : null),
            texture(name, options = {}) {
                const image = this.image(name);
                if (!image) return null;
                const key = `${name}|${JSON.stringify(options)}`;
                if (cache.get(key)?.image !== image) cache.set(key, { image, texture: Texture.FromImage(image, options) });
                return cache.get(key).texture;
            },
            shader: name => manager()?.GetShader?.(name) ?? manager()?.shaders?.[name] ?? null,
            model: name => Boolean(name && manager()?.models?.[name]),
        };
    }

    /**
     * Creates a perspective camera from a manifest definition.
     * @param {Object} [definition={}] - Camera values.
     * @param {number} [aspect=1] - Current viewport aspect ratio.
     * @returns {PerspectiveCamera} Created camera.
     */
    static CreateCamera(definition = {}, aspect = 1) {
        return new PerspectiveCamera({
            ...definition,
            aspect,
            position: definition.position ?? [7, 5, 9],
            target: definition.target ?? [0, 0, 0],
        });
    }

    /**
     * A skybox from a resources.json image (`settings.skybox`), or null while it is missing.
     * @param {string} name - Image name.
     * @param {Object} [assets] - Asset resolver or AssetManager.
     * @returns {Skybox|null}
     */
    static CreateSkybox(name, assets = null) {
        const image = this.Assets(assets).image(name);
        return image ? Skybox.FromImage(image, { name }) : null;
    }

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
    static Populate(scene, manifest = {}, { assets = null } = {}) {
        manifest = this.Normalize(manifest);
        const resolver = this.Assets(assets);
        const definitions = manifest.transforms ?? [];
        // Scene nodes inherit their parent's full transform, scale included (SceneDocument.WorldMatrix).
        const transforms = new Map(definitions.map(node => [node.id, new Transform3D(node.transform)]));
        for (const node of definitions) transforms.get(node.id).parent = transforms.get(node.parent) ?? null;
        const lights = (manifest.lights ?? []).map(definition => {
            const parent = transforms.get(definition.parent);
            const placed = parent && Array.isArray(definition.position)
                ? { ...definition, position: SceneDocument.TransformPoint(parent.GetMatrix(), definition.position) }
                : definition;
            const light = this.CreateLight(placed);
            scene.Add(light);
            return light;
        });
        const nodes = new Map();
        const objects = (manifest.objects ?? []).map(definition => {
            const node = this.BuildObject(definition, { assets: resolver, root: transforms.get(definition.id) ?? null });
            if (definition.id !== undefined) nodes.set(definition.id, node);
            for (const mesh of node.meshes) scene.Add(mesh);
            return node.meshes[0] ?? null;
        });
        return { lights, objects, nodes };
    }

    /**
     * Creates one supported light definition.
     * @param {Object} [definition={}] - Manifest light, selected by `type`.
     * @returns {Light} Render3D light.
     */
    static CreateLight(definition = {}) {
        switch (definition.type) {
            case "ambient":
                return new AmbientLight(definition);
            case "hemisphere":
                return new HemisphereLight(definition);
            case "point":
                return new PointLight(definition);
            case "spot":
                return new SpotLight(definition);
            case "directional":
            default:
                return new DirectionalLight(definition);
        }
    }

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
    static BuildObject(definition = {}, { assets = null, root = null } = {}) {
        const resolver = this.Assets(assets);
        if (!root) {
            const transform = definition.transform ?? {};
            root = new Transform3D();
            root.SetPosition(...(transform.position ?? [0, 0, 0]))
                .SetRotation(...(transform.rotation ?? [0, 0, 0]))
                .SetScale(...(transform.scale ?? [1, 1, 1]));
            if (transform.matrix) root.matrix = new Float32Array(transform.matrix);
        }
        const shading = {
            castShadow: definition.castShadow !== false,
            receiveShadow: definition.receiveShadow !== false,
            visible: definition.visible !== false,
        };
        const result = { root, meshes: [], materials: [], model: null, pending: false };
        const add = (mesh, transform = root) => {
            mesh.transform = transform;
            if (Number.isInteger(definition.subdivision) && definition.subdivision > 0) mesh.subdivision = definition.subdivision;
            result.meshes.push(mesh);
            result.materials.push(mesh.material);
        };

        if (definition.model) {
            if (!resolver.model(definition.model)) {
                if (!resolver.lenient) throw new Error(`SceneManifest3D: model "${definition.model}" is not loaded (list it in resources.json).`);
                result.pending = true;
                return result;
            }
            const material = definition.material ?? {};
            const replaces = ["albedoColor", "albedoMap", "color"].some(key => material[key] !== undefined);
            const options = { name: definition.name ?? definition.model };
            if (replaces) options.material = this.CreateMaterial(material, resolver);
            else if (material.type === "toon") options.materialFactory = (part, index) => new ToonMaterial(ModelMeshFactory.CreateMaterial(part, index, definition.model));
            const model = ModelMeshFactory.FromAsset(definition.model, options);
            model.transform.parent = root;
            for (const mesh of model.meshes) {
                Object.assign(mesh, shading);
                result.meshes.push(mesh);
                result.materials.push(mesh.material);
            }
            result.model = model;
            return result;
        }

        if (Array.isArray(definition.parts) && definition.parts.length) {
            for (const part of definition.parts) {
                const local = part.transform ?? {};
                const mesh = Mesh.FromGeometry(
                    this.CreateGeometry(part.primitive ?? { type: "cube" }),
                    this.CreateMaterial(part.material ?? definition.material, resolver),
                    { name: `${definition.name ?? "Object"} part`, ...shading, castShadow: part.castShadow ?? shading.castShadow },
                );
                add(mesh, new Transform3D({ position: local.position, rotation: local.rotation, scale: local.scale, parent: root }));
            }
            return result;
        }

        if (definition.primitive || !definition.nodeType) {
            add(Mesh.FromGeometry(
                this.CreateGeometry(definition.primitive),
                this.CreateMaterial(definition.material, resolver),
                { name: definition.name ?? "SceneObject", ...shading },
            ));
        }
        return result;
    }

    /**
     * Creates one primitive mesh with its declared transform (`BuildObject` for a single mesh).
     * @param {Object} [definition={}] - Manifest object definition.
     * @param {Object} [assets] - Asset resolver or AssetManager.
     * @returns {Mesh} Scene mesh.
     */
    static CreateObject(definition = {}, assets = null) {
        const { model, parts, nodeType, ...rest } = definition;
        return this.BuildObject(rest, { assets }).meshes[0];
    }

    /**
     * Creates cube, beveled cube, plane, sphere or ring geometry.
     * @param {Object} [definition={}] - Primitive definition.
     * @returns {Geometry3D} Generated geometry.
     */
    static CreateGeometry(definition = {}) {
        definition ??= {};
        switch (definition.type) {
            case "plane":
                return PrimitiveMesh.Plane(
                    definition.width ?? 10,
                    definition.depth ?? 10,
                    { subdivisions: definition.subdivisions ?? 1 },
                );
            case "sphere":
                return PrimitiveMesh.Sphere(definition.radius ?? 0.5, {
                    widthSegments: definition.widthSegments ?? 24,
                    heightSegments: definition.heightSegments ?? 12,
                });
            case "ring":
                return PrimitiveMesh.Ring(
                    definition.innerRadius ?? 0.75,
                    definition.outerRadius ?? 1,
                    { segments: definition.segments ?? 48 },
                );
            case "beveledCube":
                return PrimitiveMesh.BeveledCube(definition.bevel ?? 0.08);
            case "cube":
            default:
                return PrimitiveMesh.Cube(definition.size ?? 1);
        }
    }

    /**
     * Creates a material from JSON-compatible scene values: standard (default), `toon`, `unlit`,
     * `surface` (preset), `celestial` or `shader` (a `.gfshader` asset with per-object
     * `properties`). Texture slots and texture properties may name resources.json images
     * (`anisotropy` applies to them).
     * @param {Object} [definition={}] - Material definition.
     * @param {Object} [assets] - Asset resolver or AssetManager.
     * @returns {Material} Created material.
     */
    static CreateMaterial(definition = {}, assets = null) {
        definition ??= {};
        const resolver = this.Assets(assets);
        if (definition.type === "shader") return this.CreateShaderMaterial(definition, resolver);
        const textureOptions = definition.anisotropy ? { anisotropy: definition.anisotropy } : {};
        const { type, anisotropy, ...values } = definition;
        for (const slot of TEXTURE_SLOTS) {
            if (typeof values[slot] === "string") values[slot] = resolver.texture(values[slot], textureOptions);
        }
        switch (type) {
            case "toon":
                return new ToonMaterial({ ...values, bands: definition.bands ?? 3 });
            case "celestial":
                return new CelestialBodyMaterial(values);
            case "surface":
                return new SurfaceMaterial(values);
            case "unlit":
                return new UnlitMaterial({
                    name: definition.name,
                    color: definition.color ?? definition.albedoColor,
                    transparent: definition.transparent,
                });
            default:
                return new StandardMaterial(values);
        }
    }

    /**
     * `{ type: "shader", shader: "<.gfshader name in resources.json>", properties: { … } }`.
     * Texture properties naming an image use that image. A lenient resolver (the editor) gets a
     * neutral placeholder while the shader loads or fails to compile; games get the error.
     * @param {Object} definition - Material definition.
     * @param {Object} [assets] - Asset resolver or AssetManager.
     * @returns {Material}
     */
    static CreateShaderMaterial(definition, assets = null) {
        const resolver = this.Assets(assets);
        const source = resolver.shader(definition.shader);
        if (source == null) {
            if (resolver.lenient) return new StandardMaterial({ albedoColor: [0.55, 0.55, 0.58, 1], roughness: 0.8 });
            throw new Error(`ShaderMaterial: shader asset "${definition.shader}" is not loaded.`);
        }
        try {
            const material = new ShaderMaterial({
                shader: ShaderAsset.Parse(source, { name: definition.shader }),
                name: definition.name,
                properties: definition.properties,
                transparent: definition.transparent,
                receiveShadow: definition.receiveShadow !== false,
                toonBands: definition.toonBands,
            });
            for (const property of material.asset.properties) {
                const value = material.GetProperty(property.name);
                const texture = property.type === "texture" && typeof value === "string" ? resolver.texture(value) : null;
                if (texture) material.SetProperty(property.name, texture);
            }
            return material;
        } catch (error) {
            if (!resolver.lenient) throw error;
            console.warn(`Shader material "${definition.shader}":`, error.message);
            return new StandardMaterial({ albedoColor: [1, 0, 1, 1] });
        }
    }
}
