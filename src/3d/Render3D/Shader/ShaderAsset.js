/**
 * A `.gfshader` asset: one self-contained JSON file with the shader's metadata, its exposed
 * properties, the editor's node graph (opaque to the runtime) and the generated GLSL of both stages.
 *
 * ```json
 * { "format": "gameforge.shader", "version": 1, "name": "Mossy rock", "domain": "surface",
 *   "properties": [{ "name": "uTint", "type": "color", "default": [1, 1, 1, 1] },
 *                  { "name": "uNormalMap", "type": "texture", "default": "normal" }],
 *   "render": { "transparent": false, "blend": "alpha", "cull": "back", "subdivision": 0, "toonBands": 0 },
 *   "graph": { "nodes": [], "links": [] },
 *   "glsl": { "vertex": "…optional…", "fragment": "#version 300 es\n…#include <gf_surface>…" } }
 * ```
 *
 * Domains: `surface` (lit by the scene's lights through `gf_surface`), `unlit` (fog only) and `post`
 * (a full-screen pass over the rendered frame, see `WebGL3DRenderer.SetPostProcess`). A missing
 * vertex stage uses the standard vertex (`gf_vertex`) or, for `post`, a full-screen triangle.
 * GLSL may use `#include <gf_…>` chunks of `ShaderLibrary`; the renderer expands them.
 *
 * `render.toonBands` (0, or 2–8) quantizes the scene lighting of a `surface` shader into that many
 * flat bands, exactly like `ToonMaterial` (materials may change it at runtime, see `ShaderMaterial`).
 */
export class ShaderAsset {
    static FORMAT = "gameforge.shader";
    static VERSION = 1;
    static DOMAINS = Object.freeze(["surface", "unlit", "post"]);
    static PROPERTY_TYPES = Object.freeze(["float", "int", "bool", "vec2", "vec3", "vec4", "color", "texture"]);
    /** Built-in texture values a texture property may name instead of an image. */
    static TEXTURES = Object.freeze(["white", "black", "gray", "normal"]);

    /**
     * Reads and validates a `.gfshader` document.
     * @param {string|Object|ShaderAsset} input - JSON text, the parsed object, or an asset (returned as is).
     * @param {Object} [options]
     * @param {string} [options.name] - Name used when the document has none (e.g. the file name).
     * @returns {ShaderAsset}
     */
    static Parse(input, { name } = {}) {
        if (input instanceof ShaderAsset) return input;
        let data = input;
        if (typeof input === "string") {
            try { data = JSON.parse(input); }
            catch (error) { throw new Error(`.gfshader${name ? ` "${name}"` : ""}: not valid JSON (${error.message}).`); }
        }
        return new ShaderAsset(data, { name });
    }

    /** True when a value looks like a `.gfshader` document (format tag). */
    static IsShaderDocument(value) {
        if (typeof value === "string") {
            const head = value.slice(0, 400);
            return head.trimStart().startsWith("{") && head.includes(ShaderAsset.FORMAT);
        }
        return value?.format === ShaderAsset.FORMAT;
    }

    constructor(data, { name } = {}) {
        const label = data?.name ?? name;
        const fail = message => { throw new Error(`.gfshader${label ? ` "${label}"` : ""}: ${message}`); };
        if (!data || typeof data !== "object" || Array.isArray(data)) fail("expected a JSON object.");
        if (data.format !== ShaderAsset.FORMAT) fail(`format must be "${ShaderAsset.FORMAT}".`);
        if (data.version !== ShaderAsset.VERSION) fail(`unsupported version ${data.version} (expected ${ShaderAsset.VERSION}).`);
        const domain = data.domain ?? "surface";
        if (!ShaderAsset.DOMAINS.includes(domain)) fail(`domain must be one of ${ShaderAsset.DOMAINS.join(", ")}.`);
        const glsl = data.glsl ?? {};
        if (typeof glsl.fragment !== "string" || !glsl.fragment.trim()) fail("glsl.fragment is missing.");
        if (glsl.vertex != null && typeof glsl.vertex !== "string") fail("glsl.vertex must be a string.");

        this.name = String(data.name ?? name ?? "Shader");
        this.domain = domain;
        this.fragment = glsl.fragment;
        this.vertex = glsl.vertex?.trim() ? glsl.vertex : null;
        const properties = data.properties ?? [];
        if (!Array.isArray(properties)) fail("properties must be an array.");
        const seen = new Set();
        this.properties = Object.freeze(properties.map(property => {
            const normalized = normalizeProperty(property, fail);
            if (seen.has(normalized.name)) fail(`property ${normalized.name} is declared twice.`);
            seen.add(normalized.name);
            return normalized;
        }));
        const render = data.render ?? {};
        const cull = render.cull ?? "back";
        if (!["back", "front", "none"].includes(cull)) fail('render.cull must be "back", "front" or "none".');
        const subdivision = render.subdivision ?? 0;
        if (!Number.isInteger(subdivision) || subdivision < 0 || subdivision > 4) fail("render.subdivision must be an integer from 0 to 4.");
        const blend = render.blend ?? "alpha";
        if (!["alpha", "additive"].includes(blend)) fail('render.blend must be "alpha" or "additive".');
        const toonBands = render.toonBands ?? 0;
        if (!Number.isInteger(toonBands) || toonBands === 1 || toonBands < 0 || toonBands > 8) fail("render.toonBands must be 0 (smooth lighting) or an integer from 2 to 8.");
        this.render = Object.freeze({
            transparent: Boolean(render.transparent),
            cull,
            blend,
            depthWrite: render.depthWrite ?? !render.transparent,
            subdivision,
            toonBands,
        });
        this.graph = data.graph ?? null;
        this.description = typeof data.description === "string" ? data.description : "";
        Object.freeze(this);
    }

