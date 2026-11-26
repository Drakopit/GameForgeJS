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
    static Attach(level: any, document: any, { screen, objects, position, assets, audio }?: {
        screen?: any;
        objects?: Record<string, any>;
        position?: ((node: any) => number[]) | null;
        assets?: any;
        audio?: any;
    }): {
        audio: import("../index.js").AudioSource[];
        emitters: import("../index.js").ParticleEmitter[];
        renderers: any[];
        canvases: import("../index.js").UICanvas[];
        animations: AnimationPlayer[];
        byId: Map<string, {
            audio?: import("../index.js").AudioSource;
            emitter?: import("../index.js").ParticleEmitter;
            canvas?: import("../index.js").UICanvas;
            animation?: AnimationPlayer;
        }>;
        Find(id: string): {
            audio?: import("../index.js").AudioSource;
            emitter?: import("../index.js").ParticleEmitter;
            canvas?: import("../index.js").UICanvas;
            animation?: AnimationPlayer;
        };
        All(): any[];
    };
}
import { AnimationPlayer } from "../../core/Animation/AnimationPlayer.js";
