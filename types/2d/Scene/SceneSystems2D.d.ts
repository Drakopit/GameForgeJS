/**
 * Starts a 2D scene's systems (SceneSystems) for a 2D level: particles draw on the level's
 * screen, animations and emitters follow the level's objects (by node id or name), and UI
 * canvases draw on the screen above the game.
 *
 * @example
 * const systems = SceneSystems2D.Attach(this, this.context.assets.jsons.first_scene, { objects: { player: this.player } });
 * systems.Find("hud").canvas.Set("score", 0);
 */
export class SceneSystems2D {
    /**
     * @param {any} level @param {any} document - Scene (document or JSON).
     * @param {{screen?: any, objects?: Record<string, any>, assets?: any, audio?: any}} [options]
     *   `objects`: the level's runtime objects by node id or name (the systems' targets).
     */
    static Attach(level: any, document: any, { screen, objects, assets, audio }?: {
        screen?: any;
        objects?: Record<string, any>;
        assets?: any;
        audio?: any;
    }): {
        audio: import("../index.js").AudioSource[];
        emitters: import("../index.js").ParticleEmitter[];
        canvases: import("../index.js").UICanvas[];
        animations: import("../index.js").AnimationPlayer[];
        byId: Map<string, {
            audio?: import("../index.js").AudioSource;
            emitter?: import("../index.js").ParticleEmitter;
            canvas?: import("../index.js").UICanvas;
            animation?: import("../index.js").AnimationPlayer;
        }>;
        Find(id: string): {
            audio?: import("../index.js").AudioSource;
            emitter?: import("../index.js").ParticleEmitter;
            canvas?: import("../index.js").UICanvas;
            animation?: import("../index.js").AnimationPlayer;
        };
        All(): (import("../index.js").AudioSource | import("../index.js").AnimationPlayer | import("../index.js").ParticleEmitter | import("../index.js").UICanvas)[];
    };
}
