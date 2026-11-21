// @ts-check
import { Input } from '../../core/Input/Input.js';
import { Touch } from '../../core/Input/Touch.js';

/**
 * Canvas slider using Input-owned mouse and identified touch contacts. The owner
 * supplies layout/drawing, calls OnUpdate and can Adjust for keyboard/gamepad.
 * No DOM node, input device, listener or loop is created.
 */
export class Slider {
    /** @param {{Canvas: HTMLCanvasElement}} screen @param {{min: number, max: number, step?: number, value?: number, onChange?: (value: number) => void}} options */
    constructor(screen, { min, max, step = 0.01, value = min, onChange = () => {} }) {
        if (![min, max, step, value].every(Number.isFinite) || max <= min || step <= 0) throw new RangeError('Invalid slider range.');
        this.screen = screen; this.min = min; this.max = max; this.step = step;
        this.value = value; this.onChange = onChange;
        this.rect = { x: 0, y: 0, width: 1, height: 1 };
        /** @type {number | null} */ this.finger = null;
        this.mouseCaptured = false;
    }
    /** @param {{x: number, y: number}} point */
    Contains(point) {
        return point.x >= this.rect.x && point.x <= this.rect.x + this.rect.width
            && point.y >= this.rect.y && point.y <= this.rect.y + this.rect.height;
    }
    /** @param {number} value */
    SetValue(value) {
        if (!Number.isFinite(value)) return;
        const next = Math.max(this.min, Math.min(this.max, this.min + Math.round((value - this.min) / this.step) * this.step));
        if (next !== this.value) { this.value = next; this.onChange(next); }
    }
    /** @param {number} direction */
    Adjust(direction) { this.SetValue(this.value + direction * this.step); }
    /** @param {number} x */
    SetFromPoint(x) { this.SetValue(this.min + (x - this.rect.x) / this.rect.width * (this.max - this.min)); }
    OnUpdate() {
        const input = Input.instance;
        const mouse = input?.mouse, touch = input?.touch;
        if (!mouse || !touch || !document.hasFocus()) { this.Cancel(); return; }
        const point = mouse.getPositionRelative(this.screen.Canvas);
        if (mouse.buttonsDown?.[0] && this.Contains(point)) {
            this.mouseCaptured = true;
            this.SetFromPoint(point.x);
        }
        if (this.mouseCaptured && mouse.buttons?.[0]) this.SetFromPoint(point.x);
        if (!mouse.buttons?.[0]) this.mouseCaptured = false;
        for (const contact of touch.GetStartedTouches()) {
            const position = Touch.ToScreen(contact.startPosition, this.screen);
            if (this.finger === null && this.Contains(position)) {
                this.finger = contact.identifier;
                this.SetFromPoint(position.x);
            }
        }
        if (this.finger !== null) {
            const contact = touch.GetTouch(this.finger);
            if (contact) this.SetFromPoint(Touch.ToScreen(contact.position, this.screen).x);
            else this.finger = null;
        }
    }
    Cancel() { this.finger = null; this.mouseCaptured = false; }
}
