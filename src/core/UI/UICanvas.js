// @ts-check
import { Component } from "../Component.js";
import { SceneComponents } from "../Scene/SceneComponents.js";

/**
 * Rectangle of an element inside its parent: `anchor` picks the corner, edge or centre the
 * `offset` is measured from (inwards for right / bottom anchors); `stretch` fills the parent
 * minus the offset on every side.
 * @param {string} anchor @param {number[]} offset @param {number[]} size @param {number[]} parent
 * @returns {{x: number, y: number, width: number, height: number}}
 */
export function LayoutRect(anchor, offset, size, parent) {
    const [ox, oy] = offset, [pw, ph] = parent;
    if (anchor === "stretch") return { x: ox, y: oy, width: Math.max(0, pw - ox * 2), height: Math.max(0, ph - oy * 2) };
    const [width, height] = size;
    const [vertical, horizontal] = anchor === "center" ? ["center", "center"]
        : anchor.includes("-") ? anchor.split("-")
        : ["top", "bottom"].includes(anchor) ? [anchor, "center"] : ["center", anchor];
    const x = horizontal === "left" ? ox : horizontal === "right" ? pw - width - ox : (pw - width) / 2 + ox;
    const y = vertical === "top" ? oy : vertical === "bottom" ? ph - height - oy : (ph - height) / 2 + oy;
    return { x, y, width, height };
}

/** `"HP {hp}/{max}"` with values from `data` (unknown keys stay as written). @param {string} text @param {Record<string, any>} data */
export function FormatBinding(text, data, { keep = false } = {}) {
    return String(text ?? "").replace(/\{([\w.]+)\}/g, (match, key) => (key in data ? String(data[key]) : keep ? match : ""));
}

/** A progress element's fill (0..1) from its `value` (number or "{binding}") and `max`. */
export function ProgressFraction(settings, data) {
    const raw = typeof settings.value === "number" ? settings.value : Number(FormatBinding(settings.value, data));
    const max = Number(settings.max) || 0;
    return max > 0 && Number.isFinite(raw) ? Math.min(1, Math.max(0, raw / max)) : 0;
}

/** Scale of a canvas drawn at `reference` size inside `available` (fit keeps every element visible). */
export function CanvasScale(scaleMode, reference, available) {
    if (scaleMode !== "fit") return 1;
    return Math.max(0.01, Math.min(available[0] / reference[0], available[1] / reference[1]));
}

const rgba = color => `rgba(${Math.round(color[0] * 255)}, ${Math.round(color[1] * 255)}, ${Math.round(color[2] * 255)}, ${color[3] ?? 1})`;

/**
 * Scene-authored in-game UI: a `UICanvas` node and its `UIElement` children (panels, text,
 * progress bars, buttons, images) laid out by anchor at a reference size and drawn as a DOM
 * layer over the game canvas, in Play and in the editor's viewport.
 *
 * Text and bar values bind to data: `"Score: {score}"` changes with `canvas.Set("score", 10)`.
 * Buttons send their `action`: `canvas.On("start", () => …)`.
 *
 * @example
 * const hud = SceneSystems.Attach(level, document).canvases[0];
 * hud.Set({ hp: 7, maxHp: 10 });
 * hud.On("pause", () => level.paused = true);
 */
