import { ActionManager, Input, Touch } from 'gameforgejs/core';
import { ActionBar, VirtualStick } from 'gameforgejs/2d';
/** Native touch adapter; movement/coyote time/collision stay in PlatformerController. */
export class PlatformerControls {
    constructor(level) {
        this.level = level;
        this.stick = new VirtualStick(level.screen);
        this.bar = new ActionBar(level.screen, level.draw, [
            { label: 'JUMP', touchOnly: true, run: () => { } },
            { label: 'NEXT', touchOnly: true, visible:()=>level.won, run: () => { if (level.won)
                    level.Next = true; } },
            { label: 'HELP', touchOnly: true, run: () => level.hud.help.Toggle() },
        ]);
        this.jumpHeld = false;
        this.jumpEdge = false;
    }
    Update() {
        const screen = this.level.screen;
        this.stick.origin.Set(78, screen.Height - 66);
        this.bar.Layout();
        this.stick.Update();
        const jump = this.bar.buttons[0].button;
        const inside = contact => {
            const p = Touch.ToScreen(contact.position, screen), r = jump.rect;
            return jump.enabled && p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height;
        };
        this.jumpHeld = Input.instance.touch.GetActiveTouches().some(inside);
        this.jumpEdge = Input.instance.touch.GetStartedTouches().some(inside);
    }
    IsAction(action) {
        if (action === 'LEFT' && this.stick.direction.x < -0.25)
            return true;
        if (action === 'RIGHT' && this.stick.direction.x > 0.25)
            return true;
        return (action === 'JUMP' && this.jumpHeld) || ActionManager.IsAction(action);
    }
    IsActionDown(action) { return (action === 'JUMP' && this.jumpEdge) || ActionManager.IsActionDown(action); }
    Draw() { this.stick.Draw(this.level.screen.Context); this.bar.Draw(); }
    Dispose() { this.stick.Cancel(); this.bar.Dispose(); }
}
