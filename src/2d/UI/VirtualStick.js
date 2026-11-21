import { Input } from '../../core/Input/Input.js';
import { Touch } from '../../core/Input/Touch.js';
import { Vector2D } from '../../core/Math/Vector2D.js';

/**
 * Identified touch stick sharing Input's contacts; owns no DOM, listeners or loop.
 * Set origin from the HUD layout, then Update once per frame and read direction.
 */
export class VirtualStick {
    /** @param {import('../Window/Screen.js').Screen} screen @param {{radius?: number, deadzone?: number}} [options] */
    constructor(screen, { radius = 48, deadzone = 0.12 } = {}) {
        if (!Number.isFinite(radius) || !(radius > 0) || !(deadzone >= 0 && deadzone < 1)) throw new RangeError('Invalid virtual stick range.');
        this.screen = screen; this.radius = radius; this.deadzone = deadzone;
        this.origin = new Vector2D(); this.direction = new Vector2D(); this.identifier = null;
    }
    /** Call each engine frame; origin can follow responsive HUD layout. */
    Update() {
        if (Input.instance?.presentation && !Input.instance.presentation.TouchVisible) { this.Cancel(); return; }
        const touch = Input.instance?.touch;
        this.direction.Set(0, 0);
        if (!touch) return;
        for (const contact of touch.GetStartedTouches()) {
            const point = Touch.ToScreen(contact.startPosition, this.screen);
            if (this.identifier === null && point.DistanceTo(this.origin) <= this.radius * 1.6) this.identifier = contact.identifier;
        }
        const contact = touch.GetTouch(this.identifier);
        if (!contact) { this.identifier = null; return; }
        const delta = Touch.ToScreen(contact.position, this.screen).Subtract(this.origin);
        const length = delta.Length();
        if (length > this.radius * this.deadzone) this.direction.Copy(delta.DivideScalar(Math.max(this.radius, length)));
    }
    Draw(context) {
        if (Input.instance?.presentation && !Input.instance.presentation.TouchVisible) return;
        context.save();
        context.strokeStyle = '#a4d7d9'; context.fillStyle = '#102d4077'; context.lineWidth = 2;
        context.beginPath(); context.arc(this.origin.x, this.origin.y, this.radius, 0, Math.PI * 2); context.fill(); context.stroke();
        context.fillStyle = '#b7f5df'; context.beginPath();
        context.arc(this.origin.x + this.direction.x * this.radius * 0.7, this.origin.y + this.direction.y * this.radius * 0.7, 14, 0, Math.PI * 2);
        context.fill(); context.restore();
    }
    Cancel() { this.identifier = null; this.direction.Set(0, 0); }
}
