// @ts-check
/**
 * Schemas of the runtime components a scene node can carry (`node.components.<Name>`):
 * field types, defaults and ranges. The runtime reads its settings through `Resolve`, and the
 * editor builds its inspector from `Fields`, so a field exists in one place only.
 *
 * Field types: number, range (slider), boolean, string, select, color (RGBA 0..1), vec2, vec3,
 * audio / image (resource names), gradient ([[t, [r,g,b,a]], …]), curve ([[t, value], …]) and json.
 *
 * @example
 * const settings = SceneComponents.Resolve("ParticleEmitter", node.components.ParticleEmitter);
 */
export class SceneComponents {
    static ANCHORS = Object.freeze(["top-left", "top", "top-right", "left", "center", "right", "bottom-left", "bottom", "bottom-right", "stretch"]);

    static SCHEMAS = Object.freeze({
        AudioSource: Object.freeze({
            label: "Audio Source",
            fields: Object.freeze([
                { key: "clip", type: "audio", default: "" },
                { key: "mode", type: "select", options: ["sound", "music"], default: "sound" },
                { key: "volume", type: "range", min: 0, max: 1, step: 0.01, default: 1 },
                { key: "pitch", type: "range", min: 0.25, max: 4, step: 0.01, default: 1 },
                { key: "loop", type: "boolean", default: false },
                { key: "playOnStart", type: "boolean", default: true },
                { key: "fade", type: "number", min: 0, max: 30, step: 0.1, default: 1 },
                { key: "spatial", type: "boolean", default: false },
                { key: "minDistance", type: "number", min: 0, step: 0.5, default: 1 },
                { key: "maxDistance", type: "number", min: 0, step: 1, default: 30 },
            ].map(Object.freeze)),
        }),
        ParticleEmitter: Object.freeze({
            label: "Particle Emitter",
            fields: Object.freeze([
                { key: "playOnStart", type: "boolean", default: true },
                { key: "loop", type: "boolean", default: true },
                { key: "duration", type: "number", min: 0.05, max: 600, step: 0.1, default: 2 },
                { key: "rate", type: "number", min: 0, max: 5000, step: 1, default: 20 },
                { key: "burst", type: "number", min: 0, max: 5000, step: 1, default: 0 },
                { key: "maxParticles", type: "number", min: 1, max: 5000, step: 1, default: 200 },
                { key: "lifetime", type: "vec2", min: 0.01, step: 0.05, default: [0.8, 1.6] },
                { key: "speed", type: "vec2", min: 0, step: 0.1, default: [1, 3] },
                { key: "direction", type: "vec3", step: 0.1, default: [0, 1, 0] },
                { key: "spread", type: "range", min: 0, max: 180, step: 1, default: 25 },
                { key: "gravity", type: "vec3", step: 0.1, default: [0, -2, 0] },
                { key: "shape", type: "select", options: ["point", "sphere", "box"], default: "point" },
                { key: "shapeSize", type: "vec3", min: 0, step: 0.1, default: [0.5, 0.5, 0.5] },
                { key: "space", type: "select", options: ["world", "local"], default: "world" },
                { key: "colorOverLife", type: "gradient", default: [[0, [1, 0.85, 0.4, 1]], [1, [1, 0.3, 0.1, 0]]] },
                { key: "sizeOverLife", type: "curve", default: [[0, 0.25], [1, 0.05]] },
                { key: "blend", type: "select", options: ["alpha", "additive"], default: "additive" },
                { key: "sprite", type: "select", options: ["soft", "circle", "square"], default: "soft" },
                { key: "seed", type: "number", min: 0, step: 1, default: 0 },
            ].map(Object.freeze)),
        }),
        UICanvas: Object.freeze({
            label: "UI Canvas",
            fields: Object.freeze([
                { key: "referenceSize", type: "vec2", min: 1, step: 1, default: [960, 540] },
                { key: "scaleMode", type: "select", options: ["fit", "none"], default: "fit" },
                { key: "fontFamily", type: "string", default: "system-ui, sans-serif" },
                { key: "visible", type: "boolean", default: true },
            ].map(Object.freeze)),
        }),
        UIElement: Object.freeze({
            label: "UI Element",
            fields: Object.freeze([
                { key: "kind", type: "select", options: ["panel", "text", "progress", "button", "image"], default: "text" },
                { key: "anchor", type: "select", options: this.ANCHORS, default: "top-left" },
                { key: "offset", type: "vec2", step: 1, default: [16, 16] },
                { key: "size", type: "vec2", min: 0, step: 1, default: [200, 40] },
                { key: "text", type: "string", default: "" },
                { key: "align", type: "select", options: ["left", "center", "right"], default: "left" },
                { key: "fontSize", type: "number", min: 4, max: 200, step: 1, default: 18 },
                { key: "color", type: "color", default: [1, 1, 1, 1] },
                { key: "background", type: "color", default: [0.06, 0.08, 0.12, 0.72] },
                { key: "radius", type: "number", min: 0, max: 200, step: 1, default: 6 },
                { key: "padding", type: "number", min: 0, max: 200, step: 1, default: 8 },
                { key: "value", type: "string", default: "1" },
                { key: "max", type: "number", min: 0, step: 1, default: 1 },
                { key: "fill", type: "color", default: [0.35, 0.8, 0.45, 1] },
                { key: "action", type: "string", default: "" },
                { key: "image", type: "image", default: "" },
                { key: "visible", type: "boolean", default: true },
            ].map(Object.freeze)),
        }),
        AnimationPlayer: Object.freeze({
            label: "Animation Player",
            fields: Object.freeze([
                { key: "initial", type: "string", default: "" },
                { key: "playOnStart", type: "boolean", default: true },
                { key: "speed", type: "range", min: 0, max: 4, step: 0.05, default: 1 },
                { key: "clips", type: "json", default: [] },
                { key: "transitions", type: "json", default: [] },
                { key: "parameters", type: "json", default: {} },
            ].map(Object.freeze)),
        }),
    });

