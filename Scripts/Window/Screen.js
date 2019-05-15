/**
 * @doc Class Screen
 * @namespace Window
 * @class Screen
 * @author Patrick Faustino Camello
 * @summary That class was made, to compose the EngineHtml5 framework.
 * @Date 15/05/2019
 * @example
 *  var screen = new Screen(0, 320, 240);
 * @returns {Object}
 */
import { Vector2 } from "Math/Vector2.js";
class Screen {
    constructor(id, width, height) {
        this.id = id;
        this.width = width;
        this.height = height;
        this.x = 0;
        this.y = 0;
    }

    /**
     * @doc Method
     * @description Get canvas of the screen
     * @example
     *  var newCanvas = screen.Canvas();
     * @returns {this.canvas}
     */
    get Canvas() { return this.canvas; }

    /**
     * @doc Method
     * @description Set new canvas
     * @example
     * var canvas = document.getElementById("canvasName")
     *  screen.Canvas(canvas)
     * @returns {}
     */
    set Canvas(canvas) { this.canvas = canvas; }
    
    /**
     * @doc Method
     * @description Get context of the screen
     * @example
     *  var newContext = screen.Context();
     * @returns {this.context}
     */
    get Context() { return this.context }

    /**
     * @doc Method
     * @description Set new context
     * @example
     *  var context = document.getElementById("canvasName").getContext("typeContext");
     *  screen.Context(context);
     * @returns {}
     */
    set Context(context) { this.context = context; }

    /**
     * @doc Method
     * @description Get screen id
     * @example
     *  var id = screen.ScreenId();
     * @returns {this.id}
     */
    get ScreenId() { return this.id; }

    /**
     * @doc Method
     * @description Initialize scene
     * @param {canvas} canvas 
     * @param {context} context
     * @example
     *  var canvas = document.getElementById("canvasName");
     *  var context= canvas.getContext('2d');     
     *  screen.Init(canvas, context);
     * @returns {}
     */
    Init(canvas, context) {
        this.canvas = canvas;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = context;
    }

    /**
     * @doc Method
     * @description return canvas width
     * @example
     *  var width = screen.Width();
     * @returns {this.canvas.width}
     */
    get Width() { return this.canvas.width; }
    
    /**
     * @doc Method
     * @description returns canvas height
     * @example
     *  var width = screen.Height();
     * @returns {this.canvas.height}
     */
    get Height() { return this.canvas.height; }

    /**
     * @doc Method
     * @param {width} width 
     * @param {height} height
     * @description Resize screen
     * @example
     *  screen.Resize(640, 480);
     * @returns {}
     */
    Resize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    /**
     * @doc Method
     * @description Get position screen
     * @example
     *  var position = screen.Position();
     * @returns {Vector2}
     */
    get Position() { return new Vector2(this.x, this.y)}

    /**
     * @doc Method
     * @param {x} x 
     * @param {y} y
     * @description Change screen position
     * @example
     *  screen.Position(150, 100);
     * @returns {} 
     */
    Position(x, y) {
        this.x = x;
        this.y = y;
        this.canvas.style.position = "absolute";
        this.canvas.style.left = `${this.x}px`;
        this.canvas.style.top = `${this.y}px`;
    }
}
