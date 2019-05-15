/**
 * @doc Class Circle
 * @namespace Shapes
 * @class Circle
 * @author Patrick Faustino Camello
 * @summary That class was made, to compose the EngineHtml5 framework.
 * @Date 15/05/2019
 * @example
 *  var circle = new Circle();
 * @returns {Object}
 */
import { Vector2 } from "Math/Vector2.js";

class Circle {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
    }

    /**
     * @doc Method
     * @description Get coordinates circle
     * @example
     *  var position = circle.Coordinates();
     * @returns {Vector2}
     */
    get Cordinates() {
        return (new Vector2(x, y));
    }

    /**
     * @doc Method
     * @description Get size circle
     * @example
     *  var position = circle.Size();
     * @returns {number}
     */
    get Size() {
        return (Math.PI * (this.r*this.r))
    }
}