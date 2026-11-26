// @ts-check
import { Component } from "../Component.js";
import { SceneComponents } from "../Scene/SceneComponents.js";
import { CanvasScale, FormatBinding, LayoutRect, ProgressFraction } from "./UILayout.js";
import { UIRenderer2D } from "./UIRenderer2D.js";

export { CanvasScale, FormatBinding, LayoutRect, ProgressFraction };

/** Builders shared by the canvas and its elements: each adds a child and returns it. */
class UIContainer extends Component {
    constructor() {
        super();
        /** @type {UIElement[]} */ this.children = [];
    }

    /** @returns {UICanvas} */
    get ui() { throw new Error("abstract"); }

    /**
     * Adds a child element. `settings` are `UIElement` component values over the kind's
     * `UICanvas.KIND_DEFAULTS` (the editor's Create menu uses the same); `id` and `name` there
     * name the element. `build(element)` adds its own children.
     * @param {string} kind @param {Record<string, any>} [settings] @param {(element: UIElement) => void} [build]
     */
    Add(kind, settings = {}, build) {
        const { id, name, ...values } = settings;
        const defaults = UICanvas.KIND_DEFAULTS[kind] ?? {};
        const element = new UIElement(this.ui, { ...structuredClone(defaults), ...values, kind }, { id, name, parent: this instanceof UIElement ? this : null });
        this.children.push(element);
        this.ui.Register(element);
        build?.(element);
        return element;
    }

    /** @param {Record<string, any>} [settings] @param {(panel: UIElement) => void} [build] */
    Panel(settings = {}, build) { return this.Add("panel", settings, build); }
    /** @param {string} text @param {Record<string, any>} [settings] */
    Text(text, settings = {}) { return this.Add("text", { ...settings, text }); }
    /** @param {number|string} value - A number or a "{binding}". @param {number} max @param {Record<string, any>} [settings] */
    Progress(value, max, settings = {}) { return this.Add("progress", { ...settings, value: String(value), max }); }
    /** @param {string} text @param {string} action - Sent to `On(action, …)` when clicked. @param {Record<string, any>} [settings] */
    Button(text, action, settings = {}) { return this.Add("button", { ...settings, text, action }); }
    /** @param {string} image - Name in resources.json images. @param {Record<string, any>} [settings] */
    Image(image, settings = {}) { return this.Add("image", { ...settings, image }); }
}

/**
 * One element of a UICanvas: a panel, text, progress bar, button or image laid out by anchor
 * inside its parent. `settings` are the scene's `UIElement` component values.
 */
export class UIElement extends UIContainer {
    /**
     * @param {UICanvas} canvas @param {Record<string, any>} settings
     * @param {{id?: string, name?: string, parent?: UIElement|null}} [options]
     */
    constructor(canvas, settings, { id, name, parent = null } = {}) {
        super();
        this.canvas = canvas;
        this.settings = SceneComponents.Resolve("UIElement", settings);
        this.id = id ?? canvas.NextId(this.settings.kind);
        this.name = name ?? this.id;
        this.parent = parent;
        /** Layout in output pixels (Layout fills it). */
        this.rect = { x: 0, y: 0, width: 0, height: 0 };
        this.hover = false;
        this.pressed = false;
    }

    get ui() { return this.canvas; }

    /** Changes settings (`Set("text", "Paused")` or `Set({ visible: false })`). */
    Set(key, value) {
        if (typeof key === "object" && key) Object.assign(this.settings, key);
        else this.settings[key] = value;
        this.settings = SceneComponents.Resolve("UIElement", this.settings);
        this.canvas.version++;
        return this;
    }

    /** Visible, and every parent too. */
    get shown() {
        for (let element = /** @type {UIElement|null} */ (this); element; element = element.parent) if (!element.settings.visible) return false;
        return this.canvas.settings.visible;
    }

    /** The text as drawn (bindings filled). @param {{keep?: boolean}} [options] */
    Label(options) {
        return FormatBinding(this.settings.text, this.canvas.data, options);
    }

    /** Fill of a progress bar (0..1). */
    get fraction() {
        return ProgressFraction(this.settings, this.canvas.data);
    }

    ToJSON() {
        return structuredClone(this.settings);
    }
}

