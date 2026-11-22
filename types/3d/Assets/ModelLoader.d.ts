/**
 * glTF/GLB loader for Render3D model assets.
 *
 * The loader keeps GameForgeJS dependency-free while following the glTF 2.0
 * object model: mesh primitives reference accessors, materials reference
 * textures/images/samplers, and skins/animations feed SkeletalAnimator playback.
 */
export class ModelLoader {
    static Load(url: any): Promise<any[]>;
    static LoadGLTF(url: any): Promise<any[]>;
    static LoadGLB(url: any): Promise<any[]>;
    static Parse(gltf: any, buffers: any, baseUrl?: string): Promise<any[]>;
    static PushMeshParts(models: any, gltf: any, buffers: any, mesh: any, instance: any, materials: any, skins: any): void;
    static BuildPartName(mesh: any, node: any, primitiveIndex: any): any;
    static ParseNode(node: any, index: any): {
        index: any;
        name: any;
        mesh: any;
        skin: any;
        children: any;
        matrix: any[];
        translation: any[];
        rotation: any[];
        scale: any[];
        extensions: any;
        extras: any;
    };
    static CollectMeshInstances(gltf: any): any[];
    static ParseMaterial(material: any, index: any, textures: any): {
        index: any;
        name: any;
        baseColorFactor: any;
        metallicFactor: any;
        roughnessFactor: any;
        baseColorTexture: any;
        metallicRoughnessTexture: any;
        normalTexture: any;
        occlusionTexture: any;
        emissiveTexture: any;
        emissiveFactor: any;
        alphaMode: any;
        alphaCutoff: any;
        doubleSided: boolean;
        extensions: any;
        extras: any;
    };
    static ParseTextureInfo(info: any, textures: any): any;
    static ParseImages(gltf: any, buffers: any, baseUrl: any): Promise<any[]>;
    static ParseSkins(gltf: any, buffers: any): any;
    static ParseAnimations(gltf: any, buffers: any): any;
    static ReadAccessor(gltf: any, buffers: any, accessorIndex: any): any;
    static ReadAccessorBase(gltf: any, buffers: any, accessor: any, componentCount: any, ArrayType: any, componentBytes: any): any;
    static ApplySparseAccessor(gltf: any, buffers: any, accessor: any, componentCount: any, output: any): void;
    static ReadSparseIndices(gltf: any, buffers: any, sparse: any): any;
    static ReadSparseValues(gltf: any, buffers: any, sparse: any, accessor: any, componentCount: any): any;
    static ReadComponent(dataView: any, byteOffset: any, componentType: any): any;
    static NormalizeComponent(value: any, componentType: any): any;
    static FetchArrayBuffer(uri: any): Promise<ArrayBuffer>;
    static LoadHtmlImage(src: any): Promise<any>;
    static ResolveUri(uri: any, baseUrl?: string): any;
    static GetBaseUrl(url: any): any;
    static GuessMimeType(uri: any): "image/jpeg" | "image/webp" | "image/ktx2" | "image/png";
}
