/**
 * @doc Class TextBox
 * @namespace UI
 * @class TextBox
 * @summary This class is part of the GameForgeJS framework and provides functionality to create and interact with UI text boxes.
 * @Date 26/07/2024
 * @example
 *  var textBox = new TextBox(screen);
 * @returns {Object}
 */

import { Draw } from "../Graphics/Draw.js";
import { Mouse } from "../../core/Input/Mouse.js";
import { Rectangle } from "../Graphics/Rectangle.js";
import { NativeTextInput } from './NativeTextInput.js';

const CARET_BLINK_SECONDS = 0.5;
const TEXT_PADDING = 8;
const CARET_HEIGHT = 16;

/**
 * Canvas-drawn editable text field for in-game GameForgeJS UI.
 *
 * @param {Screen} screen - Screen used for drawing and pointer coordinates.
 * @param {Object} [options] - Optional text entry behavior.
 * @param {boolean} [options.nativeInput=false] - Use OS keyboard/IME through an
 * invisible platform input. Canvas still renders the field. Call Dispose on removal.
 */
export class TextBox {
    constructor(screen, { nativeInput = false } = {}) {
        this.screen = screen;
        this.nativeInput = nativeInput;
        this.bridge = null;
        this.onSubmit = null;
        this.color = "#DCE8FF";
        this.backgroundColor = "rgba(5, 12, 22, 0.92)";
        this.borderColor = "rgba(190, 213, 237, 0.46)";
        this.activeBorderColor = "#F4D26A";
        this.draw = new Draw(screen);
        this.mouse = Mouse.instance ?? new Mouse();
        this.rect = new Rectangle(0, 0, 100, 20);
        this.text = '';
        this.isActive = false;
        this.placeholder = "";
        this.maxLength = 120;
        this.blinkTime = 0;
        this.textScroll = 0;
        this.pointerFocus = event => {
            const bounds = this.screen.Canvas.getBoundingClientRect();
            const x = (event.clientX - bounds.left) * this.screen.Canvas.width / bounds.width;
            const y = (event.clientY - bounds.top) * this.screen.Canvas.height / bounds.height;
            const inside = x >= this.rect.x && x <= this.rect.x + this.rect.width
                && y >= this.rect.y && y <= this.rect.y + this.rect.height;
            if (inside) { event.preventDefault(); this.SetActive(true); this.PlaceCaret(x); }
            else if (this.isActive) this.SetActive(false);
        };
        if (nativeInput) screen.Canvas.addEventListener('pointerdown', this.pointerFocus);
    }

    /**
     * @doc Method
     * @param {Rectangle} rect
     * @description Sets the dimensions and position of the text box.
     * @example
     *  textBox.SetBox(new Rectangle(10, 20, 200, 30));
     * @returns {void}
     */
    SetBox(rect) {
        this.rect = rect;
        if (rect.width > 0 && rect.height > 0) this.bridge?.Position();
    }

    /**
     * @doc Method
     * @param {string} color
     * @description Changes the text box color.
     * @example
     *  textBox.Color = "#FF5733";
     * @returns {void}
     */
    set Color(color) {
        this.color = color;
    }

    /**
     * @doc Method
     * @param {string} text
     * @description Sets the text content of the text box.
     * @example
     *  textBox.SetText("Hello World");
     * @returns {void}
     */
    SetText(text) {
        this.text = String(text ?? "").slice(0, this.maxLength);
        if (this.bridge) this.bridge.element.value = this.text;
        this.ResetCaretBlink();
    }

    SetActive(active = true) {
        this.isActive = Boolean(active);
        this.ResetCaretBlink();
        if (this.nativeInput && this.isActive) {
            this.bridge ??= new NativeTextInput(this);
            this.bridge.Focus();
        } else if (this.bridge) {
            this.bridge.Dispose();
            this.bridge = null;
        }
    }

    SetPlaceholder(text) {
        this.placeholder = String(text ?? "");
    }

    SetMaxLength(maxLength) {
        this.maxLength = Math.max(1, Math.trunc(maxLength));
        this.text = this.text.slice(0, this.maxLength);
        if (this.bridge) {
            this.bridge.element.maxLength = this.maxLength;
            this.bridge.element.value = this.text;
        }
    }

    /** Advance caret animation from the owner's existing update lifecycle. */
    OnUpdate(dt = 1 / 60) {
        if (this.isActive) this.blinkTime = (this.blinkTime + Math.max(0, dt)) % (CARET_BLINK_SECONDS * 2);
    }

    ResetCaretBlink() { this.blinkTime = 0; }

