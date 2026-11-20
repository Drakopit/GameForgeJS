import { Button } from './Button.js';
import { Rectangle } from '../Graphics/Rectangle.js';
import { HUDFrame } from './HUDFrame.js';

/**
 * Responsive Canvas action buttons. Keyboard/gamepad bindings stay in game config.
 * Layout before input/drawing; Dispose releases each native button's handler.
 */
export class ActionBar {
    /** @param {import('../Window/Screen.js').Screen} screen @param {import('../Graphics/Draw.js').Draw} draw @param {{label:string|(()=>string), run:()=>void}[]} actions */
    constructor(screen, draw, actions) {
        this.screen = screen; this.frame = new HUDFrame(draw);
        this.buttons = actions.map(action => {
            const button = new Button(screen, {pointerInput: true}); button.OnClick(action.run);
            return { ...action, button };
        });
    }
    Layout() {
        const gap = 7, width = 82, height = 44;
        const columns = Math.max(1, Math.min(this.buttons.length, Math.floor((this.screen.Width - 150) / (width + gap))));
        const rows = Math.ceil(this.buttons.length / columns);
        this.buttons.forEach((action, index) => action.button.SetButton(new Rectangle(
            this.screen.Width - 14 - columns * (width + gap) + index % columns * (width + gap),
            this.screen.Height - 14 - rows * (height + gap) + Math.floor(index / columns) * (height + gap), width, height)));
    }
    Draw() {
        this.Layout();
        for (const action of this.buttons) {
            if (!action.button.enabled) continue;
            const rect = action.button.rect; this.frame.Panel(rect);
            this.frame.Text(typeof action.label === 'function' ? action.label() : action.label, rect.x + rect.width / 2, rect.y + 28,
                {size: 13, align: 'center', weight: 700, maxWidth: rect.width - 8});
        }
    }
    Dispose() { for (const action of this.buttons) action.button.Dispose(); }
}
