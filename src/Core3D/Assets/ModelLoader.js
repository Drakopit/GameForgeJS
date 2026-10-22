import { Mat4 } from "../../CoreCross/Math/Mat4.js";

const GLB_MAGIC = 0x46546C67;
const GLB_CHUNK_JSON = 0x4E4F534A;
const GLB_CHUNK_BIN = 0x004E4942;
const TRIANGLES = 4;

const COMPONENT_ARRAY = {
    5120: Int8Array,
    5121: Uint8Array,
    5122: Int16Array,
    5123: Uint16Array,
    5125: Uint32Array,
    5126: Float32Array,
};

const COMPONENT_BYTES = {
    5120: 1,
    5121: 1,
    5122: 2,
    5123: 2,
    5125: 4,
    5126: 4,
};

const ACCESSOR_COMPONENTS = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16,
};

/**
 * glTF/GLB loader for Render3D model assets.
 *
 * The loader keeps GameForgeJS dependency-free while following the glTF 2.0
 * object model: mesh primitives reference accessors, materials reference
 * textures/images/samplers, and skins/animations remain available for a future
 * skeletal renderer.
 */
export class ModelLoader {
    static async Load(url) {
        const isGLB = url.split(/[?#]/, 1)[0].toLowerCase().endsWith(".glb");
        return isGLB ? this.LoadGLB(url) : this.LoadGLTF(url);
    }

    static async LoadGLTF(url) {
        const baseUrl = this.GetBaseUrl(url);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`ModelLoader: failed to fetch ${url}`);

        const gltf = await response.json();
        const buffers = await Promise.all((gltf.buffers ?? []).map(buffer => {
            if (!buffer.uri) {
                throw new Error("ModelLoader: external .gltf buffers must declare an uri.");
            }
            return this.FetchArrayBuffer(this.ResolveUri(buffer.uri, baseUrl));
        }));

        return this.Parse(gltf, buffers, baseUrl);
    }

    static async LoadGLB(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`ModelLoader: failed to fetch ${url}`);

        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength < 20) throw new Error("ModelLoader: truncated GLB header.");
        const view = new DataView(arrayBuffer);
        const magic = view.getUint32(0, true);
        const version = view.getUint32(4, true);

        if (magic !== GLB_MAGIC) throw new Error("ModelLoader: invalid GLB magic.");
        if (version !== 2) throw new Error(`ModelLoader: unsupported GLB version ${version}.`);
        if (view.getUint32(8, true) !== arrayBuffer.byteLength) throw new Error("ModelLoader: GLB length does not match its header.");

        let offset = 12;
        let jsonChunk = null;
        const buffers = [];

        while (offset < arrayBuffer.byteLength) {
            if (offset + 8 > arrayBuffer.byteLength) throw new Error("ModelLoader: truncated GLB chunk header.");
            const chunkLength = view.getUint32(offset, true);
            const chunkType = view.getUint32(offset + 4, true);
            offset += 8;
            if (chunkLength % 4 !== 0 || offset + chunkLength > arrayBuffer.byteLength)
                throw new Error("ModelLoader: invalid GLB chunk length.");

            const chunkData = arrayBuffer.slice(offset, offset + chunkLength);
            if (chunkType === GLB_CHUNK_JSON) {
                jsonChunk = JSON.parse(new TextDecoder().decode(chunkData));
            } else if (chunkType === GLB_CHUNK_BIN) {
                buffers.push(chunkData);
            }

            offset += chunkLength;
        }

