// @ts-check
import { SceneSystems } from "../../core/Scene/SceneSystems.js";
import { AnimationPlayer } from "../../core/Animation/AnimationPlayer.js";
import { ParticleRenderer2D } from "../Particle/ParticleRenderer2D.js";

/**
 * Starts a 2D scene's systems (animations, particle emitters, audio sources, UI canvases) on a
 * level: particles draw on the level's screen and the UI covers its canvas.
 *
 * @example
 * OnStart(context) {
 *     super.OnStart(context);
 *     this.systems = SceneSystems2D.Attach(this, context.assets.jsons.first_scene, {
 *         objects: { player: this.player }, // nodes your code built (animated through AnimationPlayer.Bind)
 *     });
 * }
 */
export class SceneSystems2D {
    /**
     * @param {any} level
     * @param {any} document - SceneDocument or scene JSON.
     * @param {{screen?: any, objects?: Record<string, any>, position?: ((node: any) => number[])|null, assets?: any, audio?: any}} [options]
     *   `objects`: game objects by node id (or name); animations drive them and emitters follow them.
     */
    static Attach(level, document, { screen = level?.screen ?? null, objects = {}, position = null, assets, audio } = {}) {
        const objectOf = node => objects[node.id] ?? objects[node.name] ?? null;
        return SceneSystems.Attach(level, document, {
            assets, audio,
            particles: emitter => new ParticleRenderer2D(emitter, { screen }),
            position: position ?? (node => {
                const object = objectOf(node);
                return object ? [object.x ?? object.position?.x ?? 0, object.y ?? object.position?.y ?? 0, 0] : null;
            }),
            bind: node => {
                const object = objectOf(node);
                return object ? AnimationPlayer.Bind(object) : null;
            },
            uiTarget: screen?.Canvas ?? null,
        });
    }
}
