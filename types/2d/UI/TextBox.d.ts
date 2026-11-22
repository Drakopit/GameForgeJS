/**
 * Canvas-drawn editable text field for in-game GameForgeJS UI.
 *
 * @param {Screen} screen - Screen used for drawing and pointer coordinates.
 * @param {Object} [options] - Optional text entry behavior.
 * @param {boolean} [options.nativeInput=false] - Use OS keyboard/IME through an
 * invisible platform input. Canvas still renders the field. Call Dispose on removal.
 */
export class TextBox {
    constructor(screen: any, { nativeInput }?: {
        nativeInput?: boolean;
    });
    screen: any;
    nativeInput: boolean;
    bridge: any;
    onSubmit: any;
    color: string;
    backgroundColor: string;
    borderColor: string;
    activeBorderColor: string;
    draw: Draw;
    mouse: any;
    rect: Rectangle;
    text: string;
    isActive: boolean;
    placeholder: string;
    maxLength: number;
    blinkTime: number;
    textScroll: number;
    pointerFocus: (event: any) => void;
    /**
     * @doc Method
     * @param {Rectangle} rect
     * @description Sets the dimensions and position of the text box.
     * @example
     *  textBox.SetBox(new Rectangle(10, 20, 200, 30));
     * @returns {void}
     */
    SetBox(rect: Rectangle): void;
    /**
     * @doc Method
     * @param {string} color
     * @description Changes the text box color.
     * @example
     *  textBox.Color = "#FF5733";
     * @returns {void}
     */
    set Color(color: string);
    /**
     * @doc Method
     * @param {string} text
     * @description Sets the text content of the text box.
     * @example
     *  textBox.SetText("Hello World");
     * @returns {void}
     */
    SetText(text: string): void;
    SetActive(active?: boolean): void;
    SetPlaceholder(text: any): void;
    SetMaxLength(maxLength: any): void;
    /** Advance caret animation from the owner's existing update lifecycle. */
    OnUpdate(dt?: number): void;
    ResetCaretBlink(): void;
    /** Position the native insertion point at the clicked Canvas text location. */
    PlaceCaret(pointerX: any): void;
    /**
     * @doc Method
     * @description Gets the text content of the text box.
     * @example
     *  const content = textBox.GetText();
     * @returns {string} The current text in the text box.
     */
    GetText(): string;
    Dispose(): void;
    /**
     * @doc Method
     * @param {KeyboardEvent} event
     * @description Handles keyboard input when the text box is active.
     * @example
     *  window.addEventListener("keydown", (event) => textBox.HandleInput(event));
     * @returns {void}
     */
    HandleInput(event: KeyboardEvent): void;
    /**
     * @doc Method
     * @description Activates the text box if it is clicked.
     * @example
     *  textBox.Click();
     * @returns {void}
     */
    Click(): void;
    /**
     * @doc Method
     * @description Draws the text box on the screen.
     * @example
     *  textBox.DrawCursor();
     * @returns {void}
     */
    DrawCursor(): void;
    DrawTextEntry(ctx: any): void;
    lastSelection: any;
}
import { Draw } from "../Graphics/Draw.js";
import { Rectangle } from "../Graphics/Rectangle.js";