        if (!jsonChunk) throw new Error("ModelLoader: GLB JSON chunk not found.");
        return this.Parse(jsonChunk, buffers, this.GetBaseUrl(url));
    }

    static async Parse(gltf, buffers, baseUrl = "") {
        const images = await this.ParseImages(gltf, buffers, baseUrl);
        const samplers = (gltf.samplers ?? []).map((sampler, index) => ({ index, ...sampler }));
        const textures = (gltf.textures ?? []).map((texture, index) => ({
            index,
            name: texture.name ?? `texture_${index}`,
            source: images[texture.source] ?? null,
            sampler: samplers[texture.sampler] ?? null,
            extensions: texture.extensions ?? null,
            extras: texture.extras ?? null,
        }));
        const materials = (gltf.materials ?? []).map((material, index) => (
            this.ParseMaterial(material, index, textures)
        ));
        const skins = this.ParseSkins(gltf, buffers);
        const animations = this.ParseAnimations(gltf, buffers);
        const nodes = (gltf.nodes ?? []).map((node, index) => this.ParseNode(node, index));
        const meshInstances = this.CollectMeshInstances(gltf);
        const models = [];

        if (gltf.nodes?.length || gltf.scenes?.length) {
            for (const instance of meshInstances) {
                const mesh = gltf.meshes?.[instance.meshIndex];
                this.PushMeshParts(models, gltf, buffers, mesh, instance, materials, skins);
            }
        } else {
            (gltf.meshes ?? []).forEach((mesh, meshIndex) => {
                this.PushMeshParts(models, gltf, buffers, mesh, { meshIndex, node: null }, materials, skins);
            });
        }

        models.asset = {
            gltf,
            images,
            samplers,
            textures,
            materials,
            skins,
            animations,
            nodes,
            scenes: gltf.scenes ?? [],
            defaultScene: gltf.scene ?? 0,
        };
        models.images = images;
        models.textures = textures;
        models.materials = materials;
        models.skins = skins;
        models.animations = animations;
        models.nodes = nodes;

        return models;
    }

    static PushMeshParts(models, gltf, buffers, mesh, instance, materials, skins) {
        if (!mesh) return;

        mesh.primitives?.forEach((primitive, primitiveIndex) => {
            if ((primitive.mode ?? TRIANGLES) !== TRIANGLES) {
                console.warn(`ModelLoader: primitive mode ${primitive.mode} is not supported yet.`);
                return;
            }

            const attrs = primitive.attributes ?? {};
            const material = primitive.material != null ? materials[primitive.material] : null;
            const node = instance.node ? this.ParseNode(instance.node, instance.nodeIndex) : null;
            if (node) node.worldMatrix = instance.worldMatrix;
            const skin = node?.skin != null ? skins[node.skin] : null;

            models.push({
                name: this.BuildPartName(mesh, node, primitiveIndex),
                meshName: mesh.name ?? `mesh_${instance.meshIndex}`,
                nodeName: node?.name ?? null,
                positions: this.ReadAccessor(gltf, buffers, attrs.POSITION),
                normals: attrs.NORMAL != null ? this.ReadAccessor(gltf, buffers, attrs.NORMAL) : null,
                uvs: attrs.TEXCOORD_0 != null ? this.ReadAccessor(gltf, buffers, attrs.TEXCOORD_0) : null,
                tangents: attrs.TANGENT != null ? this.ReadAccessor(gltf, buffers, attrs.TANGENT) : null,
                colors: attrs.COLOR_0 != null ? this.ReadAccessor(gltf, buffers, attrs.COLOR_0) : null,
                joints: attrs.JOINTS_0 != null ? this.ReadAccessor(gltf, buffers, attrs.JOINTS_0) : null,
                weights: attrs.WEIGHTS_0 != null ? this.ReadAccessor(gltf, buffers, attrs.WEIGHTS_0) : null,
                indices: primitive.indices != null ? this.ReadAccessor(gltf, buffers, primitive.indices) : null,
                material,
                materialIndex: primitive.material ?? null,
                node,
                skin,
                skinIndex: node?.skin ?? null,
                targets: primitive.targets ?? null,
                extensions: primitive.extensions ?? null,
                extras: primitive.extras ?? null,
            });
        });
    }

    static BuildPartName(mesh, node, primitiveIndex) {
        const base = node?.name ?? mesh.name ?? "mesh";
        return primitiveIndex === 0 ? base : `${base}_${primitiveIndex}`;
    }

    static ParseNode(node, index) {
        return {
            index,
            name: node.name ?? `node_${index}`,
            mesh: node.mesh ?? null,
            skin: node.skin ?? null,
            children: node.children ?? [],
            matrix: node.matrix ? [...node.matrix] : null,
            translation: node.translation ? [...node.translation] : [0, 0, 0],
            rotation: node.rotation ? [...node.rotation] : [0, 0, 0, 1],
            scale: node.scale ? [...node.scale] : [1, 1, 1],
            extensions: node.extensions ?? null,
            extras: node.extras ?? null,
        };
    }

    static CollectMeshInstances(gltf) {
        const nodes = gltf.nodes ?? [];
        const instances = [];
        const defaultScene = gltf.scenes?.[gltf.scene ?? 0];
        const childNodes = new Set(nodes.flatMap(node => node.children ?? []));
        const rootNodes = defaultScene?.nodes ?? nodes.map((_, index) => index).filter(index => !childNodes.has(index));
        const visited = new Set();

        const visit = (nodeIndex, parentMatrix, ancestors = new Set()) => {
            if (ancestors.has(nodeIndex)) throw new Error(`ModelLoader: node hierarchy cycle at ${nodeIndex}.`);
            if (visited.has(nodeIndex)) throw new Error(`ModelLoader: node ${nodeIndex} has multiple parents.`);
            visited.add(nodeIndex);

            const node = nodes[nodeIndex];
            if (!node) throw new Error(`ModelLoader: node ${nodeIndex} not found.`);
            const local = node.matrix ? new Float32Array(node.matrix)
                : Mat4.fromRotationTranslationScale(Mat4.create(), node.rotation ?? [0, 0, 0, 1], node.translation ?? [0, 0, 0], node.scale ?? [1, 1, 1]);
            const worldMatrix = Mat4.multiply(Mat4.create(), parentMatrix, local);
            if (node.mesh != null) {
                instances.push({ nodeIndex, node, meshIndex: node.mesh, worldMatrix });
            }
            node.children?.forEach(child => visit(child, worldMatrix, new Set([...ancestors, nodeIndex])));
        };

        rootNodes.forEach(index => visit(index, Mat4.create()));
        return instances;
    }

    static ParseMaterial(material, index, textures) {
        const pbr = material.pbrMetallicRoughness ?? {};
        return {
            index,
            name: material.name ?? `material_${index}`,
            baseColorFactor: pbr.baseColorFactor ?? [1, 1, 1, 1],
            metallicFactor: pbr.metallicFactor ?? 1,
            roughnessFactor: pbr.roughnessFactor ?? 1,
            baseColorTexture: this.ParseTextureInfo(pbr.baseColorTexture, textures),
            metallicRoughnessTexture: this.ParseTextureInfo(pbr.metallicRoughnessTexture, textures),
            normalTexture: this.ParseTextureInfo(material.normalTexture, textures),
            occlusionTexture: this.ParseTextureInfo(material.occlusionTexture, textures),
            emissiveTexture: this.ParseTextureInfo(material.emissiveTexture, textures),
            emissiveFactor: material.emissiveFactor ?? [0, 0, 0],
            alphaMode: material.alphaMode ?? "OPAQUE",
            alphaCutoff: material.alphaCutoff ?? 0.5,
            doubleSided: Boolean(material.doubleSided),
            extensions: material.extensions ?? null,
            extras: material.extras ?? null,
        };
    }

    static ParseTextureInfo(info, textures) {
        if (!info) return null;
        const texture = textures[info.index] ?? null;
        return {
            ...info,
            texture,
            source: texture?.source ?? null,
            sampler: texture?.sampler ?? null,
            texCoord: info.texCoord ?? 0,
        };
    }

    static async ParseImages(gltf, buffers, baseUrl) {
        return Promise.all((gltf.images ?? []).map(async (image, index) => {
            if (image.uri) {
                return {
                    index,
                    name: image.name ?? `image_${index}`,
                    uri: this.ResolveUri(image.uri, baseUrl),
                    mimeType: image.mimeType ?? this.GuessMimeType(image.uri),
                    image: null,
                    extensions: image.extensions ?? null,
                    extras: image.extras ?? null,
                };
            }

            if (image.bufferView != null) {
                const bufferView = gltf.bufferViews[image.bufferView];
                const buffer = buffers[bufferView.buffer];
                const byteOffset = bufferView.byteOffset ?? 0;
                const bytes = buffer.slice(byteOffset, byteOffset + bufferView.byteLength);
                const objectUrl = URL.createObjectURL(new Blob([bytes], { type: image.mimeType ?? "image/png" }));
                let htmlImage;
                try { htmlImage = await this.LoadHtmlImage(objectUrl); }
                finally { URL.revokeObjectURL(objectUrl); }

                return {
                    index,
                    name: image.name ?? `image_${index}`,
                    uri: null,
                    mimeType: image.mimeType ?? "image/png",
                    image: htmlImage,
                    extensions: image.extensions ?? null,
                    extras: image.extras ?? null,
                };
            }

            return {
                index,
                name: image.name ?? `image_${index}`,
                uri: null,
                mimeType: image.mimeType ?? null,
                image: null,
                extensions: image.extensions ?? null,
                extras: image.extras ?? null,
            };
        }));
    }

    static ParseSkins(gltf, buffers) {
        return (gltf.skins ?? []).map((skin, index) => ({
            index,
            name: skin.name ?? `skin_${index}`,
            joints: skin.joints ?? [],
            skeleton: skin.skeleton ?? null,
            inverseBindMatrices: skin.inverseBindMatrices != null
                ? this.ReadAccessor(gltf, buffers, skin.inverseBindMatrices)
                : null,
            extensions: skin.extensions ?? null,
            extras: skin.extras ?? null,
        }));
    }

    static ParseAnimations(gltf, buffers) {
        return (gltf.animations ?? []).map((animation, index) => ({
            index,
            name: animation.name ?? `animation_${index}`,
            channels: (animation.channels ?? []).map(channel => ({
                sampler: channel.sampler,
                target: channel.target,
                extensions: channel.extensions ?? null,
                extras: channel.extras ?? null,
            })),
            samplers: (animation.samplers ?? []).map(sampler => ({
                interpolation: sampler.interpolation ?? "LINEAR",
                input: this.ReadAccessor(gltf, buffers, sampler.input),
                output: this.ReadAccessor(gltf, buffers, sampler.output),
                inputAccessor: sampler.input,
                outputAccessor: sampler.output,
                extensions: sampler.extensions ?? null,
                extras: sampler.extras ?? null,
            })),
            extensions: animation.extensions ?? null,
            extras: animation.extras ?? null,
        }));
    }

    static ReadAccessor(gltf, buffers, accessorIndex) {
        if (accessorIndex == null) return null;

        const accessor = gltf.accessors?.[accessorIndex];
        if (!accessor) throw new Error(`ModelLoader: accessor ${accessorIndex} not found.`);

        const componentCount = ACCESSOR_COMPONENTS[accessor.type];
        const ArrayType = COMPONENT_ARRAY[accessor.componentType];
        const componentBytes = COMPONENT_BYTES[accessor.componentType];

        if (!componentCount || !ArrayType || !componentBytes) {
            throw new Error(`ModelLoader: unsupported accessor type ${accessor.type}/${accessor.componentType}.`);
        }

        let result = this.ReadAccessorBase(gltf, buffers, accessor, componentCount, ArrayType, componentBytes);

        if (accessor.sparse) {
            result = new result.constructor(result);
            this.ApplySparseAccessor(gltf, buffers, accessor, componentCount, result);
        }

        return result;
    }

    static ReadAccessorBase(gltf, buffers, accessor, componentCount, ArrayType, componentBytes) {
        if (!Number.isInteger(accessor.count) || accessor.count < 0) throw new Error("ModelLoader: invalid accessor count.");
        const length = accessor.count * componentCount;
        const shouldNormalize = Boolean(accessor.normalized) && ArrayType !== Float32Array;
        const OutputArray = shouldNormalize ? Float32Array : ArrayType;

        if (accessor.bufferView == null) {
            return new OutputArray(length);
        }

        const bufferView = gltf.bufferViews?.[accessor.bufferView];
        const buffer = buffers[bufferView?.buffer];
        if (!bufferView || !buffer || !Number.isInteger(bufferView.byteLength) || bufferView.byteLength < 0) {
            throw new Error("ModelLoader: accessor buffer is missing or has an invalid byteLength.");
        }
        const byteOffset = (bufferView.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
        const rows = accessor.type.startsWith("MAT") ? Number(accessor.type.slice(3)) : componentCount;
        const columns = accessor.type.startsWith("MAT") ? rows : 1;
        const columnBytes = columns > 1 ? Math.ceil(rows * componentBytes / 4) * 4 : rows * componentBytes;
        const elementBytes = columns * columnBytes;
        const byteStride = bufferView.byteStride ?? elementBytes;
        const lastByte = accessor.count ? (accessor.count - 1) * byteStride + (columns - 1) * columnBytes + rows * componentBytes : 0;
        if (!Number.isInteger(byteOffset) || byteOffset < 0 || !Number.isInteger(byteStride) || byteStride < elementBytes ||
            (accessor.byteOffset ?? 0) < 0 || (accessor.byteOffset ?? 0) + lastByte > bufferView.byteLength || byteOffset + lastByte > buffer.byteLength) {
            throw new Error("ModelLoader: accessor exceeds its buffer view or has an invalid stride.");
        }

        if (!shouldNormalize && elementBytes === componentCount * componentBytes && byteStride === elementBytes && byteOffset % componentBytes === 0) {
            return new ArrayType(buffer, byteOffset, length);
        }

        const output = new OutputArray(length);
        const dataView = new DataView(buffer);

        for (let element = 0; element < accessor.count; element++) {
            const elementOffset = byteOffset + element * byteStride;
            for (let component = 0; component < componentCount; component++) {
                const sourceOffset = elementOffset + Math.floor(component / rows) * columnBytes + (component % rows) * componentBytes;
                const value = this.ReadComponent(dataView, sourceOffset, accessor.componentType);
                output[element * componentCount + component] = shouldNormalize
                    ? this.NormalizeComponent(value, accessor.componentType)
                    : value;
            }
        }

        return output;
    }

    static ApplySparseAccessor(gltf, buffers, accessor, componentCount, output) {
        const sparse = accessor.sparse;
        const indices = this.ReadSparseIndices(gltf, buffers, sparse);
        const values = this.ReadSparseValues(gltf, buffers, sparse, accessor, componentCount);

        for (let item = 0; item < sparse.count; item++) {
            if (indices[item] >= accessor.count || (item > 0 && indices[item] <= indices[item - 1])) {
                throw new Error("ModelLoader: sparse accessor indices must be ordered and in range.");
            }
            const targetIndex = indices[item] * componentCount;
            const sourceIndex = item * componentCount;
            for (let component = 0; component < componentCount; component++) {
                const value = values[sourceIndex + component];
                output[targetIndex + component] = accessor.normalized ? this.NormalizeComponent(value, accessor.componentType) : value;
            }
        }
    }

    static ReadSparseIndices(gltf, buffers, sparse) {
        if (![5121, 5123, 5125].includes(sparse.indices.componentType))
            throw new Error("ModelLoader: invalid sparse index component type.");
        const bufferView = gltf.bufferViews?.[sparse.indices.bufferView];
        const buffer = buffers[bufferView?.buffer];
        if (!bufferView || !buffer || !Number.isInteger(bufferView.byteLength) || bufferView.byteLength < 0)
            throw new Error("ModelLoader: sparse index buffer is missing or invalid.");
        if (!Number.isInteger(sparse.count) || sparse.count < 0)
            throw new Error("ModelLoader: invalid sparse accessor count.");
        const ArrayType = COMPONENT_ARRAY[sparse.indices.componentType];
        const componentBytes = COMPONENT_BYTES[sparse.indices.componentType];
        const localOffset = sparse.indices.byteOffset ?? 0;
        const byteOffset = (bufferView.byteOffset ?? 0) + localOffset;
        const endOffset = localOffset + sparse.count * componentBytes;
        if (!Number.isInteger(localOffset) || localOffset < 0 || endOffset > bufferView.byteLength || byteOffset + sparse.count * componentBytes > buffer.byteLength)
            throw new Error("ModelLoader: sparse index data exceeds its buffer view.");

        if (byteOffset % componentBytes === 0) {
            return new ArrayType(buffer, byteOffset, sparse.count);
        }

        const output = new ArrayType(sparse.count);
        const dataView = new DataView(buffer);
        for (let i = 0; i < sparse.count; i++) {
            output[i] = this.ReadComponent(dataView, byteOffset + i * componentBytes, sparse.indices.componentType);
        }
        return output;
    }

    static ReadSparseValues(gltf, buffers, sparse, accessor, componentCount) {
        return this.ReadAccessorBase(gltf, buffers, {
            ...accessor, count: sparse.count, bufferView: sparse.values.bufferView,
            byteOffset: sparse.values.byteOffset ?? 0, normalized: false,
        }, componentCount, COMPONENT_ARRAY[accessor.componentType], COMPONENT_BYTES[accessor.componentType]);
    }

    static ReadComponent(dataView, byteOffset, componentType) {
        if (componentType === 5120) return dataView.getInt8(byteOffset);
        if (componentType === 5121) return dataView.getUint8(byteOffset);
        if (componentType === 5122) return dataView.getInt16(byteOffset, true);
        if (componentType === 5123) return dataView.getUint16(byteOffset, true);
        if (componentType === 5125) return dataView.getUint32(byteOffset, true);
        if (componentType === 5126) return dataView.getFloat32(byteOffset, true);
        throw new Error(`ModelLoader: unsupported component type ${componentType}.`);
    }

    static NormalizeComponent(value, componentType) {
        if (componentType === 5120) return Math.max(value / 127, -1);
        if (componentType === 5121) return value / 255;
        if (componentType === 5122) return Math.max(value / 32767, -1);
        if (componentType === 5123) return value / 65535;
        return value;
    }

    static async FetchArrayBuffer(uri) {
        const response = await fetch(uri);
        if (!response.ok) throw new Error(`ModelLoader: failed to fetch buffer ${uri}`);
        return response.arrayBuffer();
    }

    static LoadHtmlImage(src) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error(`ModelLoader: failed to load image ${src}`));
            image.src = src;
        });
    }

    static ResolveUri(uri, baseUrl = "") {
        if (/^(data:|blob:|https?:\/\/)/i.test(uri)) return uri;
        if (/^https?:\/\//i.test(baseUrl)) return new URL(uri, baseUrl).href;
        if (uri.startsWith("/")) return uri;
        return `${baseUrl}${uri}`;
    }

    static GetBaseUrl(url) {
        url = url.split(/[?#]/, 1)[0];
        const index = url.lastIndexOf("/");
        return index === -1 ? "" : url.slice(0, index + 1);
    }

    static GuessMimeType(uri) {
        const cleanUri = uri.split("?")[0].split("#")[0].toLowerCase();
        if (cleanUri.endsWith(".jpg") || cleanUri.endsWith(".jpeg")) return "image/jpeg";
        if (cleanUri.endsWith(".webp")) return "image/webp";
        if (cleanUri.endsWith(".ktx2")) return "image/ktx2";
        return "image/png";
    }
}
