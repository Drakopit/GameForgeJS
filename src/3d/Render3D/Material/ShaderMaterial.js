import { AssetManager } from "../../../core/Assets/AssetManager.js";
import { ShaderAsset, NormalizeShaderValue } from "../Shader/ShaderAsset.js";
import { Material } from "./Material.js";

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
    constructor({ shader, properties = {}, name, transparent, receiveShadow = true, toonBands } = {}) {
        const asset = ShaderAsset.Parse(shader);
        super({ name: name ?? asset.name, transparent: transparent ?? asset.render.transparent });
        this.type = "shader";
        this.asset = asset;
        this.receiveShadow = receiveShadow;
        this.toonBands = toonBands ?? asset.render.toonBands;
        this.values = new Map(asset.properties.map(property => [property.name, cloneValue(property.default)]));
        for (const [key, value] of Object.entries(properties ?? {})) this.SetProperty(key, value);
    }

    /**
     * Toon lighting bands of a surface shader: 0 for smooth lighting, otherwise 2–8 flat bands.
     * Changing it at runtime is free (it is a uniform).
     */
    get toonBands() {
        return this._toonBands;
    }

    set toonBands(value) {
        const bands = Math.round(Number(value) || 0);
        this._toonBands = bands < 2 ? 0 : Math.min(8, bands);
    }

    /** Alias of `toonBands`, so code written for `ToonMaterial` (`material.bands = 3`) works unchanged. */
    get bands() {
        return this.toonBands;
    }

    set bands(value) {
        this.toonBands = value;
    }

    /** "surface", "unlit" or "post". */
    get domain() {
        return this.asset.domain;
    }

    /**
     * Creates a material from a `.gfshader` registered in the AssetManager (resources.json → shaders).
     * @param {string} name - Shader asset name.
     * @param {Object} [options] - ShaderMaterial options (without `shader`).
     * @param {AssetManager} [assets=AssetManager.instance]
     * @returns {ShaderMaterial}
     */
    static FromAssets(name, options = {}, assets = AssetManager.instance) {
        const source = assets?.GetShader?.(name) ?? assets?.shaders?.[name];
        if (source == null) throw new Error(`ShaderMaterial: shader asset "${name}" is not loaded.`);
        return new ShaderMaterial({ ...options, shader: ShaderAsset.Parse(source, { name }) });
    }

    /**
     * Sets a declared property. Colors accept [r, g, b(, a)] or "#rrggbb"; textures accept a Texture,
     * an image/canvas, a built-in name ("white", "black", "gray", "normal") or an AssetManager image name.
     * @param {string} name
     * @param {*} value
     * @returns {ShaderMaterial} This material.
     */
    SetProperty(name, value) {
        const property = this.asset.GetProperty(name);
        if (!property) throw new RangeError(`ShaderMaterial "${this.name}": no property ${name} (declared: ${this.asset.properties.map(item => item.name).join(", ") || "none"}).`);
        this.values.set(name, NormalizeShaderValue(property, value));
        return this;
    }

    /** The current value of a property. */
    GetProperty(name) {
        return this.values.get(name);
    }

    /** Restores every property to the shader's default. */
    ResetProperties() {
        for (const property of this.asset.properties) this.values.set(property.name, cloneValue(property.default));
        return this;
    }
}

function cloneValue(value) {
    return Array.isArray(value) ? [...value] : value;
}
