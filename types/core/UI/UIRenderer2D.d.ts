/**
 * Draws a UICanvas with a CanvasRenderingContext2D — the game's UI screen (ScreenUI in 3D
 * levels, the 2D screen in 2D levels) or any 2D context (the editor's viewport overlay). It only
 * needs a context: no DOM elements are created, so the HUD is part of the game's frame and
 * pixel-identical everywhere.
 *
 * With `pointer`, it listens to pointer events on the context's canvas and feeds the canvas's
 * `Pointer` (hover, press, button actions).
 *
 * @example
 * const renderer = new UIRenderer2D(hud, { context: overlay.getContext("2d"), pointer: false });
 * renderer.Draw(); // every frame (UICanvas.OnGUI does it when the canvas is a level entity)
 */
export class UIRenderer2D {
    /**
     * @param {import("./UICanvas.js").UICanvas} canvas
     * @param {{screen?: {Context: CanvasRenderingContext2D, Canvas?: HTMLCanvasElement}|null, context?: CanvasRenderingContext2D|null, assets?: any, pointer?: boolean, placeholders?: boolean, clear?: boolean}} [options]
     *   `placeholders`: unset `{key}` bindings drawn as written (editor); `clear`: clear the
     *   context before drawing (only for a canvas the UI owns).
     */
    constructor(canvas: import("./UICanvas.js").UICanvas, { screen, context, assets, pointer, placeholders, clear }?: {
        screen?: {
            Context: CanvasRenderingContext2D;
            Canvas?: HTMLCanvasElement;
        } | null;
        context?: CanvasRenderingContext2D | null;
        assets?: any;
        pointer?: boolean;
        placeholders?: boolean;
        clear?: boolean;
    });
    canvas: import("./UICanvas.js").UICanvas;
    screen: {
        Context: CanvasRenderingContext2D;
        Canvas?: HTMLCanvasElement;
    };
    contextOption: CanvasRenderingContext2D;
    assets: any;
    pointer: boolean;
    placeholders: boolean;
    clear: boolean;
    /** @type {((event: any) => void)|null} */ handler: ((event: any) => void) | null;
    /** @returns {CanvasRenderingContext2D|null} */
    get context(): CanvasRenderingContext2D | null;
    OnStart(context: any): void;
    /** Lays the canvas out to the context's size and draws it. */
    Draw(): void;
    /** @param {CanvasRenderingContext2D} ctx @param {import("./UICanvas.js").UIElement} element @param {number} scale */
    DrawElement(ctx: CanvasRenderingContext2D, element: import("./UICanvas.js").UIElement, scale: number): void;
    /** @param {string} name */
    Image(name: string): any;
    OnDestroy(): void;
}
