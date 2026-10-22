/**
 * Minimal Wavefront OBJ asset loader producing mesh-part buffer data.
 *
 * Materials and textures remain game-owned resources loaded separately.
 */
export class OBJLoader {
    /**
     * Downloads and parses one OBJ asset.
     * @param {string} url - OBJ asset URL.
     * @returns {Promise<Object[]>} Parsed model parts for `AssetManager`.
     */
    static async Load(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`OBJLoader: failed to fetch ${url}`);

        const text = await response.text();
        const positions = [], uvs = [], normals = [], indices = [];
        const vertices = [], uvList = [], normalList = [];
        let completeUvs = true;
        let completeNormals = true;

        const resolveIndex = (value, length) => {
            const index = Number(value);
            if (!Number.isInteger(index) || index === 0) return -1;
            return index > 0 ? index - 1 : length + index;
        };

        for (const rawLine of text.split(/\r?\n/)) {
            const line = rawLine.trim();
            if (!line || line.startsWith("#")) continue;

            const parts = line.split(/\s+/);
            if (parts[0] === "v" && parts.length >= 4) {
                const values = parts.slice(1, 4).map(Number);
                if (values.every(Number.isFinite)) vertices.push(values);
                continue;
            }
            if (parts[0] === "vt" && parts.length >= 3) {
                const values = parts.slice(1, 3).map(Number);
                if (values.every(Number.isFinite)) uvList.push(values);
                continue;
            }
            if (parts[0] === "vn" && parts.length >= 4) {
                const values = parts.slice(1, 4).map(Number);
                if (values.every(Number.isFinite)) normalList.push(values);
                continue;
            }
            if (parts[0] !== "f" || parts.length < 4) continue;

            const face = [];
            for (const token of parts.slice(1)) {
                const [positionIndex, uvIndex, normalIndex] = token.split("/");
                const vi = resolveIndex(positionIndex, vertices.length);
                if (vi < 0 || vi >= vertices.length) continue;

                const vertex = vertices[vi];
                const uv = uvIndex ? uvList[resolveIndex(uvIndex, uvList.length)] : null;
                const normal = normalIndex ? normalList[resolveIndex(normalIndex, normalList.length)] : null;
                positions.push(vertex[0], vertex[1], vertex[2]);

                if (uv) uvs.push(uv[0], uv[1]);
                else {
                    completeUvs = false;
                    uvs.push(0, 0);
                }

                if (normal) normals.push(normal[0], normal[1], normal[2]);
                else {
                    completeNormals = false;
                    normals.push(0, 0, 0);
                }

                face.push(positions.length / 3 - 1);
            }

            // Fan triangulation preserves the winding of convex polygon faces.
            for (let index = 1; index + 1 < face.length; index++)
                indices.push(face[0], face[index], face[index + 1]);
        }

        const IndexArray = positions.length / 3 > 65535 ? Uint32Array : Uint16Array;

        return [{
            name: url.split("/").pop(),
            positions: new Float32Array(positions),
            uvs: uvs.length && completeUvs ? new Float32Array(uvs) : null,
            normals: normals.length && completeNormals ? new Float32Array(normals) : null,
            indices: new IndexArray(indices),
            textureImage: null // .obj não embute textura — carregue separado pelo AssetManager
        }];
    }
}
