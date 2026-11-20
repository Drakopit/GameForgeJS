import { Input, Touch, Vector2D } from 'gameforgejs/core';
import { GardenSettings as Settings } from '../data/GardenSettings.js';

export class TouchControls {
    constructor(touch, screen) {
        this.touch = touch;
        this.screen = screen;
        this.Reset();
    }

    Reset() {
        this.identifier = null;
        this.origin = Vector2D.FromObject(Settings.stickOrigin);
        this.direction = new Vector2D();
        this.dashPressed = this.helpPressed = this.resetPressed = false;
    }

    Update() {
        this.dashPressed = this.helpPressed = this.resetPressed = false;
        if (!Input.instance?.presentation?.TouchVisible) {this.identifier=null;this.direction.Set(0,0);return;}
        const cancelled = new Set(this.touch.GetEndedTouches().filter(contact => contact.cancelled).map(contact => contact.identifier));
        for (const contact of this.touch.GetStartedTouches()) {
            if (cancelled.has(contact.identifier)) continue;
            const point = Touch.ToScreen(contact.startPosition, this.screen);
            if (this.identifier === null && point.x < this.screen.width / 2 && point.y > Settings.arena.y + Settings.arena.height) {
                this.identifier = contact.identifier;
                this.origin = point;
            } else if (point.DistanceTo(Vector2D.FromObject(Settings.action)) <= Settings.action.radius) this.dashPressed = true;
            else if (this.Inside(point, Settings.helpButton)) this.helpPressed = true;
            else if (this.Inside(point, Settings.resetButton)) this.resetPressed = true;
        }
        const contact = this.touch.GetTouch(this.identifier);
        this.direction.Set(0, 0);
        if (!contact) { this.identifier = null; return; }
        const delta = Touch.ToScreen(contact.position, this.screen).Subtract(this.origin);
        const length = delta.Length();
        if (length < Settings.stickRadius * Settings.stickDeadzone) return;
        this.direction = delta.DivideScalar(Math.max(Settings.stickRadius, length));
    }

    Inside(point, rectangle) {
        return point.x >= rectangle.x && point.x <= rectangle.x + rectangle.width
            && point.y >= rectangle.y && point.y <= rectangle.y + rectangle.height;
    }
}
