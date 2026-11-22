/**
 * Creates and owns the canvas used by Render3D and legacy WebGL levels.
 *
 * @param {string} id - Canvas element identifier.
 * @param {number} [width] - Logical canvas width.
 * @param {number} [height] - Logical canvas height.
 */
export class Screen3D {
    constructor(id: any, width: any, height: any, { config, parent }?: {
        parent?: any;
    });
    id: any;
    config: any;
    parent: any;
    width: any;
    height: any;
    ratio: number;
    clientWidth: number;
    clientHeight: number;
    x: number;
    y: number;
    /**
     * @doc Method
     * @description Set a new canvas element
     * @example
     *  screen.Canvas(canvas);
     * @param {HTMLCanvasElement} canvas
     */
    set Canvas(canvas: HTMLCanvasElement);
    /**
     * @doc Method
     * @description Get the canvas element of the screen
     * @example
     *  var canvas = screen.Canvas();
     * @returns {HTMLCanvasElement}
     */
    get Canvas(): HTMLCanvasElement;
    canvas: HTMLCanvasElement;
    /**
     * @doc Method
     * @description Set a new WebGL rendering context
     * @example
     *  screen.Context(context);
     * @param {WebGLRenderingContext} context
     */
    set Context(context: WebGLRenderingContext);
    /**
     * @doc Method
     * @description Get the WebGL rendering context
     * @example
     *  var context = screen.Context();
     * @returns {WebGLRenderingContext}
     */
    get Context(): WebGLRenderingContext;
    gl: RenderingContext;
    /**
     * @doc Method
     * @description Get screen ID
     * @example
     *  var id = screen.ScreenId();
     * @returns {number}
     */
    get ScreenId(): number;
    /**
     * @doc Method
     * @description Initialize the canvas and WebGL context
     * @param {string} screenName - The ID of the canvas
     * @example
     *  screen.Init('canvasName');
     */
    Init(screenName: string): void;
    /**
     * @doc Method
     * @description Return canvas width
     * @example
     *  var width = screen.Width();
     * @returns {number}
     */
    get Width(): number;
    /**
     * @doc Method
     * @description Return canvas height
     * @example
     *  var height = screen.Height();
     * @returns {number}
     */
    get Height(): number;
    /**
     * @doc Method
     * @description Return the size of the canvas
     * @example
     *  var size = screen.GetSize();
     * @returns {Vector2D}
     */
    GetSize(): Vector2D;
    /**
     * @doc Method
     * @description Return the size of the browser window
     * @example
     *  var windowSize = screen.GetwindowSize();
     * @returns {Vector2D}
     */
    GetwindowSize(): Vector2D;
    /**
     * @doc Method
     * @description Clear the screen
     * @example
     *  screen.Refresh();
     */
    Refresh(): void;
    /**
     * @doc Method
     * @param {Vector2D} vector2D
     * @description Resize the canvas
     * @example
     *  screen.Resize(new Vector2D(640, 480));
     */
    Resize(vector2D: Vector2D): void;
    FullScreen(): void;
    /**
     * @doc Method
     * @description Get the position of the screen
     * @example
     *  var position = screen.Position();
     * @returns {Vector2D}
     */
    get Position(): Vector2D;
    MDC(width: any, height: any): any;
}
import { Vector2D } from "../../core/Math/Vector2D.js";
