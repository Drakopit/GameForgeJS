import { AssetManager } from "../../core/Assets/AssetManager.js";
import { Geometry3D, Mesh, StandardMaterial, Texture } from "../Render3D/index.js";
import { Model3D } from "./Model3D.js";
import { Mat4 } from "../../core/Math/Mat4.js";

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
    static FromAsset(modelName, { material = null, materialFactory = null, name = modelName } = {}) {
        const parts = AssetManager.instance.GetModel(modelName);
        if (!parts) throw new Error(`ModelMeshFactory: model '${modelName}' is not loaded. Await GetModelAsync before creating it.`);
        const meshes = parts.map((part, index) => {
            const geometry = new Geometry3D({
                positions: part.positions,
                normals: part.normals,
                uvs: part.uvs,
                tangents: part.tangents,
                indices: part.indices,
            });
            const meshMaterial = materialFactory
                ? materialFactory(part, index)
                : (material ?? this.CreateMaterial(part, index, name));

            const mesh = Mesh.FromGeometry(geometry, meshMaterial, {
                name: part.name ? `${name}_${part.name}` : `${name}_${index}`,
            });

            this.ApplyNodeTransform(mesh, part.node);
            mesh.modelPart = part;
            return mesh;
        });

        return new Model3D(meshes);
    }

    static CreateMaterial(part, index, modelName) {
        const material = part.material;
        if (!material) {
            return new StandardMaterial({ name: `${modelName}_material_${index}` });
        }

        const baseColorTexture = this.CreateTexture(material.baseColorTexture);
        const normalTexture = this.CreateTexture(material.normalTexture);
        const emissiveTexture = this.CreateTexture(material.emissiveTexture);
        const occlusionTexture = this.CreateTexture(material.occlusionTexture);
        const metallicRoughnessTexture = this.CreateTexture(material.metallicRoughnessTexture);
        const sharedOrm = material.occlusionTexture?.source === material.metallicRoughnessTexture?.source
            ? metallicRoughnessTexture
            : null;

        const standard = new StandardMaterial({
            name: material.name ?? `${modelName}_material_${index}`,
            albedoColor: material.baseColorFactor,
            albedoMap: baseColorTexture,
            normalMap: normalTexture,
            ormMap: sharedOrm,
            aoMap: sharedOrm ? null : occlusionTexture,
            emissiveMap: emissiveTexture,
            roughness: material.roughnessFactor ?? 1,
            metallic: material.metallicFactor ?? 1,
            emissiveColor: material.emissiveFactor,
            transparent: material.alphaMode === "BLEND" || (material.baseColorFactor?.[3] ?? 1) < 1,
        });

        standard.gltf = material;
        standard.metallicRoughnessTexture = metallicRoughnessTexture;
        standard.alphaMode = material.alphaMode;
        standard.alphaCutoff = material.alphaCutoff;
        standard.doubleSided = material.doubleSided;
        return standard;
    }

    static CreateTexture(textureInfo) {
        const source = textureInfo?.source;
        if (!source) return null;

        const sampler = textureInfo.sampler ?? {};
        const options = {
            flipY: false,
            wrapS: sampler.wrapS ?? null,
            wrapT: sampler.wrapT ?? null,
            minFilter: sampler.minFilter ?? null,
            magFilter: sampler.magFilter ?? null,
        };

        if (source.image) return Texture.FromImage(source.image, options);
        if (source.uri) return Texture.Load(source.uri, options);
        return null;
    }

    static ApplyNodeTransform(mesh, node) {
        if (!node) return;
        mesh.transform.matrix = node.worldMatrix ? Mat4.clone(node.worldMatrix)
            : node.matrix ? Mat4.clone(node.matrix)
            : Mat4.fromRotationTranslationScale(Mat4.create(), node.rotation ?? [0, 0, 0, 1], node.translation ?? [0, 0, 0], node.scale ?? [1, 1, 1]);

        if (node.translation) mesh.transform.position = [...node.translation];
        if (node.scale) mesh.transform.scale = [...node.scale];
        if (node.rotation) mesh.transform.rotation = this.QuaternionToEuler(node.rotation);
        mesh.gltfNode = node;
    }

    static QuaternionToEuler(rotation) {
        const [x, y, z, w] = rotation;
        const sinr = 2 * (w * x + y * z);
        const cosr = 1 - 2 * (x * x + y * y);
        const roll = Math.atan2(sinr, cosr);

        const sinp = 2 * (w * y - z * x);
        const pitch = Math.abs(sinp) >= 1
            ? Math.sign(sinp) * Math.PI / 2
            : Math.asin(sinp);

        const siny = 2 * (w * z + x * y);
        const cosy = 1 - 2 * (y * y + z * z);
        const yaw = Math.atan2(siny, cosy);

        return { x: roll, y: pitch, z: yaw };
    }
}
