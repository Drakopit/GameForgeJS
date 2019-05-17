/**
 * @doc Class Rect
 * @namespace Shapes
 * @class Rect
 * @author Patrick Faustino Camello
 * @summary That class was made, to compose the EngineHtml5 framework.
 * @Date 15/05/2019
 * @example
 *  var input = new Rect(0, 0, 32, 32);
 * @returns {Object} Object
 */
import { Vector2D } from "../Math/Vector2D.js";

export class Rect {
    constructor(x, y, width, height) {
        this.position = new Vector2D(x,y);
        this.size = new Vector2D(width, height);
    }

    /**
     * @doc Method
     * @description Get coordinates rect
     * @example
     *  var position = rect.Coordinates;
     * @returns {Vector2D} Vector2D
     */
    get Coordinates() {
        return this.position;
    }
    
    /**
     * @doc Method
     * @description Set coordinates rect
     * @example
     *  rect.Coordinates = new Vector2D(x,y);
     * @returns {Vector2D} Vector2D
     */
    set Coordinates(vector2D) {
        this.position = vector2D;
    }

    /**
     * @doc Method
     * @description Get size rect
     * @example
     *  var size = rect.Size;
     * @returns {Vector2D} Vector2D
     */
    get Size() {
        return this.size;
        // return new Vector2D(width, height);
    }

    /**
     * @doc Method
     * @description Set size rect
     * @example
     *  rect.Size = new Vector2D(width, height);
     * @returns {Vector2D} Vector2D
     */
    set Size(vector2D) {
        this.size = vector2D;
    }
}