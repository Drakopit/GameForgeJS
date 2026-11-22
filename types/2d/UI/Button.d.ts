/**
 * Canvas-rendered clickable UI button.
 *
 * @param {Screen} screen - Screen used for drawing and pointer input.
 * @param {Object} [options] - Optional input behavior.
 * @param {boolean} [options.pointerInput=false] - Invoke OnClick on native mouse/touch/pen
 * gestures, including callbacks that open an OS keyboard. Call Dispose on removal.
 */
export class Button {
    constructor(screen: any, { pointerInput }?: {
        pointerInput?: boolean;
    });
    screen: any;
    color: string;
    draw: Draw;
    mouse: Mouse;
    rect: Rectangle;
    onClickHandler: any;
    enabled: boolean;
    pointerInput: boolean;
    pointerHandler: (event: any) => void;
    SetButton(rect: any): void;
    /**
     * @doc Method
     * @param {string} color
     * @description Changes the button color.
     * @example
     *  button.Color = "#FF5733";
     * @returns {void}
     */
    set Color(color: string);
    /**
     * @doc Method
     * @param {function} callback
     * @description Executes the provided callback function when the button is clicked.
     * @example
     *  button.Click(() => {
     *      console.log("Button was clicked!");
     *  });
     * @returns {void}
     */
    Click(callback: Function): void;
    OnClick(callback: any): void;
    Update(callback: any): boolean;
    Dispose(): void;
    /**
     * @doc Method
     * @param {Rectangle} rect
     * @description Draws the button UI with the specified rectangle.
     * @example
     *  button.DrawCursor(new Rectangle(0, 0, 121, 24));
     * @returns {void}
     */
    DrawCursor(rect: Rectangle): void;
}
import { Draw } from "../Graphics/Draw.js";
import { Mouse } from "../../core/Input/Mouse.js";
import { Rectangle } from "../Graphics/Rectangle.js";