    /** Names of the components with a schema, in menu order. */
    static Names() {
        return Object.keys(this.SCHEMAS);
    }

    /** @param {string} name */
    static Has(name) {
        return Object.hasOwn(this.SCHEMAS, name);
    }

    /** @param {string} name @returns {readonly any[]} */
    static Fields(name) {
        return this.SCHEMAS[name]?.fields ?? [];
    }

    /** Default values of a component (fresh copies). @param {string} name */
    static Defaults(name) {
        return Object.fromEntries(this.Fields(name).map(field => [field.key, structuredClone(field.default)]));
    }

    /**
     * A component's values over its defaults, numbers clamped to the schema's range and select
     * values checked; unknown keys are kept (games may add their own).
     * @param {string} name
     * @param {Record<string, any>} [values]
     */
    static Resolve(name, values = {}) {
        const result = { ...this.Defaults(name), ...structuredClone(values ?? {}) };
        for (const field of this.Fields(name)) {
            const value = result[field.key];
            if ((field.type === "number" || field.type === "range") && typeof value === "number") {
                result[field.key] = Math.min(field.max ?? Infinity, Math.max(field.min ?? -Infinity, value));
            } else if ((field.type === "number" || field.type === "range") && typeof value !== "number") {
                result[field.key] = structuredClone(field.default);
            } else if (field.type === "select" && !field.options.includes(value)) {
                result[field.key] = field.default;
            } else if (field.type === "boolean") {
                result[field.key] = Boolean(value);
            } else if ((field.type === "vec2" || field.type === "vec3") && !(Array.isArray(value) && value.length >= (field.type === "vec2" ? 2 : 3))) {
                result[field.key] = structuredClone(field.default);
            }
        }
        return result;
    }
}

