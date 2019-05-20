import { Vector2D } from "../Math/Vector2D";

/**
 * @doc Class Mouse
 * @namespace Inputs
 * @class Mouse
 * @author Patrick Faustino Camello
 * @summary That class was made, to compose the EngineHtml5 framework.
 * @Date 15/05/2019
 * @example
 *  var mouse = new Mouse();
 * @returns {Object}
 */
export class Mouse {
    constructor();

    GetCoordinates() {
        let x, y = 0; 
        window.onmousemove = (e) => {
            x = e.ClientX;
            y = e.ClientY;
        };
        return new Vector2D(x, y);
    }
}