    /** Position the native insertion point at the clicked Canvas text location. */
    PlaceCaret(pointerX) {
        if (!this.bridge) return;
        const ctx = this.screen.Context;
        ctx.save(); ctx.font = `13px ${this.draw.font}`;
        const target = pointerX - this.rect.x - TEXT_PADDING + this.textScroll;
        let index = 0;
        while (index < this.text.length) {
            const before = ctx.measureText(this.text.slice(0, index)).width;
            const after = ctx.measureText(this.text.slice(0, index + 1)).width;
            if (target < (before + after) / 2) break;
            index++;
        }
        ctx.restore();
        this.bridge.element.setSelectionRange(index, index);
        this.ResetCaretBlink();
    }

    /**
     * @doc Method
     * @description Gets the text content of the text box.
     * @example
     *  const content = textBox.GetText();
     * @returns {string} The current text in the text box.
     */
    GetText() {
        return this.text;
    }

    Dispose() {
        this.SetActive(false); this.onSubmit = null;
        this.screen.Canvas.removeEventListener('pointerdown', this.pointerFocus);
    }

    /**
     * @doc Method
     * @param {KeyboardEvent} event
     * @description Handles keyboard input when the text box is active.
     * @example
     *  window.addEventListener("keydown", (event) => textBox.HandleInput(event));
     * @returns {void}
     */
    HandleInput(event) {
        if (this.isActive) {
            if (event.key === "Backspace") {
                this.text = this.text.slice(0, -1);
            } else if (event.key.length === 1 && this.text.length < this.maxLength) {
                this.text += event.key;
            }
        }
    }

    /**
     * @doc Method
     * @description Activates the text box if it is clicked.
     * @example
     *  textBox.Click();
     * @returns {void}
     */
    Click() {
        if (!this.mouse.buttonsDown?.[0]) return false;
        const point = this.mouse.getPositionRelative(this.screen.Canvas);
        this.SetActive(point.x >= this.rect.x
            && point.x <= this.rect.x + this.rect.width
            && point.y >= this.rect.y
            && point.y <= this.rect.y + this.rect.height);
        return this.isActive;
    }

    /**
     * @doc Method
     * @description Draws the text box on the screen.
     * @example
     *  textBox.DrawCursor();
     * @returns {void}
     */
    DrawCursor() {
        const ctx = this.screen.Context;
        ctx.save();
        this.draw.Color = this.backgroundColor;
        this.draw.Style = this.draw.TYPES.FILLED;
        this.draw.DrawRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
        this.draw.Color = this.isActive ? this.activeBorderColor : this.borderColor;
        this.draw.Style = this.draw.TYPES.STROKED;
        this.draw.DrawRect(this.rect.x + 0.5, this.rect.y + 0.5, this.rect.width - 1, this.rect.height - 1);
        this.draw.Style = this.draw.TYPES.FILLED;
        this.draw.Color = this.text ? this.color : "rgba(220, 232, 255, 0.44)";
        this.draw.FontSize = "13px";
        ctx.textBaseline = "middle";
        ctx.textAlign = 'left';
        this.DrawTextEntry(ctx);
        ctx.restore();
    }

    DrawTextEntry(ctx) {
        const start = this.bridge?.element.selectionStart ?? this.text.length;
        const end = this.bridge?.element.selectionEnd ?? start;
        const signature = `${this.text}:${start}:${end}`;
        if (signature !== this.lastSelection) { this.ResetCaretBlink(); this.lastSelection = signature; }
        const width = Math.max(0, this.rect.width - TEXT_PADDING * 2);
        const caret = ctx.measureText(this.text.slice(0, start)).width;
        const textWidth = ctx.measureText(this.text).width;
        if (this.isActive) {
            this.textScroll = Math.max(0, Math.min(this.textScroll, caret));
            this.textScroll = Math.max(this.textScroll, caret - width + 2);
        } else this.textScroll = 0;
        this.textScroll = Math.min(this.textScroll, Math.max(0, textWidth - width + 2));
        ctx.beginPath();
        ctx.rect(this.rect.x + TEXT_PADDING, this.rect.y + 2, width, this.rect.height - 4);
        ctx.clip();
        const x = this.rect.x + TEXT_PADDING - this.textScroll;
        const y = this.rect.y + this.rect.height / 2;
        if (this.isActive && end > start) {
            ctx.fillStyle = 'rgba(244,210,106,0.3)';
            ctx.fillRect(x + caret, y - CARET_HEIGHT / 2,
                ctx.measureText(this.text.slice(start, end)).width, CARET_HEIGHT);
        }
        ctx.fillStyle = this.text ? this.color : 'rgba(220,232,255,0.44)';
        ctx.fillText(this.text || this.placeholder, x, y);
        if (this.isActive && this.blinkTime < CARET_BLINK_SECONDS) {
            ctx.fillStyle = this.activeBorderColor;
            ctx.fillRect(x + caret, y - CARET_HEIGHT / 2, 2, CARET_HEIGHT);
        }
    }
}
