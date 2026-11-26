/**
 * Rectangle of an element inside its parent: `anchor` picks the corner, edge or centre the
 * `offset` is measured from (inwards for right / bottom anchors); `stretch` fills the parent
 * minus the offset on every side.
 * @param {string} anchor @param {number[]} offset @param {number[]} size @param {number[]} parent
 * @returns {{x: number, y: number, width: number, height: number}}
 */
export function LayoutRect(anchor: string, offset: number[], size: number[], parent: number[]): {
    x: number;
    y: number;
    width: number;
    height: number;
};
/** `"HP {hp}/{max}"` with values from `data` (unknown keys stay as written). @param {string} text @param {Record<string, any>} data */
export function FormatBinding(text: string, data: Record<string, any>, { keep }?: {
    keep?: boolean;
}): string;
/** A progress element's fill (0..1) from its `value` (number or "{binding}") and `max`. */
export function ProgressFraction(settings: any, data: any): number;
/** Scale of a canvas drawn at `reference` size inside `available` (fit keeps every element visible). */
export function CanvasScale(scaleMode: any, reference: any, available: any): number;
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
    constructor(settings?: Record<string, any>, { elements, target, host, assets, document, name, data, placeholders }?: {
        elements?: {
            id: string;
            name?: string;
            parent?: string | null;
            settings: Record<string, any>;
        }[];
        target?: HTMLElement | null;
        host?: HTMLElement | null;
        assets?: any;
        document?: Document | null;
        name?: string;
        data?: Record<string, any>;
        placeholders?: boolean;
    });
    name: string;
    settings: any;
    elements: {
        settings: any;
        id: string;
        name?: string;
        parent?: string | null;
    }[];
    target: HTMLElement;
    host: HTMLElement;
    assets: any;
    doc: Document;
    data: {
        [x: string]: any;
    };
    /** Shows unset `{key}` bindings as written (the editor preview) instead of empty. */
    placeholders: boolean;
    /** @type {Map<string, Set<Function>>} */ listeners: Map<string, Set<Function>>;
    /** @type {Map<string, HTMLElement>} */ nodes: Map<string, HTMLElement>;
    root: HTMLDivElement;
    layer: HTMLDivElement;
    size: number[];
    /** Creates (or re-creates) the DOM layer. */
    Build(): void;
    /** Sets bound values: `Set("score", 3)` or `Set({ hp: 5, maxHp: 10 })`. */
    Set(key: any, value: any): void;
    /** @param {string} key */
    Get(key: string): any;
    /** Listens to a button action; returns a function that stops listening. @param {string} action @param {Function} listener */
    On(action: string, listener: Function): () => boolean;
    /** @param {string} action @param {any} [element] */
    Emit(action: string, element?: any): void;
    /** The settings of an element (by id or name), live: change them and call Refresh. @param {string} id */
    Element(id: string): {
        settings: any;
        id: string;
        name?: string;
        parent?: string | null;
    };
    /** Shows or hides an element. @param {string} id @param {boolean} visible */
    SetVisible(id: string, visible: boolean): void;
    /** Re-lays out and re-draws (call after changing settings; Set() calls it). */
    Refresh(force?: boolean): void;
    offset: number[];
    /** @param {HTMLElement} node @param {Record<string, any>} s @param {{x: number, y: number, width: number, height: number}} rect */
    Draw(node: HTMLElement, s: Record<string, any>, rect: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): void;
    OnUpdate(): void;
    Remove(): void;
}
import { Component } from "../Component.js";
