import { Vector2D } from "../Math/Vector2D.js";

/**
 * @doc Class Mouse
 * @namespace Input
 * @class Mouse
 * @author Patrick Faustino Camello
 * @summary That class was made, to compose the EngineHtml5 framework.
 * @Date 15/05/2019
 * @example
 *  In progress
 * @returns {Object}
 */
export class Mouse {
    constructor() {}

    PositionAbsolute() {
        let x, y = 0; 
        window.onmousemove = (e) => {
            x = e.ClientX;
            y = e.ClientY;
        };
        return new Vector2D(x, y);
    }

    PositionRelative() {
        let x, y = 0;
        window.onmousemove = (e) => {
            x = e.ClientX;
            y = e.ClientY;
        };
        return new Vector2D(x, y);
    }

    PositionClickDown() {
        let x, y = 0;
        window.onmousedown = (e) => {
            x = e.clientX;
            y = e.clientY;
        };
        return new Vector2D(x, y);
    }

    PositionClickRelease() {
        let x, y = 0;
        window.onmouseup = (e) => {
            x = e.clientX; y = e.clientY;
        };
        return new Vector2D(x, y);
    }

    ClickDown(rect) {
        let x, y = 0;
        window.onmousedown = (e) => {
            x = e.clientX;
            y = e.clientY;
        };

        if (Collide2D.isCollidingPoint(new Vector2D(x, y), rect)) return true;
        return false;
    }

    ClickRelease(rect) {
        let x, y = 0;
        window.onmouseup = (e) => {
            x = e.clientX;
            y = e.clientY;
        };

        if (Collide2D.isCollidingPoint(new Vector2D(x, y), rect)) return true;
        return false;
    }

    MouseMoveListener(evt) {}
    MouseDownListener(evt) {}
    MouseReleaseListener(evt) {}
}

Mouse.prototype.AddEvent = function() {
    if (document.addEventListener) {
		document.addEventListener("mousemove", this.MouseMoveListener, false);
		document.addEventListener("mousedown", this.MouseDownListener, false);
		document.addEventListener("mouseup", this.MouseReleaseListener, false);		
    } else {
        document.attachEvent("onmousemove", this.MouseMoveListener);
		document.attachEvent("onmousedown", this.MouseDownListener);
		document.attachEvent("onmouseup", this.MouseReleaseListener);
    }
};