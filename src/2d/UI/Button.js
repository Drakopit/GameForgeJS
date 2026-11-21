/**
 * @doc Class Button
 * @namespace UI
 * @class Button
 * @author Patrick Faustino Camello
 * @summary This class is part of the GameForgeJS framework and provides functionality to create and interact with UI buttons.
 * @Date 15/05/2019
 * @example
 *  var button = new Button(screen);
 * @returns {Object}
 */

import { Draw } from "../Graphics/Draw.js";
import { Mouse } from "../../core/Input/Mouse.js";
import { Rectangle } from "../Graphics/Rectangle.js"; // Certifique-se de que a classe Rectangle está corretamente importada
const handledPointers = new WeakSet();

/**
 * Canvas-rendered clickable UI button.
 *
 * @param {Screen} screen - Screen used for drawing and pointer input.
 * @param {Object} [options] - Optional input behavior.
 * @param {boolean} [options.pointerInput=false] - Invoke OnClick on native mouse/touch/pen
 * gestures, including callbacks that open an OS keyboard. Call Dispose on removal.
 */
export class Button {
    constructor(screen, { pointerInput = false } = {}) {
        this.screen = screen;
        this.color = "#428BCA";
        this.draw = new Draw(screen);
        this.mouse = new Mouse();
        this.rect = new Rectangle(0, 0, 80, 15);
        this.onClickHandler = null;
        this.enabled = true;
        this.pointerInput = pointerInput;
        this.pointerHandler = event => {
            if (!this.enabled || event.button > 0 || handledPointers.has(event)
                || (screen.inputModal && screen.inputModal !== this.modalOwner)) return;
            const bounds = screen.Canvas.getBoundingClientRect();
            const x = (event.clientX - bounds.left) * screen.Canvas.width / bounds.width;
            const y = (event.clientY - bounds.top) * screen.Canvas.height / bounds.height;
            if (x >= this.rect.x && x <= this.rect.x + this.rect.width
                && y >= this.rect.y && y <= this.rect.y + this.rect.height) {
                handledPointers.add(event);
                event.preventDefault(); this.onClickHandler?.();
            }
        };
        if (pointerInput) screen.Canvas.addEventListener('pointerdown', this.pointerHandler);
    }

    SetButton(rect) {
        this.rect = rect;
    }

    /**
     * @doc Method
     * @param {string} color
     * @description Changes the button color.
     * @example
     *  button.Color = "#FF5733";
     * @returns {void}
     */
    set Color(color) {
        this.color = color;
    }

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
    Click(callback) {
        return this.Update(callback);
    }

    OnClick(callback) {
        this.onClickHandler = callback;
    }

    Update(callback) {
        if (!this.enabled || this.pointerInput || (this.screen.inputModal && this.screen.inputModal !== this.modalOwner)) return false;
        const cb = callback || this.onClickHandler;
        if (this.mouse.ClickDown(this.rect)) {
            if (typeof cb === 'function') {
                cb();
            }
            return true;
        }
        return false;
    }

    Dispose() {
        this.screen.Canvas.removeEventListener('pointerdown', this.pointerHandler);
        this.onClickHandler = null;
    }

    /**
     * @doc Method
     * @param {Rectangle} rect
     * @description Draws the button UI with the specified rectangle.
     * @example
     *  button.DrawCursor(new Rectangle(0, 0, 121, 24));
     * @returns {void}
     */
    DrawCursor(rect) {
        this.rect = rect || this.rect;
        this.draw.Color = this.color;
        this.draw.Style = 1;
        this.draw.DrawRect(this.rect.x + 1, this.rect.y + 1, this.rect.width - 1, this.rect.height - 1);
        this.draw.Style = 0;
        this.draw.DrawRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
        this.draw.Color = "white";
    }
}
