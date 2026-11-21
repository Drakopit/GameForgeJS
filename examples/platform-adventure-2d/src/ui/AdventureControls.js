import { ActionManager } from 'gameforgejs/core';
import { ActionBar, Button, VirtualStick } from 'gameforgejs/2d';

export class AdventureControls {
    constructor(level) {
        this.level = level;
        this.stick = new VirtualStick(level.screen);
        this.pending = new Set();
        this.edges = new Set();
        this.help = new Button(level.screen, { pointerInput: true });
        this.help.OnClick(() => level.controlsHelp.Toggle());
        this.bar = new ActionBar(level.screen, level.draw, ['JUMP', 'ATTACK'].map(action => ({
            label: action, touchOnly: true, run: () => this.pending.add(action),
        })));
    }
    Update() {
        const screen = this.level.screen;
        this.edges = this.pending;
        this.pending = new Set();
        this.stick.origin.Set(68, screen.Height - 67);
        if (this.level.controlsHelp.visible) this.stick.Cancel();
        else this.stick.Update();
    }
    IsAction(action) {
        const axis = this.stick.direction.x;
        return ActionManager.IsAction(action) || (action === 'LEFT' && axis < -0.24)
            || (action === 'RIGHT' && axis > 0.24);
    }
    IsActionDown(action) { return ActionManager.IsActionDown(action) || this.edges.has(action); }
    Draw() {
        const { screen, controlsHelp } = this.level;
        const x = screen.Width - 148;
        this.help.SetButton({ x, y: 12, width: 136, height: 34 });
        if (!controlsHelp.visible) {
            controlsHelp.DrawAction('HELP', x, 12);
            this.stick.Draw(screen.Context);
            this.bar.Draw();
        }
    }
    Dispose() { this.help.Dispose(); this.stick.Cancel(); this.bar.Dispose(); }
}
