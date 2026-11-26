/**
 * Maps a scene's runtime components onto the runtime classes, one to one: each
 * `node.components.<Name>` becomes `new <Name>(values, { target, … })`, the class of the same
 * name, and each `UICanvas` node becomes `new UICanvas(values, { elements })` with its
 * `UIElement` nodes. Nothing here is scene-only: games use the same classes directly in code,
 * with the same values.
 *
 * The caller supplies what depends on the renderer: `target(node)` (the node's runtime object),
 * `particles(emitter)` (an emitter's renderer) and `ui(canvas)` (a canvas's renderer).
 * `Level3D.BuildFromScene`, `SceneSystems2D.Attach` and the editor's preview do.
 *
 * @example
 * const systems = SceneSystems.Attach(level, scene, { target: node => objects[node.id] });
 * systems.Find("hud").canvas.Set("score", 10);
 */
export class SceneSystems {
    /** Node types of the in-game UI. */
    static UI_TYPES: readonly string[];
    /** Component name → runtime class (the name is the class name). */
    static COMPONENTS: Readonly<{
        AnimationPlayer: typeof AnimationPlayer;
        ParticleEmitter: typeof ParticleEmitter;
        AudioSource: typeof AudioSource;
    }>;
    /** Where each component's system is listed in the returned set ([per-node slot, list]). */
    static SLOTS: Readonly<{
        AnimationPlayer: string[];
        ParticleEmitter: string[];
        AudioSource: string[];
    }>;
    /**
     * @param {any} level - Receives every system through `AddEntity` (null: not added).
     * @param {SceneDocument|Object} document - The scene (document or JSON).
     * @param {Object} [options]
     * @param {((node: Object) => any)|null} [options.target] - A node's runtime object (see Targets.js).
     *   Emitters and audio of a node without one use its position in the scene.
     * @param {((emitter: ParticleEmitter) => any)|null} [options.particles] - Creates an emitter's renderer.
     * @param {((canvas: UICanvas) => any)|null} [options.ui] - Creates a canvas's renderer
     *   (default: UIRenderer2D on the level's UI screen).
     * @param {any} [options.audio] - AudioManager (default: the level's).
     * @param {any} [options.assets] - AssetManager (default: the level's).
     */
    static Attach(level: any, document: SceneDocument | any, { target, particles, ui, audio, assets }?: {
        target?: ((node: any) => any) | null;
        particles?: ((emitter: ParticleEmitter) => any) | null;
        ui?: ((canvas: UICanvas) => any) | null;
        audio?: any;
        assets?: any;
    }): SceneSystemsSet;
    /**
     * The `UIElement` descendants of a canvas node, parents first, as UICanvas `elements`.
     * @param {SceneDocument} doc @param {Object} canvas
     */
    static UIElements(doc: SceneDocument, canvas: any): any[];
}
import { AnimationPlayer } from "../Animation/AnimationPlayer.js";
import { ParticleEmitter } from "../Particles/ParticleEmitter.js";
import { AudioSource } from "../Audio/AudioSource.js";
import { SceneDocument } from "./SceneDocument.js";
import { UICanvas } from "../UI/UICanvas.js";
/** What `SceneSystems.Attach` started, by kind and by node id. */
declare class SceneSystemsSet {
    /** @type {AudioSource[]} */ audio: AudioSource[];
    /** @type {ParticleEmitter[]} */ emitters: ParticleEmitter[];
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
    /** Every system. */
    All(): (AudioSource | AnimationPlayer | ParticleEmitter | UICanvas)[];
}
export {};
