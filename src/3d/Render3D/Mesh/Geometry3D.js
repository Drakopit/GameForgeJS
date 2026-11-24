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
    constructor({
        positions = [],
        normals = [],
        uvs = [],
        tangents = [],
        indices = null,
    } = {}) {
        this.positions = positions instanceof Float32Array ? positions : new Float32Array(positions);
        this.normals = normals instanceof Float32Array ? normals : new Float32Array(normals);
        this.uvs = uvs instanceof Float32Array ? uvs : new Float32Array(uvs);
        this.tangents = tangents instanceof Float32Array ? tangents : new Float32Array(tangents);
        this.indices = normalizeIndices(indices);
        this.vertexCount = this.positions.length / 3;
        this.version = 0;
    }

    /** Notify the renderer after modifying vertex values without changing topology. */
    MarkUpdated() {
        this.version++;
    }

    /**
     * Generates fallback normals when geometry does not contain them.
     * @param {number[]} [defaultNormal] - Normal repeated per vertex.
     * @returns {Geometry3D} This geometry.
     */
    EnsureNormals(defaultNormal = [0, 1, 0]) {
        if (this.normals.length) return this;

        const normals = [];
        for (let i = 0; i < this.vertexCount; i++) {
            normals.push(defaultNormal[0], defaultNormal[1], defaultNormal[2]);
        }
        this.normals = new Float32Array(normals);
        return this;
    }

    EnsureUvs() {
        if (this.uvs.length) return this;

        const uvs = [];
        for (let i = 0; i < this.vertexCount; i++) {
            uvs.push(0, 0);
        }
        this.uvs = new Float32Array(uvs);
        return this;
    }

    /**
     * Makes sure every vertex has a tangent. Missing tangents are computed from the triangles' UVs
     * (see `ComputeTangents`) when the geometry has normals and UVs; otherwise every vertex gets
     * `defaultTangent`.
     * @param {number[]} [defaultTangent] - XYZW tangent used without normals or UVs.
     * @returns {Geometry3D} This geometry.
     */
    EnsureTangents(defaultTangent = [1, 0, 0, 1]) {
        if (this.tangents.length) return this;
        if (this.normals.length === this.vertexCount * 3 && this.uvs.length === this.vertexCount * 2 && this.vertexCount >= 3) {
            return this.ComputeTangents();
        }

        const tangents = [];
        for (let i = 0; i < this.vertexCount; i++) {
            tangents.push(defaultTangent[0], defaultTangent[1], defaultTangent[2], defaultTangent[3]);
        }
        this.tangents = new Float32Array(tangents);
        return this;
    }

    /**
     * Computes per-vertex tangents (xyz, w = bitangent sign) from positions, normals and UVs: each
     * triangle's UV-space derivatives are accumulated per vertex, then orthogonalized against the
     * normal (Gram-Schmidt). The shader's TBN is mat3(T, cross(N, T) * w, N), so a tangent-space
     * normal map's +X follows +U and +Y follows +V. Vertices with degenerate UVs get a tangent
     * perpendicular to their normal.
     * @returns {Geometry3D} This geometry.
     */
    ComputeTangents() {
        const count = this.vertexCount;
        const positions = this.positions;
        const normals = this.normals;
        const uvs = this.uvs;
        if (normals.length !== count * 3 || uvs.length !== count * 2) {
            throw new Error("Geometry3D.ComputeTangents requires one normal and one UV per vertex.");
        }
        const sDirections = new Float64Array(count * 3);
        const tDirections = new Float64Array(count * 3);
        const triangleCount = this.indices ? Math.floor(this.indices.length / 3) : Math.floor(count / 3);
        const vertex = (triangle, corner) => (this.indices ? this.indices[triangle * 3 + corner] : triangle * 3 + corner);

        for (let triangle = 0; triangle < triangleCount; triangle++) {
            const a = vertex(triangle, 0), b = vertex(triangle, 1), c = vertex(triangle, 2);
            const x1 = positions[b * 3] - positions[a * 3], y1 = positions[b * 3 + 1] - positions[a * 3 + 1], z1 = positions[b * 3 + 2] - positions[a * 3 + 2];
            const x2 = positions[c * 3] - positions[a * 3], y2 = positions[c * 3 + 1] - positions[a * 3 + 1], z2 = positions[c * 3 + 2] - positions[a * 3 + 2];
            const s1 = uvs[b * 2] - uvs[a * 2], t1 = uvs[b * 2 + 1] - uvs[a * 2 + 1];
            const s2 = uvs[c * 2] - uvs[a * 2], t2 = uvs[c * 2 + 1] - uvs[a * 2 + 1];
            const determinant = s1 * t2 - s2 * t1;
            if (Math.abs(determinant) < 1e-12) continue;
            const r = 1 / determinant;
            const sx = (t2 * x1 - t1 * x2) * r, sy = (t2 * y1 - t1 * y2) * r, sz = (t2 * z1 - t1 * z2) * r;
            const tx = (s1 * x2 - s2 * x1) * r, ty = (s1 * y2 - s2 * y1) * r, tz = (s1 * z2 - s2 * z1) * r;
            for (const index of [a, b, c]) {
                sDirections[index * 3] += sx; sDirections[index * 3 + 1] += sy; sDirections[index * 3 + 2] += sz;
                tDirections[index * 3] += tx; tDirections[index * 3 + 1] += ty; tDirections[index * 3 + 2] += tz;
            }
        }

        const tangents = new Float32Array(count * 4);
        for (let index = 0; index < count; index++) {
            const nx = normals[index * 3], ny = normals[index * 3 + 1], nz = normals[index * 3 + 2];
            let sx = sDirections[index * 3], sy = sDirections[index * 3 + 1], sz = sDirections[index * 3 + 2];
            const along = nx * sx + ny * sy + nz * sz;
            sx -= nx * along; sy -= ny * along; sz -= nz * along;
            let length = Math.hypot(sx, sy, sz);
            if (length < 1e-9) {
                // No usable UV gradient: any direction perpendicular to the normal.
                [sx, sy, sz] = Math.abs(nx) < 0.9 ? [1 - nx * nx, -nx * ny, -nx * nz] : [-nz * nx, -nz * ny, 1 - nz * nz];
                length = Math.hypot(sx, sy, sz) || 1;
            }
            sx /= length; sy /= length; sz /= length;
            // Handedness: does cross(N, T) point along the accumulated V direction?
            const cx = ny * sz - nz * sy, cy = nz * sx - nx * sz, cz = nx * sy - ny * sx;
            const w = cx * tDirections[index * 3] + cy * tDirections[index * 3 + 1] + cz * tDirections[index * 3 + 2] < 0 ? -1 : 1;
            tangents.set([sx, sy, sz, w], index * 4);
        }
        this.tangents = tangents;
        return this;
    }

    /**
     * Returns a finer copy of this geometry: each level splits every triangle into four at its edge
     * midpoints (shared edges share their midpoint). Positions and UVs are interpolated linearly,
     * normals and tangents are averaged and renormalized. Used for vertex displacement, since WebGL2
     * has no tessellation stage.
     * @param {number} [levels=1] - Subdivision levels, 0 to 4 (each multiplies triangles by 4).
     * @returns {Geometry3D} A new geometry (this one when levels is 0).
     */
    Subdivide(levels = 1) {
        if (!Number.isInteger(levels) || levels < 0 || levels > 4) throw new RangeError("Geometry3D.Subdivide levels must be an integer from 0 to 4.");
        if (levels === 0) return this;
        this.EnsureNormals();
        this.EnsureUvs();
        this.EnsureTangents();
        let positions = Array.from(this.positions), normals = Array.from(this.normals);
        let uvs = Array.from(this.uvs), tangents = Array.from(this.tangents);
        let indices = this.indices ? Array.from(this.indices) : Array.from({ length: this.vertexCount }, (_, index) => index);

        for (let level = 0; level < levels; level++) {
            const midpoints = new Map();
            const next = [];
            const midpoint = (a, b) => {
                const key = a < b ? `${a}_${b}` : `${b}_${a}`;
                const cached = midpoints.get(key);
                if (cached !== undefined) return cached;
                const index = positions.length / 3;
                for (let axis = 0; axis < 3; axis++) positions.push((positions[a * 3 + axis] + positions[b * 3 + axis]) / 2);
                const normal = [0, 1, 2].map(axis => normals[a * 3 + axis] + normals[b * 3 + axis]);
                const normalLength = Math.hypot(...normal) || 1;
                normals.push(...normal.map(value => value / normalLength));
                uvs.push((uvs[a * 2] + uvs[b * 2]) / 2, (uvs[a * 2 + 1] + uvs[b * 2 + 1]) / 2);
                const tangent = [0, 1, 2].map(axis => tangents[a * 4 + axis] + tangents[b * 4 + axis]);
                const tangentLength = Math.hypot(...tangent) || 1;
                tangents.push(...tangent.map(value => value / tangentLength), tangents[a * 4 + 3]);
                midpoints.set(key, index);
                return index;
            };
            for (let triangle = 0; triangle + 2 < indices.length; triangle += 3) {
                const a = indices[triangle], b = indices[triangle + 1], c = indices[triangle + 2];
                const ab = midpoint(a, b), bc = midpoint(b, c), ca = midpoint(c, a);
                next.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca);
            }
            indices = next;
        }
        return new Geometry3D({ positions, normals, uvs, tangents, indices });
    }
}

function normalizeIndices(indices) {
    if (!indices) return null;
    if (indices instanceof Uint16Array || indices instanceof Uint32Array) return indices;

    // Avoid spreading large index buffers into Math.max; complex models can
    // contain hundreds of thousands of indices.
    let max = 0;
    for (let index = 0; index < indices.length; index++) {
        const value = Number(indices[index]);
        if (!Number.isInteger(value) || value < 0) {
            throw new Error("Geometry3D indices must contain non-negative integers.");
        }
        max = Math.max(max, value);
    }

    return max > 65535 ? new Uint32Array(indices) : new Uint16Array(indices);
}
