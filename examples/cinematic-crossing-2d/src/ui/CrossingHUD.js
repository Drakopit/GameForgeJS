import { ActionManager } from 'gameforgejs/core';
import { ActionBar, HUDFrame, Draw, VirtualStick, InputHelpPanel as InfoPanel } from 'gameforgejs/2d';

export class CrossingHUD {
    constructor(level) {
        this.level = level; this.frame = new HUDFrame(new Draw(level.screen)); this.stick = new VirtualStick(level.screen);
        this.help = new InfoPanel(new Draw(level.screen), {title: 'A reusable cinematic', lines: []});
        this.bar = new ActionBar(level.screen, new Draw(level.screen), [
            {label: 'PLAY', run: () => level.Play()}, {label: 'SKIP', run: () => level.sequence.Skip()}, {label: 'HELP', run: () => this.help.Toggle()},
        ]);
    }
    Update() {
        const screen = this.level.screen; this.stick.origin.Set(76, screen.Height - 80); this.stick.Update(); this.bar.Layout();
        if (ActionManager.IsActionDown('ACTION')) this.level.Play();
        if (ActionManager.IsActionDown('SKIP')) this.level.sequence.Skip();
        if (ActionManager.IsActionDown('HELP')) this.help.Toggle();
        this.help.layout.width = Math.min(560, screen.Width - 24); this.help.layout.x = 12;
    }
    Draw() {
        const level = this.level, frame = this.frame, screen = level.screen;
        frame.Text('LANTERN CROSSING', 20, 33, {size: 22, weight: 700});
        frame.Text(level.sequence.playing ? 'CINEMATIC / controls reserved' : 'EXPLORE / controls restored', 20, 56, {size: 13});
        if (level.sequence.playing) {
            const ctx = screen.Context; ctx.fillStyle = '#07101b'; ctx.fillRect(0, 70, screen.Width, 16); ctx.fillRect(0, screen.Height - 164, screen.Width, 16);
        }
        if (level.dialogue) {
            frame.Panel({x: 14, y: screen.Height - 230, width: screen.Width - 28, height: 60});
            frame.Text(level.dialogue, screen.Width / 2, screen.Height - 194, {align: 'center', size: 17, maxWidth: screen.Width - 50});
        }
        this.stick.Draw(screen.Context); this.bar.Draw(); this.help.OnDrawn();
    }
    Dispose() { this.help.Dispose(); this.bar.Dispose(); this.stick.Cancel(); }
}
