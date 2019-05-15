/**
 * @doc Class Rect
 * @namespace Shapes
 * @class Rect
 * @author Patrick Faustino Camello
 * @summary That class was made, to compose the EngineHtml5 framework.
 * @Date 15/05/2019
 * @example
 *  var input = new Rect(0, 0, 32, 32);
 * @returns {Object}
 */
import { Vector2 } from "Math/Vector2.js";

class Rect {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /**
     * @doc Method
     * @description Get coordinates rect
     * @example
     *  var position = rect.Coordinates();
     * @returns {Vector2}
     */
    get Coordinates() {
        return (new Vector2(x,y));
    }

    /**
     * @doc Method
     * @description Get size rect
     * @example
     *  var site = rect.Size();
     * @returns {Vector2}
     */
    get Size() {
        return (new Vector2(width, height))
    }
}