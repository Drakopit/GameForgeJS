import { ActionManager, Vector2D } from 'gameforgejs/core';
import { Button, Rectangle, HUDFrame, VirtualStick, InfoPanel } from 'gameforgejs/2d';

export class ObservatoryHUD {
    constructor(level) {
        this.level = level; this.frame = new HUDFrame(level.ui.Draw);
        this.stick = new VirtualStick(level.ui.Screen); this.fps = 0; this.elapsed = 0; this.frames = 0; this.telemetry = false;
        this.help = new InfoPanel(level.ui.Draw, {title: 'Explore the observatory', lines: [
            'WASD / left stick / touch stick: move', 'Space / A / JUMP: jump',
            'Right drag / right stick / right-side swipe: look', 'Q/E also orbit. C / Y: camera mode',
            'TOUR: cinematic. Escape / B: skip', 'R / Select: respawn. H / R3: help',
            'Native sphere/box physics; bridges connect all islands.',
            'T / RB / STATS: optional render telemetry.',
        ]});
        this.buttons = new Map();
        for (const [id, callback] of [['jump', () => level.jumpQueued = true], ['camera', () => this.ToggleCamera()],
            ['tour', () => level.tour.playing ? level.tour.Skip() : level.StartTour()], ['help', () => this.help.Toggle()],
            ['stats', () => this.telemetry = !this.telemetry]]) {
            const button = new Button(level.ui.Screen, {pointerInput: true}); button.OnClick(callback); this.buttons.set(id, button);
        }
    }
    ToggleCamera() { this.level.rig.mode = this.level.rig.mode === 'chase' ? 'orbit' : 'chase'; }
    Direction() {
        const v = this.stick.direction.Add(new Vector2D(ActionManager.GetActionValue('RIGHT') - ActionManager.GetActionValue('LEFT'),
            ActionManager.GetActionValue('DOWN') - ActionManager.GetActionValue('UP')));
        return v.Length() > 1 ? v.Normalize() : v;
    }
    Update(dt) {
        const screen = this.level.ui.Screen;
        this.stick.origin.Set(74, screen.Height - 82); this.stick.Update();
        this.elapsed += dt; this.frames++;
        if (this.elapsed > 0.5) { this.fps = this.frames / this.elapsed; this.frames = 0; this.elapsed = 0; }
        if (ActionManager.IsActionDown('ACTION')) this.level.jumpQueued = true;
        if (ActionManager.IsActionDown('SECONDARY')) this.ToggleCamera();
        if (ActionManager.IsActionDown('SKIP')) this.level.tour.Skip();
        if (ActionManager.IsActionDown('RESET')) this.level.ResetPlayer();
        if (ActionManager.IsActionDown('HELP')) this.help.Toggle();
        if (ActionManager.IsActionDown('TELEMETRY')) this.telemetry = !this.telemetry;
        let index = 0;
        for (const [id, button] of this.buttons) {
            if (id === 'stats') { button.SetButton(new Rectangle(screen.Width - 92, 14, 78, 44)); continue; }
            button.SetButton(new Rectangle(screen.Width - 182 + index++ % 2 * 86,
                screen.Height - 110 + Math.floor((index - 1) / 2) * 49, 80, 44));
        }
        this.help.layout = {...this.help.layout, x: 12, y: 90, width: Math.min(510, screen.Width - 24), lineHeight: 24};
    }
    Draw() {
        const screen = this.level.ui.Screen, frame = this.frame, stats = this.level.renderer.stats;
        frame.Text('AETHER / OBSERVATORY', 20, 32, {size: 18, weight: 700, maxWidth: screen.Width - 130});
        if (this.telemetry) frame.Text(`${this.fps.toFixed(0)} FPS · ${stats.visible} visible / ${stats.culled} culled`, 20, 64, {size: 13});
        for (const [id, button] of this.buttons) {
            frame.Panel(button.rect); frame.Text(id === 'tour' && this.level.tour.playing ? 'SKIP' : id.toUpperCase(),
                button.rect.x + 40, button.rect.y + 27, {align: 'center', size: 13, weight: 700});
        }
        this.stick.Draw(screen.Context);
        if (this.level.subtitle) {
            const width = Math.min(screen.Width - 28, 600), y = screen.Height * 0.65;
            frame.Panel({x: (screen.Width - width) / 2, y, width, height: 70});
            frame.Text(this.level.subtitle, screen.Width / 2, y + 42, {align: 'center', size: 21, maxWidth: width - 24});
        }
        this.help.OnDrawn();
    }
    Dispose() { for (const button of this.buttons.values()) button.Dispose(); this.stick.Cancel(); }
}
