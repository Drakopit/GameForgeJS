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
    /**
     * Makes sure every vertex has a tangent. Missing tangents are computed from the triangles' UVs
     * (see `ComputeTangents`) when the geometry has normals and UVs; otherwise every vertex gets
     * `defaultTangent`.
     * @param {number[]} [defaultTangent] - XYZW tangent used without normals or UVs.
     * @returns {Geometry3D} This geometry.
     */
    EnsureTangents(defaultTangent?: number[]): Geometry3D;
    /**
     * Computes per-vertex tangents (xyz, w = bitangent sign) from positions, normals and UVs: each
     * triangle's UV-space derivatives are accumulated per vertex, then orthogonalized against the
     * normal (Gram-Schmidt). The shader's TBN is mat3(T, cross(N, T) * w, N), so a tangent-space
     * normal map's +X follows +U and +Y follows +V. Vertices with degenerate UVs get a tangent
     * perpendicular to their normal.
     * @returns {Geometry3D} This geometry.
     */
    ComputeTangents(): Geometry3D;
    /**
     * Returns a finer copy of this geometry: each level splits every triangle into four at its edge
     * midpoints (shared edges share their midpoint). Positions and UVs are interpolated linearly,
     * normals and tangents are averaged and renormalized. Used for vertex displacement, since WebGL2
     * has no tessellation stage.
     * @param {number} [levels=1] - Subdivision levels, 0 to 4 (each multiplies triangles by 4).
     * @returns {Geometry3D} A new geometry (this one when levels is 0).
     */
    Subdivide(levels?: number): Geometry3D;
}
