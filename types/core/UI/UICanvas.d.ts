/**
 * One element of a UICanvas: a panel, text, progress bar, button or image laid out by anchor
 * inside its parent. `settings` are the scene's `UIElement` component values.
 */
export class UIElement extends UIContainer {
    /**
     * @param {UICanvas} canvas @param {Record<string, any>} settings
     * @param {{id?: string, name?: string, parent?: UIElement|null}} [options]
     */
    constructor(canvas: UICanvas, settings: Record<string, any>, { id, name, parent }?: {
        id?: string;
        name?: string;
        parent?: UIElement | null;
    });
    canvas: UICanvas;
    settings: any;
    id: string;
    name: string;
    parent: UIElement;
    /** Layout in output pixels (Layout fills it). */
    rect: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    hover: boolean;
    pressed: boolean;
    /** Changes settings (`Set("text", "Paused")` or `Set({ visible: false })`). */
    Set(key: any, value: any): this;
    /** Visible, and every parent too. */
    get shown(): any;
    /** The text as drawn (bindings filled). @param {{keep?: boolean}} [options] */
    Label(options?: {
        keep?: boolean;
    }): string;
    /** Fill of a progress bar (0..1). */
    get fraction(): number;
    ToJSON(): any;
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
    static KIND_DEFAULTS: Readonly<{
        button: Readonly<{
            align: "center";
            background: readonly number[];
        }>;
    }>;
    /**
     * @param {Record<string, any>} [settings] - `UICanvas` component values.
     * @param {{elements?: {id: string, name?: string, parent?: string|null, settings: Record<string, any>}[], data?: Record<string, any>, name?: string, renderer?: ((canvas: UICanvas) => any)|any}} [options]
     *   `elements`: the scene's UIElement nodes, parents first; `renderer`: draws the canvas
     *   (default: UIRenderer2D on the level's UI screen when there is one).
     */
    constructor(settings?: Record<string, any>, { elements, data, name, renderer }?: {
        elements?: {
            id: string;
            name?: string;
            parent?: string | null;
            settings: Record<string, any>;
        }[];
        data?: Record<string, any>;
        name?: string;
        renderer?: ((canvas: UICanvas) => any) | any;
    });
    name: string;
    settings: any;
    data: {
        [x: string]: any;
    };
    /** Bumped on every change, so renderers can skip unchanged frames. */
    version: number;
    /** @type {Map<string, UIElement>} */ byId: Map<string, UIElement>;
    /** @type {Map<string, Set<Function>>} */ listeners: Map<string, Set<Function>>;
    counter: number;
    rendererOption: any;
    /** @type {any} */ renderer: any;
    /** Scale and offset of the last layout. */
    view: {
        scale: number;
        x: number;
        y: number;
        width: number;
        height: number;
    };
    get ui(): this;
    /** @param {UIElement} element */
    Register(element: UIElement): void;
    /** @param {string} kind */
    NextId(kind: string): string;
    /** Every element, parents before children (drawing order). @returns {UIElement[]} */
    Elements(): UIElement[];
    /** An element by id or name. @param {string} id */
    Element(id: string): UIElement;
    /** Removes an element and its children. @param {UIElement|string} element */
    Remove(element: UIElement | string): void;
    /** Sets bound values: `Set("score", 3)` or `Set({ hp: 5, maxHp: 10 })`. */
    Set(key: any, value: any): this;
    /** @param {string} key */
    Get(key: string): any;
    /** Shows or hides the canvas, or one element. @param {string|boolean} id @param {boolean} [visible] */
    SetVisible(id: string | boolean, visible?: boolean): void;
    /** Listens to a button action; returns a function that stops listening. @param {string} action @param {Function} listener */
    On(action: string, listener: Function): () => boolean;
    /** @param {string} action @param {UIElement|null} [element] */
    Emit(action: string, element?: UIElement | null): void;
    /**
     * Lays every element out for an output of `width` × `height` pixels: `element.rect` is in
     * output pixels (scale and centring applied).
     * @param {number} width @param {number} height
     */
    Layout(width: number, height: number): {
        scale: number;
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /** The top-most shown button at an output pixel (after Layout), or null. @param {number} x @param {number} y */
    Hit(x: number, y: number): UIElement;
    /**
     * Pointer input in output pixels: hover on move, press on down, and the button's action on
     * up over the pressed button. Returns true when the UI used the event.
     * @param {"move"|"down"|"up"} type @param {number} x @param {number} y
     */
    Pointer(type: "move" | "down" | "up", x: number, y: number): boolean;
    /** Layout and text of every element, for tests and tools. @param {number} [width] @param {number} [height] */
    Snapshot(width?: number, height?: number): {
        id: string;
        kind: any;
        parent: string;
        shown: any;
        rect: {
            [k: string]: number;
        };
        text: string;
        fraction: number;
    }[];
    /**
     * The canvas as scene nodes (a `UICanvas` node and its `UIElement` nodes), the inverse of
     * building it from a scene. @param {{id?: string, name?: string}} [node]
     */
    ToSceneNodes({ id, name }?: {
        id?: string;
        name?: string;
    }): {
        id: string;
        name: string;
        type: string;
        parent?: string;
        components: Record<string, any>;
    }[];
    ToJSON(): any;
    OnStart(context: any): void;
    OnGUI(): void;
}
import { CanvasScale } from "./UILayout.js";
import { FormatBinding } from "./UILayout.js";
import { LayoutRect } from "./UILayout.js";
import { ProgressFraction } from "./UILayout.js";
/** Builders shared by the canvas and its elements: each adds a child and returns it. */
declare class UIContainer extends Component {
    constructor();
    /** @type {UIElement[]} */ children: UIElement[];
    /** @returns {UICanvas} */
    get ui(): UICanvas;
    /**
     * Adds a child element. `settings` are `UIElement` component values over the kind's
     * `UICanvas.KIND_DEFAULTS` (the editor's Create menu uses the same); `id` and `name` there
     * name the element. `build(element)` adds its own children.
     * @param {string} kind @param {Record<string, any>} [settings] @param {(element: UIElement) => void} [build]
     */
    Add(kind: string, settings?: Record<string, any>, build?: (element: UIElement) => void): UIElement;
    /** @param {Record<string, any>} [settings] @param {(panel: UIElement) => void} [build] */
    Panel(settings?: Record<string, any>, build?: (panel: UIElement) => void): UIElement;
    /** @param {string} text @param {Record<string, any>} [settings] */
    Text(text: string, settings?: Record<string, any>): UIElement;
    /** @param {number|string} value - A number or a "{binding}". @param {number} max @param {Record<string, any>} [settings] */
    Progress(value: number | string, max: number, settings?: Record<string, any>): UIElement;
    /** @param {string} text @param {string} action - Sent to `On(action, …)` when clicked. @param {Record<string, any>} [settings] */
    Button(text: string, action: string, settings?: Record<string, any>): UIElement;
    /** @param {string} image - Name in resources.json images. @param {Record<string, any>} [settings] */
    Image(image: string, settings?: Record<string, any>): UIElement;
}
import { Component } from "../Component.js";
export { CanvasScale, FormatBinding, LayoutRect, ProgressFraction };
