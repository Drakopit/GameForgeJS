/**
 * @doc Class Vector2
 * @namespace Math
 * @class Vector2
 * @author Patrick Faustino Camello
 * @summary That class was made, to compose the EngineHtml5 framework.
 * @Date 15/05/2019
 * @example
 *  var vector2 = new Vector2(0, 0);
 * @returns {Object}
 */
export class Vector2 {
    constructor(x, y) {
        this.x = (x != undefined) ? x : 0;
        this.y = (y != undefined) ? y : 0;
    }

    /**
     * @doc Method
     * @description Get value x and y of Vector
     * @example
     *  var position = vector2.Value();
     * @returns {this.x && this.y}
     */
    get Value() {
        return this.x && this.y;
    }

    /**
     * @doc Method
     * @description Set value in Vector
     * @example
     *  vector2.Value(100, 150);
     * @returns {}
     */
    Value(x, y) {
        this.x = x;
        this.y = y;
    }
}