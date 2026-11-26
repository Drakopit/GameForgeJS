// @ts-check
import { AudioSource } from "../Audio/AudioSource.js";
import { AnimationPlayer } from "../Animation/AnimationPlayer.js";
import { ParticleEmitter } from "../Particles/ParticleEmitter.js";
import { UICanvas } from "../UI/UICanvas.js";
import { SceneDocument } from "./SceneDocument.js";

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
    static UI_TYPES = Object.freeze(["UICanvas", "UIElement"]);

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
    static Attach(level, document, { audio, assets, particles = null, position = null, bind = null, uiTarget = null, uiHost = null, placeholders = false } = {}) {
        const doc = document instanceof SceneDocument ? document : new SceneDocument(document);
        assets ??= level?.context?.assets ?? null;
        audio ??= level?.context?.services?.get?.("audio") ?? assets?.audio ?? null;
        // A node the game did not place (position returns null) stays where the scene put it.
        const where = node => position?.(node) ?? doc.WorldPosition(node);
        const systems = new SceneSystemsSet();
        const add = (entity, node, kind) => {
            systems[kind].push(entity);
            const entry = systems.byId.get(node.id) ?? {};
            entry[kind === "audio" ? "audio" : kind === "emitters" ? "emitter" : kind === "canvases" ? "canvas" : "animation"] = entity;
            systems.byId.set(node.id, entry);
            level?.AddEntity?.(entity);
            return entity;
        };
        for (const node of doc.Nodes()) {
            const components = doc.Components(node);
            const name = node.name ?? node.id;
            if (components.Animation) {
                add(new AnimationPlayer(components.Animation, { target: bind?.(node) ?? null, name }), node, "animations");
            }
            if (components.ParticleEmitter) {
                const emitter = add(new ParticleEmitter(components.ParticleEmitter, { origin: () => where(node), name }), node, "emitters");
                const renderer = particles?.(emitter, node);
                if (renderer) { systems.renderers.push(renderer); level?.AddEntity?.(renderer); }
            }
            if (components.AudioSource) {
                add(new AudioSource(components.AudioSource, { audio, assets, position: () => where(node), name }), node, "audio");
            }
            if (node.type === "UICanvas") {
                const elements = SceneSystems.UIElements(doc, node);
                add(new UICanvas(components.UICanvas ?? {}, { elements, target: uiTarget, host: uiHost, assets, name, placeholders }), node, "canvases");
            }
        }
        return systems;
    }

    /**
     * The `UIElement` descendants of a canvas node, parents first, ready for `UICanvas`.
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
        /** @type {any[]} */ this.renderers = [];
        /** @type {UICanvas[]} */ this.canvases = [];
        /** @type {AnimationPlayer[]} */ this.animations = [];
        /** @type {Map<string, {audio?: AudioSource, emitter?: ParticleEmitter, canvas?: UICanvas, animation?: AnimationPlayer}>} */
        this.byId = new Map();
    }

    /** The systems of a node (by id or name). @param {string} id */
    Find(id) {
        if (this.byId.has(id)) return this.byId.get(id) ?? {};
        const named = [...this.audio, ...this.emitters, ...this.canvases, ...this.animations].find(entity => entity.name === id);
        if (!named) return {};
        for (const entry of this.byId.values()) if (Object.values(entry).includes(named)) return entry;
        return {};
    }

    /** Every system, renderers included (for removal). */
    All() {
        return [...this.animations, ...this.emitters, ...this.renderers, ...this.audio, ...this.canvases];
    }
}
