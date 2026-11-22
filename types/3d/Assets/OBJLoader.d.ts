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
    static Load(url: string): Promise<any[]>;
}
