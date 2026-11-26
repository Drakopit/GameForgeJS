// @ts-check
import { AudioSource } from "../Audio/AudioSource.js";
import { AnimationPlayer } from "../Animation/AnimationPlayer.js";
import { ParticleEmitter } from "../Particles/ParticleEmitter.js";
import { UICanvas } from "../UI/UICanvas.js";
import { SceneDocument } from "./SceneDocument.js";

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
    static UI_TYPES = Object.freeze(["UICanvas", "UIElement"]);

    /** Component name → runtime class (the name is the class name). */
    static COMPONENTS = Object.freeze({ AnimationPlayer, ParticleEmitter, AudioSource });

    /** Where each component's system is listed in the returned set ([per-node slot, list]). */
    static SLOTS = Object.freeze({ AnimationPlayer: ["animation", "animations"], ParticleEmitter: ["emitter", "emitters"], AudioSource: ["audio", "audio"] });

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
    static Attach(level, document, { target = null, particles = null, ui = null, audio = null, assets = null } = {}) {
        const doc = document instanceof SceneDocument ? document : new SceneDocument(document);
        const systems = new SceneSystemsSet();
        const add = (entity, node, slot, list) => {
            systems[list].push(entity);
            systems.byId.set(node.id, { ...(systems.byId.get(node.id) ?? {}), [slot]: entity });
            level?.AddEntity?.(entity);
        };
        for (const node of doc.Nodes()) {
            const components = doc.Components(node);
            const name = node.name ?? node.id;
            const object = target?.(node) ?? null;
            for (const [component, Type] of Object.entries(SceneSystems.COMPONENTS)) {
                if (!components[component]) continue;
                // Animation acts on the node's object; emitters and audio only need a position.
                const where = Type === AnimationPlayer ? object : object ?? doc.WorldPosition(node);
                const [slot, list] = SceneSystems.SLOTS[component];
                add(new Type(components[component], { target: where, renderer: particles, audio, assets, name }), node, slot, list);
            }
            if (node.type === "UICanvas") {
                add(new UICanvas(components.UICanvas ?? {}, { elements: SceneSystems.UIElements(doc, node), renderer: ui, name }), node, "canvas", "canvases");
            }
        }
        return systems;
    }

    /**
     * The `UIElement` descendants of a canvas node, parents first, as UICanvas `elements`.
     * @param {SceneDocument} doc @param {Object} canvas
     */
    static UIElements(doc, canvas) {
        const result = [];
        const visit = parentId => {
            for (const child of doc.Nodes({ parent: parentId })) {
                if (child.type !== "UIElement") continue;
                result.push({ id: child.id, name: child.name ?? child.id, parent: child.parent === canvas.id ? null : child.parent, settings: doc.Components(child).UIElement ?? {} });
                visit(child.id);
            }
        };
        visit(canvas.id);
        return result;
    }
}

/** What `SceneSystems.Attach` started, by kind and by node id. */
class SceneSystemsSet {
    constructor() {
        /** @type {AudioSource[]} */ this.audio = [];
        /** @type {ParticleEmitter[]} */ this.emitters = [];
        /** @type {UICanvas[]} */ this.canvases = [];
        /** @type {AnimationPlayer[]} */ this.animations = [];
        /** @type {Map<string, {audio?: AudioSource, emitter?: ParticleEmitter, canvas?: UICanvas, animation?: AnimationPlayer}>} */
        this.byId = new Map();
    }

    /** The systems of a node (by id or name). @param {string} id */
    Find(id) {
        if (this.byId.has(id)) return this.byId.get(id) ?? {};
        const named = this.All().find(entity => entity.name === id);
        if (!named) return {};
        for (const entry of this.byId.values()) if (Object.values(entry).includes(named)) return entry;
        return {};
    }

    /** Every system. */
    All() {
        return [...this.animations, ...this.emitters, ...this.audio, ...this.canvases];
    }
}