    /** The declared property, or undefined. */
    GetProperty(name) {
        return this.properties.find(property => property.name === name);
    }

    /** A copy of the document as JSON data (graph included). */
    ToJSON() {
        return {
            format: ShaderAsset.FORMAT,
            version: ShaderAsset.VERSION,
            name: this.name,
            domain: this.domain,
            ...(this.description ? { description: this.description } : {}),
            properties: this.properties.map(property => ({ ...property, default: cloneValue(property.default) })),
            render: renderJSON(this.render),
            ...(this.graph ? { graph: this.graph } : {}),
            glsl: { ...(this.vertex ? { vertex: this.vertex } : {}), fragment: this.fragment },
        };
    }
}

/** Render settings as written to a .gfshader (the default alpha blend is left out). */
function renderJSON({ blend, ...render }) {
    return blend === "additive" ? { ...render, blend } : render;
}

const SIZES = { float: 1, int: 1, bool: 1, vec2: 2, vec3: 3, vec4: 4, color: 4 };
const DEFAULTS = { float: 0, int: 0, bool: false, vec2: [0, 0], vec3: [0, 0, 0], vec4: [0, 0, 0, 0], color: [1, 1, 1, 1], texture: "white" };

/**
 * Checks a property value against its type; returns the normalized value (colors get alpha 1).
 * @param {{type: string, name: string}} property
 * @param {*} value
 * @returns {*}
 */
export function NormalizeShaderValue(property, value) {
    const { type, name } = property;
    if (type === "texture") {
        if (value == null || value === "") return null;
        return value;
    }
    if (type === "bool") return Boolean(value);
    if (type === "float" || type === "int") {
        const number = Number(value);
        if (!Number.isFinite(number)) throw new RangeError(`Shader property ${name}: expected a number.`);
        return type === "int" ? Math.trunc(number) : number;
    }
    const size = SIZES[type];
    const list = typeof value === "string" && type === "color" ? hexColor(value, name) : Array.from(value ?? [], Number);
    if (type === "color" && list.length === 3) list.push(1);
    if (list.length !== size || !list.every(Number.isFinite)) {
        throw new RangeError(`Shader property ${name}: expected ${size} numbers.`);
    }
    return list;
}

function normalizeProperty(property, fail) {
    if (!property || typeof property !== "object") fail("each property must be an object.");
    const { name, type } = property;
    if (typeof name !== "string" || !/^[A-Za-z_]\w*$/.test(name) || name.startsWith("gl_")) fail(`invalid property name ${JSON.stringify(name)}.`);
    if (!ShaderAsset.PROPERTY_TYPES.includes(type)) fail(`property ${name}: type must be one of ${ShaderAsset.PROPERTY_TYPES.join(", ")}.`);
    let value;
    try { value = NormalizeShaderValue({ name, type }, property.default ?? DEFAULTS[type]); }
    catch (error) { fail(error.message); }
    if (type === "texture" && typeof value === "string" && !ShaderAsset.TEXTURES.includes(value) && !/^[\w./ -]+$/.test(value)) {
        fail(`property ${name}: texture default must be ${ShaderAsset.TEXTURES.join(", ")} or an image name.`);
    }
    const result = { name, type, default: value };
    if (typeof property.label === "string") result.label = property.label;
    for (const key of ["min", "max", "step"]) {
        if (property[key] == null) continue;
        if (!Number.isFinite(property[key])) fail(`property ${name}: ${key} must be a number.`);
        result[key] = property[key];
    }
    return Object.freeze(result);
}

function hexColor(text, name) {
    const match = /^#?([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(text.trim());
    if (!match) throw new RangeError(`Shader property ${name}: expected a #rrggbb color.`);
    const channels = (match[1] + (match[2] ?? "ff")).match(/../g).map(pair => parseInt(pair, 16) / 255);
    return channels;
}

function cloneValue(value) {
    return Array.isArray(value) ? [...value] : value;
}