/**
 * In-game UI: a tree of UIElements laid out by anchor at a reference size, scaled to the screen,
 * with `{key}` data bindings and button actions. It is a pure model (layout, hit testing, input
 * state); a renderer draws it — `UIRenderer2D` on the game's UI canvas by default, so the same
 * HUD draws in 2D and 3D games and in the editor.
 *
 * Code first and scene first build the same object: the scene's `UICanvas` node gives `settings`
 * and its `UIElement` children give the elements.
 *
 * @example
 * // Code first (the renderer is created on the level's UI screen)
 * const hud = level.AddEntity(new UICanvas({ referenceSize: [800, 450] }));
 * hud.Panel({ anchor: "top-left", offset: [16, 16], size: [280, 88] }, panel => {
 *     panel.Text("Score: {score}", { offset: [12, 8], size: [256, 34] });
 *     panel.Progress("{hp}", 10, { anchor: "bottom", offset: [0, 14], size: [256, 18] });
 * });
 * hud.Button("Pause", "pause", { anchor: "top-right", size: [120, 42] });
 * hud.Set({ score: 0, hp: 10 });
 * hud.On("pause", () => level.paused = !level.paused);
 */
export class UICanvas extends UIContainer {
    /**
     * Values a new element of a kind starts with, over the `UIElement` schema defaults: the code
     * builders (`Button`, …) and the editor's Create menu both use them, so a button made either
     * way is the same button.
     */
    static KIND_DEFAULTS = Object.freeze({
        button: Object.freeze({ align: "center", background: Object.freeze([0.2, 0.45, 0.85, 0.9]) }),
    });

    /**
     * @param {Record<string, any>} [settings] - `UICanvas` component values.
     * @param {{elements?: {id: string, name?: string, parent?: string|null, settings: Record<string, any>}[], data?: Record<string, any>, name?: string, renderer?: ((canvas: UICanvas) => any)|any}} [options]
     *   `elements`: the scene's UIElement nodes, parents first; `renderer`: draws the canvas
     *   (default: UIRenderer2D on the level's UI screen when there is one).
     */
    constructor(settings = {}, { elements = [], data = {}, name = "", renderer = null } = {}) {
        super();
        this.name = name;
        this.settings = SceneComponents.Resolve("UICanvas", settings);
        this.data = { ...data };
        /** Bumped on every change, so renderers can skip unchanged frames. */
        this.version = 0;
        /** @type {Map<string, UIElement>} */ this.byId = new Map();
        /** @type {Map<string, Set<Function>>} */ this.listeners = new Map();
        this.counter = 0;
        this.rendererOption = renderer;
        /** @type {any} */ this.renderer = null;
        /** Scale and offset of the last layout. */
        this.view = { scale: 1, x: 0, y: 0, width: 0, height: 0 };
        for (const element of elements) {
            const parent = element.parent ? this.byId.get(element.parent) ?? this : this;
            parent.Add(element.settings?.kind ?? "panel", { ...element.settings, id: element.id, name: element.name });
        }
    }

    get ui() { return this; }

    /** @param {UIElement} element */
    Register(element) {
        this.byId.set(element.id, element);
        this.version++;
    }

    /** @param {string} kind */
    NextId(kind) {
        let id;
        do id = `${kind}_${++this.counter}`; while (this.byId.has(id));
        return id;
    }

    /** Every element, parents before children (drawing order). @returns {UIElement[]} */
    Elements() {
        const result = [];
        const visit = list => { for (const element of list) { result.push(element); visit(element.children); } };
        visit(this.children);
        return result;
    }

    /** An element by id or name. @param {string} id */
    Element(id) {
        return this.byId.get(id) ?? this.Elements().find(element => element.name === id) ?? null;
    }

    /** Removes an element and its children. @param {UIElement|string} element */
    Remove(element) {
        const target = typeof element === "string" ? this.Element(element) : element;
        if (!target) return;
        const list = target.parent ? target.parent.children : this.children;
        list.splice(list.indexOf(target), 1);
        const forget = item => { this.byId.delete(item.id); item.children.forEach(forget); };
        forget(target);
        this.version++;
    }

    /** Sets bound values: `Set("score", 3)` or `Set({ hp: 5, maxHp: 10 })`. */
    Set(key, value) {
        if (typeof key === "object" && key) Object.assign(this.data, key);
        else this.data[key] = value;
        this.version++;
        return this;
    }

    /** @param {string} key */
    Get(key) {
        return this.data[key];
    }

    /** Shows or hides the canvas, or one element. @param {string|boolean} id @param {boolean} [visible] */
    SetVisible(id, visible) {
        if (typeof id === "boolean") { this.settings.visible = id; this.version++; return; }
        this.Element(id)?.Set("visible", Boolean(visible));
    }

    /** Listens to a button action; returns a function that stops listening. @param {string} action @param {Function} listener */
    On(action, listener) {
        if (!this.listeners.has(action)) this.listeners.set(action, new Set());
        this.listeners.get(action)?.add(listener);
        return () => this.listeners.get(action)?.delete(listener);
    }