export class UICanvas extends Component {
    /**
     * @param {Record<string, any>} [settings] - `UICanvas` component values.
     * @param {{elements?: {id: string, name?: string, parent?: string|null, settings: Record<string, any>}[], target?: HTMLElement|null, host?: HTMLElement|null, assets?: any, document?: Document|null, name?: string, data?: Record<string, any>, placeholders?: boolean}} [options]
     *   `target`: the canvas the UI covers; `host`: where the layer is added (target's parent).
     */
    constructor(settings = {}, { elements = [], target = null, host = null, assets = null, document = globalThis.document ?? null, name = "", data = {}, placeholders = false } = {}) {
        super();
        this.name = name;
        this.settings = SceneComponents.Resolve("UICanvas", settings);
        this.elements = elements.map(element => ({ ...element, settings: SceneComponents.Resolve("UIElement", element.settings) }));
        this.target = target;
        this.host = host ?? target?.parentElement ?? document?.body ?? null;
        this.assets = assets;
        this.doc = document;
        this.data = { ...data };
        /** Shows unset `{key}` bindings as written (the editor preview) instead of empty. */
        this.placeholders = placeholders;
        /** @type {Map<string, Set<Function>>} */ this.listeners = new Map();
        /** @type {Map<string, HTMLElement>} */ this.nodes = new Map();
        this.root = null;
        this.layer = null;
        this.size = [0, 0];
    }

    OnStart() {
        this.Build();
    }

    /** Creates (or re-creates) the DOM layer. */
    Build() {
        if (!this.doc || !this.host) return;
        this.Remove();
        const doc = this.doc;
        this.layer = doc.createElement("div");
        this.layer.className = "gf-ui-layer";
        this.layer.dataset.canvas = this.name;
        Object.assign(this.layer.style, { position: "absolute", left: "0px", top: "0px", width: "0px", height: "0px", overflow: "hidden", pointerEvents: "none", zIndex: "5" });
        this.root = doc.createElement("div");
        Object.assign(this.root.style, { position: "absolute", left: "0px", top: "0px", transformOrigin: "0 0", fontFamily: this.settings.fontFamily });
        this.layer.appendChild(this.root);
        const byId = new Map(this.elements.map(element => [element.id, element]));
        for (const element of this.elements) {
            const node = doc.createElement(element.settings.kind === "button" ? "button" : "div");
            node.className = `gf-ui gf-ui-${element.settings.kind}`;
            node.dataset.id = element.id;
            if (element.settings.kind === "button") {
                /** @type {HTMLButtonElement} */ (node).type = "button";
                node.style.pointerEvents = "auto";
                node.style.cursor = "pointer";
                node.addEventListener("click", () => this.Emit(element.settings.action || element.id, element));
            }
            this.nodes.set(element.id, node);
        }
        for (const element of this.elements) {
            const parent = element.parent && byId.has(element.parent) ? this.nodes.get(element.parent) : this.root;
            parent?.appendChild(/** @type {HTMLElement} */ (this.nodes.get(element.id)));
        }
        this.host.appendChild(this.layer);
        this.Refresh(true);
    }

    /** Sets bound values: `Set("score", 3)` or `Set({ hp: 5, maxHp: 10 })`. */
    Set(key, value) {
        if (typeof key === "object" && key) Object.assign(this.data, key);
        else this.data[key] = value;
        this.Refresh();
    }

    /** @param {string} key */
    Get(key) {
        return this.data[key];
    }

    /** Listens to a button action; returns a function that stops listening. @param {string} action @param {Function} listener */
    On(action, listener) {
        if (!this.listeners.has(action)) this.listeners.set(action, new Set());
        this.listeners.get(action)?.add(listener);
        return () => this.listeners.get(action)?.delete(listener);
    }

    /** @param {string} action @param {any} [element] */
    Emit(action, element = null) {
        for (const listener of this.listeners.get(action) ?? []) listener(element, this);
    }

    /** The settings of an element (by id or name), live: change them and call Refresh. @param {string} id */
    Element(id) {
        return this.elements.find(element => element.id === id || element.name === id) ?? null;
    }

    /** Shows or hides an element. @param {string} id @param {boolean} visible */
    SetVisible(id, visible) {
        const element = this.Element(id);
        if (element) { element.settings.visible = visible; this.Refresh(true); }
    }

