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
    static ANCHORS: readonly string[];
    static SCHEMAS: Readonly<{
        AudioSource: Readonly<{
            label: "Audio Source";
            fields: readonly Readonly<unknown>[];
        }>;
        ParticleEmitter: Readonly<{
            label: "Particle Emitter";
            fields: readonly Readonly<unknown>[];
        }>;
        UICanvas: Readonly<{
            label: "UI Canvas";
            fields: readonly Readonly<unknown>[];
        }>;
        UIElement: Readonly<{
            label: "UI Element";
            fields: readonly Readonly<unknown>[];
        }>;
        Animation: Readonly<{
            label: "Animation";
            fields: readonly Readonly<unknown>[];
        }>;
    }>;
    /** Names of the components with a schema, in menu order. */
    static Names(): string[];
    /** @param {string} name */
    static Has(name: string): boolean;
    /** @param {string} name @returns {readonly any[]} */
    static Fields(name: string): readonly any[];
    /** Default values of a component (fresh copies). @param {string} name */
    static Defaults(name: string): any;
    /**
     * A component's values over its defaults, numbers clamped to the schema's range and select
     * values checked; unknown keys are kept (games may add their own).
     * @param {string} name
     * @param {Record<string, any>} [values]
     */
    static Resolve(name: string, values?: Record<string, any>): any;
}
