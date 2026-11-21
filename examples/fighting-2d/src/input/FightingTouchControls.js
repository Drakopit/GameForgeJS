import { Input, Touch } from 'gameforgejs/core';
import { Draw, ActionBar, VirtualStick } from 'gameforgejs/2d';
/** P1 touch adapter preserves action edges until the existing reader consumes them. */
export class FightingTouchControls {
    constructor(screen) {
        this.screen = screen;
        this.stick = new VirtualStick(screen);
        this.pending = {};
        this.guard = false;
        this.bar = new ActionBar(screen, new Draw(screen), ['light', 'heavy', 'special', 'super', 'up', 'down', 'medium'].map(action => ({
            command: action,
            label: ({ special: 'POWER', up: 'JUMP', down: 'GUARD' })[action] ?? action.toUpperCase(), touchOnly: true,
            run: () => this.pending[action] = true,
        })));
    }
    Update() {
        this.stick.origin.Set(76, this.screen.Height - 85);
        this.stick.Update();
        this.bar.Layout();
        this.guard = false;
        if (!Input.instance.presentation.TouchVisible) {
            this.pending = {};
            return;
        }
        // Identified Touch edges cover simultaneous fingers even when a browser
        // does not dispatch a secondary compatibility pointer/click event.
        for (const contact of Input.instance.touch.GetStartedTouches()) {
            const point = Touch.ToScreen(contact.startPosition, this.screen);
            for (const action of this.bar.buttons) {
                const rect = action.button.rect;
                if (action.button.enabled && point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height)
                    this.pending[action.command] = true;
            }
        }
        const guard = this.bar.buttons.find(action=>action.command==='down').button.rect;
        const points = Input.instance.touch.GetActiveTouches().map(contact => contact.position);
        if (Input.instance.mouse.buttons[0])
            points.push(Input.instance.mouse.position);
        this.guard = points.map(point => Touch.ToScreen(point, this.screen)).some(p => p.x >= guard.x && p.x <= guard.x + guard.width && p.y >= guard.y && p.y <= guard.y + guard.height);
    }
    Read() {
        const command = { ...this.pending,crouch:this.stick.direction.y>0.5, left: this.stick.direction.x < -0.2, right: this.stick.direction.x > 0.2, down: this.guard || this.stick.direction.y > 0.5 };
        this.pending = {};
        return command;
    }
    Clear() { this.pending = {}; this.guard = false; this.stick.Cancel(); }
    Draw() { this.stick.Draw(this.screen.Context); this.bar.Draw(); }
    Dispose() { this.bar.Dispose(); this.stick.Cancel(); this.pending = {}; }
}
