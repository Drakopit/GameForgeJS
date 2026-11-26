// @ts-check
import { SceneSystems } from "../../core/Scene/SceneSystems.js";
import { ParticleRenderer2D } from "../Particle/ParticleRenderer2D.js";

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
    static Attach(level, document, { screen = level?.screen ?? null, objects = {}, assets = null, audio = null } = {}) {
        return SceneSystems.Attach(level, document, {
            assets, audio,
            target: node => objects[node.id] ?? objects[node.name] ?? null,
            particles: emitter => new ParticleRenderer2D(emitter, { screen }),
        });
    }
}
