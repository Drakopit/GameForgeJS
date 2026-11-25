/**
 * A material drawn by its own `.gfshader` program (see `ShaderAsset`). Each material keeps its own
 * property values; materials using the same shader share one compiled program.
 *
 * Lit (`surface`) shaders get the scene's lights, shadows and fog through the shared GLSL library,
 * exactly as `StandardMaterial`; a custom vertex stage may displace vertices (shadows follow it).
 *
 * @example
 * const rock = new ShaderMaterial({ shader: assets.GetShader("mossy_rock"), properties: { uTint: "#8a9a6b" } });
 * const same = ShaderMaterial.FromAssets("mossy_rock", { properties: { uMoss: 0.8 } });
 *
 * @param {Object} options
 * @param {ShaderAsset|Object|string} options.shader - The asset, its JSON object or JSON text.
 * @param {Object<string, *>} [options.properties] - Values for declared properties (others throw).
 * @param {string} [options.name] - Display name (defaults to the shader's name).
 * @param {boolean} [options.transparent] - Overrides the shader's render.transparent.
 * @param {boolean} [options.receiveShadow=true] - Whether shadows darken this surface.
 * @param {number} [options.toonBands] - Toon lighting bands (0 = smooth, 2–8); defaults to the shader's render.toonBands.
 */
export class ShaderMaterial extends Material {
    /**
     * Creates a material from a `.gfshader` registered in the AssetManager (resources.json → shaders).
     * @param {string} name - Shader asset name.
     * @param {Object} [options] - ShaderMaterial options (without `shader`).
     * @param {AssetManager} [assets=AssetManager.instance]
     * @returns {ShaderMaterial}
     */
    static FromAssets(name: string, options?: any, assets?: AssetManager): ShaderMaterial;
    constructor({ shader, properties, name, transparent, receiveShadow, toonBands }?: {
        properties?: {};
        receiveShadow?: boolean;
    });
    type: string;
    asset: ShaderAsset;
    receiveShadow: boolean;
    set toonBands(value: number);
    /**
     * Toon lighting bands of a surface shader: 0 for smooth lighting, otherwise 2–8 flat bands.
     * Changing it at runtime is free (it is a uniform).
     */
    get toonBands(): number;
    values: Map<any, any>;
    _toonBands: number;
    set bands(value: number);
    /** Alias of `toonBands`, so code written for `ToonMaterial` (`material.bands = 3`) works unchanged. */
    get bands(): number;
    /** "surface", "unlit" or "post". */
    get domain(): any;
    /**
     * Sets a declared property. Colors accept [r, g, b(, a)] or "#rrggbb"; textures accept a Texture,
     * an image/canvas, a built-in name ("white", "black", "gray", "normal") or an AssetManager image name.
     * @param {string} name
     * @param {*} value
     * @returns {ShaderMaterial} This material.
     */
    SetProperty(name: string, value: any): ShaderMaterial;
    /** The current value of a property. */
    GetProperty(name: any): any;
    /** Restores every property to the shader's default. */
    ResetProperties(): this;
}
import { Material } from "./Material.js";
import { ShaderAsset } from "../Shader/ShaderAsset.js";
import { AssetManager } from "../../../core/Assets/AssetManager.js";
