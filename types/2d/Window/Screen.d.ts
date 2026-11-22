export const PIXELATED_RENDERING: true;
/**
 * Creates and owns a two-dimensional gameplay canvas and draw context.
 *
 * @param {string} id - Canvas element identifier.
 * @param {number} [width] - Logical canvas width.
 * @param {number} [height] - Logical canvas height.
 */
export class Screen {
    /** @param {string} id @param {number} [width] @param {number} [height] @param {{config?: object, parent?: HTMLElement | null}} [options] */
    constructor(id: string, width?: number, height?: number, { config, parent }?: {
        config?: object;
        parent?: HTMLElement | null;
    });
    id: string;
    config: any;
    parent: HTMLElement;
    width: number;
    height: number;
    ratio: number;
    clientWidth: number;
    clientHeight: number;
    x: number;
    y: number;
    /**
     * @doc Method
     * @description Set new canvas
     * @example
     * var canvas = document.getElementById("canvasName")
     *  screen.Canvas(canvas)
     */
    set Canvas(canvas: any);
    /**
     * @doc Method
     * @description Get canvas of the screen
     * @example
     *  var newCanvas = screen.Canvas();
     * @returns canvas
     */
    get Canvas(): any;
    canvas: any;
    /**
     * @doc Method
     * @description Set new context
     * @example
     *  var context = document.getElementById("canvasName").getContext("typeContext");
     *  screen.Context(context);
     */
    set Context(context: any);
    /**
     * @doc Method
     * @description Get context of the screen
     * @example
     *  var newContext = screen.Context();
     * @returns context
     */
    get Context(): any;
    context: any;
    /**
     * @doc Method
     * @description Get screen id
     * @example
     *  var id = screen.ScreenId();
     * @returns number
     */
    get ScreenId(): string;
    /**
     * @doc Method
     * @description Initialize scene
     * @param {canvas} canvas
     * @param {context} context
     * @example
     *  var canvas = document.getElementById("canvasName");
     *  var context= canvas.getContext('2d');
     *  screen.Init(canvas, context);
     */
    Init(screenName: any): void;
    /**
     * @doc Method
     * @description return canvas width
     * @example
     *  var width = screen.Width();
     * @returns number
     */
    get Width(): any;
    /**
     * @doc Method
     * @description returns canvas height
     * @example
     *  var width = screen.Height();
     * @returns number
     */
    get Height(): any;
    /**
     * @doc Method
     * @description Return size screen
     * @example
     * var size = screen.GetSize();
     * @returns Vector2D
     */
    GetSize(): Vector2D;
    /**
     * @doc Method
     * @description Return size window browser
     * @example
     * var windowSize = GetwindowSize();
     * @returns Vector2D
     */
    GetwindowSize(): Vector2D;
    Refresh(): void;
    /**
     * @doc Method
     * @param {width} width
     * @param {height} height
     * @description Resize screen
     * @example
     *  screen.Resize(640, 480);
     */
    Resize(vector2D: any): void;
    FullScreen(): void;
    /**
     * @doc Method
     * @description Get position screen
     * @example
     *  var position = screen.Position();
     * @returns Vector2D
     */
    get Position(): Vector2D;
    MDC(width: any, height: any): any;
}
import { Vector2D } from "../../core/Math/Vector2D.js";
