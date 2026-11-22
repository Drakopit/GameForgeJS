/**
 * Convenience factory for canvas buttons, labels and text boxes on a screen.
 *
 * @param {Screen} screen - Screen receiving UI elements.
 */
export class UI {
    constructor(screen: any);
    screen: any;
    /**
     * @doc Method
     * @param {number} x - The x-coordinate of the button's position.
     * @param {number} y - The y-coordinate of the button's position.
     * @param {number} width - The width of the button.
     * @param {number} height - The height of the button.
     * @param {function} callBack - The function to execute when the button is clicked.
     * @description Creates a button UI element and handles its click events.
     * @example
     *  ui.Button(10, 20, 100, 50, () => { console.log("Button clicked!"); });
     * @returns {Button} The created button instance.
     */
    Button(x: number, y: number, width: number, height: number, callBack: Function): Button;
    /**
     * @doc Method
     * @param {number} x - The x-coordinate of the text box's position.
     * @param {number} y - The y-coordinate of the text box's position.
     * @param {number} width - The width of the text box.
     * @param {number} height - The height of the text box.
     * @description Creates a text box UI element where users can input text.
     * @example
     *  ui.TextBox(10, 80, 200, 30);
     * @returns {TextBox} The created text box instance.
     */
    TextBox(x: number, y: number, width: number, height: number): TextBox;
    /**
     * @doc Method
     * @param {number} x - The x-coordinate of the label's position.
     * @param {number} y - The y-coordinate of the label's position.
     * @param {string} text - The text to display on the label.
     * @description Creates a label UI element to display static text.
     * @example
     *  ui.Label(10, 120, "Hello World");
     * @returns {Label} The created label instance.
     */
    Label(x: number, y: number, text: string): Label;
}
import { Button } from "./Button.js";
import { TextBox } from "./TextBox.js";
import { Label } from "./Label.js";
