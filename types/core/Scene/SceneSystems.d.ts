/**
 * Starts the runtime systems a scene declares, as level entities: `AudioSource`,
 * `ParticleEmitter`, `Animation` components on any node, and `UICanvas` nodes with their
 * `UIElement` descendants. `Level3D.BuildFromScene` and `SceneSystems2D.Attach` call it with
 * the right particle renderer and node bindings; the editor uses the same classes to preview.
 *
 * @example
 * const systems = SceneSystems.Attach(level, document, { particles: emitter => new ParticleRenderer2D(emitter, { screen }) });
 * systems.Find("hud").canvas.Set("score", 10);
 */
export class SceneSystems {
    /** Node types of the in-game UI. */
    static UI_TYPES: readonly string[];
    /**
     * @param {any} level - Receives the systems through `AddEntity` (null: not added).
     * @param {SceneDocument|Object} document - The scene (document or JSON).
     * @param {Object} [options]
     * @param {any} [options.audio] - AudioManager (default: the game's `audio` service).
     * @param {any} [options.assets] - AssetManager (default: the level's).
     * @param {((emitter: ParticleEmitter, node: Object) => any)|null} [options.particles] - Creates the emitter's renderer.
     * @param {((node: Object) => number[]|null)|null} [options.position] - A node's live world position.
     * @param {((node: Object) => any)|null} [options.bind] - A node's animation target (see AnimationPlayer.Bind).
     * @param {HTMLElement|null} [options.uiTarget] - The canvas the UI covers.
     * @param {HTMLElement|null} [options.uiHost] - Where the UI layer is added (default: the target's parent).
     * @param {boolean} [options.placeholders] - UI shows unset `{key}` bindings as written (editor preview).
     */
    static Attach(level: any, document: SceneDocument | any, { audio, assets, particles, position, bind, uiTarget, uiHost, placeholders }?: {
        audio?: any;
        assets?: any;
        particles?: ((emitter: ParticleEmitter, node: any) => any) | null;
        position?: ((node: any) => number[] | null) | null;
        bind?: ((node: any) => any) | null;
        uiTarget?: HTMLElement | null;
        uiHost?: HTMLElement | null;
        placeholders?: boolean;
    }): SceneSystemsSet;
    /**
     * The `UIElement` descendants of a canvas node, parents first, ready for `UICanvas`.
     * @param {SceneDocument} doc @param {Object} canvas
     */
    static UIElements(doc: SceneDocument, canvas: any): any[];
}
import { SceneDocument } from "./SceneDocument.js";
import { ParticleEmitter } from "../Particles/ParticleEmitter.js";
/** What `SceneSystems.Attach` started, by kind and by node id. */
declare class SceneSystemsSet {
    /** @type {AudioSource[]} */ audio: AudioSource[];
    /** @type {ParticleEmitter[]} */ emitters: ParticleEmitter[];
    /** @type {any[]} */ renderers: any[];
    /** @type {UICanvas[]} */ canvases: UICanvas[];
    /** @type {AnimationPlayer[]} */ animations: AnimationPlayer[];
    /** @type {Map<string, {audio?: AudioSource, emitter?: ParticleEmitter, canvas?: UICanvas, animation?: AnimationPlayer}>} */
    byId: Map<string, {
        audio?: AudioSource;
        emitter?: ParticleEmitter;
        canvas?: UICanvas;
        animation?: AnimationPlayer;
    }>;
    /** The systems of a node (by id or name). @param {string} id */
    Find(id: string): {
        audio?: AudioSource;
        emitter?: ParticleEmitter;
        canvas?: UICanvas;
        animation?: AnimationPlayer;
    };
    /** Every system, renderers included (for removal). */
    All(): any[];
}
import { AudioSource } from "../Audio/AudioSource.js";
import { UICanvas } from "../UI/UICanvas.js";
import { AnimationPlayer } from "../Animation/AnimationPlayer.js";
export {};