    /** @param {string} action @param {UIElement|null} [element] */
    Emit(action, element = null) {
        for (const listener of this.listeners.get(action) ?? []) listener(element, this);
    }

    /**
     * Lays every element out for an output of `width` × `height` pixels: `element.rect` is in
     * output pixels (scale and centring applied).
     * @param {number} width @param {number} height
     */
    Layout(width, height) {
        const reference = this.settings.referenceSize;
        const fit = this.settings.scaleMode === "fit";
        const scale = CanvasScale(this.settings.scaleMode, reference, [width, height]);
        const size = fit ? reference : [width, height];
        const x = (width - size[0] * scale) / 2, y = (height - size[1] * scale) / 2;
        this.view = { scale, x, y, width: size[0], height: size[1] };
        const visit = (list, parentRect) => {
            for (const element of list) {
                const s = element.settings;
                const local = LayoutRect(s.anchor, s.offset, s.size, [parentRect.width, parentRect.height]);
                const rect = { x: parentRect.x + local.x, y: parentRect.y + local.y, width: local.width, height: local.height };
                element.rect = { x: x + rect.x * scale, y: y + rect.y * scale, width: rect.width * scale, height: rect.height * scale };
                visit(element.children, rect);
            }
        };
        visit(this.children, { x: 0, y: 0, width: size[0], height: size[1] });
        return this.view;
    }

    /** The top-most shown button at an output pixel (after Layout), or null. @param {number} x @param {number} y */
    Hit(x, y) {
        const elements = this.Elements();
        for (let index = elements.length - 1; index >= 0; index--) {
            const element = elements[index], r = element.rect;
            if (element.settings.kind === "button" && element.shown && x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height) return element;
        }
        return null;
    }

    /**
     * Pointer input in output pixels: hover on move, press on down, and the button's action on
     * up over the pressed button. Returns true when the UI used the event.
     * @param {"move"|"down"|"up"} type @param {number} x @param {number} y
     */
    Pointer(type, x, y) {
        const hit = this.Hit(x, y);
        let used = Boolean(hit);
        for (const element of this.byId.values()) {
            const hover = element === hit;
            if (element.hover !== hover) { element.hover = hover; this.version++; }
        }
        if (type === "down" && hit) { hit.pressed = true; this.version++; }
        if (type === "up") {
            for (const element of this.byId.values()) {
                if (!element.pressed) continue;
                element.pressed = false;
                this.version++;
                if (element === hit) { this.Emit(element.settings.action || element.id, element); used = true; }
            }
        }
        return used;
    }

    /** Layout and text of every element, for tests and tools. @param {number} [width] @param {number} [height] */
    Snapshot(width = this.settings.referenceSize[0], height = this.settings.referenceSize[1]) {
        this.Layout(width, height);
        return this.Elements().map(element => ({
            id: element.id, kind: element.settings.kind, parent: element.parent?.id ?? null, shown: element.shown,
            rect: Object.fromEntries(Object.entries(element.rect).map(([key, value]) => [key, Math.round(value * 100) / 100])),
            text: element.Label(), fraction: element.fraction,
        }));
    }

    /**
     * The canvas as scene nodes (a `UICanvas` node and its `UIElement` nodes), the inverse of
     * building it from a scene. @param {{id?: string, name?: string}} [node]
     */
    ToSceneNodes({ id = this.name || "ui", name = this.name || id } = {}) {
        /** @type {{id: string, name: string, type: string, parent?: string, components: Record<string, any>}[]} */
        const nodes = [{ id, name, type: "UICanvas", components: { UICanvas: structuredClone(this.settings) } }];
        for (const element of this.Elements()) {
            nodes.push({ id: element.id, name: element.name, type: "UIElement", parent: element.parent?.id ?? id, components: { UIElement: element.ToJSON() } });
        }
        return nodes;
    }

    ToJSON() {
        return structuredClone(this.settings);
    }

    OnStart(context) {
        const option = this.rendererOption;
        if (typeof option === "function") this.renderer = option(this);
        else if (option) this.renderer = option;
        else {
            // Default: draw on the level's UI screen (3D levels: `ui`, 2D levels: `screen`).
            const level = /** @type {any} */ (this).level;
            const screen = level?.ui?.screen ?? level?.screen ?? null;
            if (screen?.Context) this.renderer = new UIRenderer2D(this, { screen, assets: context?.assets ?? null });
        }
        this.renderer?.OnStart?.(context);
    }

    OnGUI() {
        this.renderer?.Draw?.();
    }

    OnDestroy() {
        this.renderer?.OnDestroy?.();
        this.renderer = null;
        this.listeners.clear();
    }
}