    /** Re-lays out and re-draws (call after changing settings; Set() calls it). */
    Refresh(force = false) {
        if (!this.layer || !this.root) return;
        const target = this.target;
        const width = target?.clientWidth || this.host?.clientWidth || this.settings.referenceSize[0];
        const height = target?.clientHeight || this.host?.clientHeight || this.settings.referenceSize[1];
        const left = target ? target.offsetLeft : 0, top = target ? target.offsetTop : 0;
        if (force || width !== this.size[0] || height !== this.size[1] || left !== this.offset?.[0] || top !== this.offset?.[1]) {
            this.size = [width, height];
            this.offset = [left, top];
            Object.assign(this.layer.style, { left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` });
        }
        const reference = this.settings.referenceSize;
        const scale = CanvasScale(this.settings.scaleMode, reference, this.size);
        const canvasSize = this.settings.scaleMode === "fit" ? reference : this.size;
        Object.assign(this.root.style, {
            width: `${canvasSize[0]}px`, height: `${canvasSize[1]}px`,
            transform: `translate(${(this.size[0] - canvasSize[0] * scale) / 2}px, ${(this.size[1] - canvasSize[1] * scale) / 2}px) scale(${scale})`,
        });
        this.layer.style.display = this.settings.visible ? "block" : "none";
        const sizes = new Map();
        for (const element of this.elements) {
            const node = this.nodes.get(element.id);
            if (!node) continue;
            const s = element.settings;
            const parentSize = element.parent && sizes.has(element.parent) ? sizes.get(element.parent) : canvasSize;
            const rect = LayoutRect(s.anchor, s.offset, s.size, parentSize);
            sizes.set(element.id, [rect.width, rect.height]);
            this.Draw(node, s, rect);
        }
    }

    /** @param {HTMLElement} node @param {Record<string, any>} s @param {{x: number, y: number, width: number, height: number}} rect */
    Draw(node, s, rect) {
        const style = node.style;
        Object.assign(style, {
            position: "absolute", boxSizing: "border-box", left: `${rect.x}px`, top: `${rect.y}px`,
            width: `${rect.width}px`, height: `${rect.height}px`, display: s.visible ? "flex" : "none",
            alignItems: "center", justifyContent: s.align === "center" ? "center" : s.align === "right" ? "flex-end" : "flex-start",
            padding: `0 ${s.padding}px`, borderRadius: `${s.radius}px`, color: rgba(s.color), fontSize: `${s.fontSize}px`,
            border: "none", margin: "0", overflow: "hidden", whiteSpace: "nowrap", font: "inherit", fontWeight: s.kind === "button" ? "600" : "",
        });
        style.fontSize = `${s.fontSize}px`;
        style.background = s.kind === "text" ? "transparent" : rgba(s.background);
        if (s.kind === "progress") {
            let bar = /** @type {HTMLElement|null} */ (node.firstElementChild);
            if (!bar && this.doc) { bar = this.doc.createElement("div"); node.appendChild(bar); }
            if (bar) Object.assign(bar.style, { position: "absolute", left: "0", top: "0", bottom: "0", width: `${ProgressFraction(s, this.data) * 100}%`, background: rgba(s.fill), borderRadius: `${s.radius}px` });
            node.dataset.fraction = String(ProgressFraction(s, this.data));
            style.padding = "0";
        } else if (s.kind === "image") {
            const image = s.image ? this.assets?.images?.[s.image] : null;
            style.background = image?.src ? `center / contain no-repeat url("${image.src}")` : rgba(s.background);
        } else if (s.kind === "text" || s.kind === "button") {
            const text = FormatBinding(s.text, this.data, { keep: this.placeholders });
            if (node.textContent !== text) node.textContent = text;
        }
    }

    OnUpdate() {
        // Follows the target canvas when the window resizes.
        const target = this.target;
        if (target && (target.clientWidth !== this.size[0] || target.clientHeight !== this.size[1])) this.Refresh();
    }

    Remove() {
        this.layer?.remove();
        this.layer = this.root = null;
        this.nodes.clear();
    }

    OnDestroy() {
        this.Remove();
        this.listeners.clear();
    }
}
