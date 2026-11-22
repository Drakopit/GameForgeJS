/**
 * Simple canvas text label positioned by a rectangle.
 *
 * @param {Screen} screen - Screen used for drawing.
 */
export class Label {
    constructor(screen: any);
    screen: any;
    color: string;
    draw: Draw;
    rect: Rectangle;
    text: string;
    /**
     * @doc Method
     * @param {Rectangle} rect
     * @param {string} text
     * @description Sets the dimensions, position, and text content of the label.
     * @example
     *  label.SetLabel(new Rectangle(10, 20, 100, 20), "Hello World");
     * @returns {void}
     */
    SetLabel(rect: Rectangle, text: string): void;
    /**
     * @doc Method
     * @param {string} color
     * @description Changes the label color.
     * @example
     *  label.Color = "#FF5733";
     * @returns {void}
     */
    set Color(color: string);
    /**
     * @doc Method
     * @description Draws the label on the screen.
     * @example
     *  label.DrawLabel();
     * @returns {void}
     */
    DrawLabel(): void;
}
import { Draw } from "../Graphics/Draw.js";
import { Rectangle } from "../Graphics/Rectangle.js";
