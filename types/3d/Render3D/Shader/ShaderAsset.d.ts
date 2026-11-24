/**
 * Checks a property value against its type; returns the normalized value (colors get alpha 1).
 * @param {{type: string, name: string}} property
 * @param {*} value
 * @returns {*}
 */
export function NormalizeShaderValue(property: {
    type: string;
    name: string;
}, value: any): any;
/**
 * A `.gfshader` asset: one self-contained JSON file with the shader's metadata, its exposed
 * properties, the editor's node graph (opaque to the runtime) and the generated GLSL of both stages.
 *
 * ```json
 * { "format": "gameforge.shader", "version": 1, "name": "Mossy rock", "domain": "surface",
 *   "properties": [{ "name": "uTint", "type": "color", "default": [1, 1, 1, 1] },
 *                  { "name": "uNormalMap", "type": "texture", "default": "normal" }],
 *   "render": { "transparent": false, "cull": "back", "subdivision": 0 },
 *   "graph": { "nodes": [], "links": [] },
 *   "glsl": { "vertex": "…optional…", "fragment": "#version 300 es\n…#include <gf_surface>…" } }
 * ```
 *
 * Domains: `surface` (lit by the scene's lights through `gf_surface`), `unlit` (fog only) and `post`
 * (a full-screen pass over the rendered frame, see `WebGL3DRenderer.SetPostProcess`). A missing
 * vertex stage uses the standard vertex (`gf_vertex`) or, for `post`, a full-screen triangle.
 * GLSL may use `#include <gf_…>` chunks of `ShaderLibrary`; the renderer expands them.
 */
export class ShaderAsset {
    static FORMAT: string;
    static VERSION: number;
    static DOMAINS: readonly string[];
    static PROPERTY_TYPES: readonly string[];
    /** Built-in texture values a texture property may name instead of an image. */
    static TEXTURES: readonly string[];
    /**
     * Reads and validates a `.gfshader` document.
     * @param {string|Object|ShaderAsset} input - JSON text, the parsed object, or an asset (returned as is).
     * @param {Object} [options]
     * @param {string} [options.name] - Name used when the document has none (e.g. the file name).
     * @returns {ShaderAsset}
     */
    static Parse(input: string | any | ShaderAsset, { name }?: {
        name?: string;
    }): ShaderAsset;
    /** True when a value looks like a `.gfshader` document (format tag). */
    static IsShaderDocument(value: any): boolean;
    constructor(data: any, { name }?: {});
    name: string;
    domain: any;
    fragment: any;
    vertex: any;
    properties: any;
    render: Readonly<{
        transparent: boolean;
        cull: any;
        depthWrite: any;
        subdivision: any;
    }>;
    graph: any;
    description: any;
    /** The declared property, or undefined. */
    GetProperty(name: any): any;
    /** A copy of the document as JSON data (graph included). */
    ToJSON(): {
        glsl: {
            fragment: any;
            vertex?: any;
        };
        graph?: any;
        properties: any;
        render: {
            transparent: boolean;
            cull: any;
            depthWrite: any;
            subdivision: any;
        };
        description?: any;
        format: string;
        version: number;
        name: string;
        domain: any;
    };
}
