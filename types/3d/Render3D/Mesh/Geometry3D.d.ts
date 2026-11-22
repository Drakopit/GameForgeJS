/**
 * CPU-side indexed vertex buffer data consumed by `WebGL3DRenderer`.
 *
 * @param {Object} [options] - Vertex buffer arrays.
 * @param {Array|Float32Array} [options.positions] - XYZ positions.
 * @param {Array|Float32Array} [options.normals] - XYZ normals.
 * @param {Array|Float32Array} [options.uvs] - UV coordinates.
 * @param {Array|Float32Array} [options.tangents] - XYZW tangents.
 * @param {Array|Uint16Array|Uint32Array|null} [options.indices] - Triangle indices.
 */
export class Geometry3D {
    constructor({ positions, normals, uvs, tangents, indices, }?: {
        positions?: any[];
        normals?: any[];
        uvs?: any[];
        tangents?: any[];
        indices?: any;
    });
    positions: Float32Array<ArrayBuffer> | (any[] & Float32Array<ArrayBufferLike>);
    normals: Float32Array<ArrayBuffer> | (any[] & Float32Array<ArrayBufferLike>);
    uvs: Float32Array<ArrayBuffer> | (any[] & Float32Array<ArrayBufferLike>);
    tangents: Float32Array<ArrayBuffer> | (any[] & Float32Array<ArrayBufferLike>);
    indices: Uint32Array<any> | Uint16Array<any>;
    vertexCount: number;
    version: number;
    /** Notify the renderer after modifying vertex values without changing topology. */
    MarkUpdated(): void;
    /**
     * Generates fallback normals when geometry does not contain them.
     * @param {number[]} [defaultNormal] - Normal repeated per vertex.
     * @returns {Geometry3D} This geometry.
     */
    EnsureNormals(defaultNormal?: number[]): Geometry3D;
    EnsureUvs(): this;
    EnsureTangents(defaultTangent?: number[]): this;
}
