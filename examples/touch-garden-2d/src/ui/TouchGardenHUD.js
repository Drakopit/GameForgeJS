import { Button, Draw, HUDFrame, InputHelpPanel } from 'gameforgejs/2d';
import { Input, Vector2D } from 'gameforgejs/core';
import { GardenSettings as Settings } from '../data/GardenSettings.js';

export class TouchGardenHUD {
    get helpVisible() {return this.help?.visible ?? this._helpVisible ?? false;}
    set helpVisible(value) {this._helpVisible=value;if(this.help)this.help.visible=value;}
    constructor(screen, controls, onReset) {
        this.screen = screen;
        this.controls = controls;
        this.frame = new HUDFrame({ screen });
        this.helpVisible = false;
        this.help = new InputHelpPanel(new Draw(screen), { title: 'Touch Garden / Controls' });
        this.buttons = [
            ['?', Settings.helpButton, () => this.help.Toggle()],
            ['R', Settings.resetButton, onReset],
        ].map(([label, rect, callback]) => {
            const button = new Button(screen, { pointerInput: true });
            button.SetButton(rect);
            button.OnClick(callback);
            return { label, button };
        });
    }

    Draw(level) {
        const frame = this.frame;
        frame.Panel({ x: 16, y: 16, width: 448, height: 109 });
        frame.Text('TOUCH GARDEN', 30, 44, { size: 21, color: frame.theme.gold, weight: 700 });
        for (const { label, button: { rect: box } } of this.buttons) {
            frame.Panel(box); frame.Text(label, box.x + box.width / 2, box.y + 22, { size: 16, align: 'center' });
        }
        frame.Text(`${level.collected} / ${level.crystals.length} crystals`, 30, 90, { size: 15, weight: 700 });
        frame.Text(`${level.player.motion.dashes} dashes  /  ${level.player.bumps} bumps`, 450, 89, { size: 11, align: 'right', color: frame.theme.muted });
        frame.Meter(level.collected / level.crystals.length, { x: 30, y: 103, width: 420, height: 5 }, frame.theme.gold);
        frame.Text(level.collected === level.crystals.length ? 'Garden cleared. Keep exploring, or tap R to replay.' : 'Collect the crystals. Dash around the stone planters.', 240, 141,
            { size: 12, color: frame.theme.text, align: 'center', maxWidth: 450 });
        if (Input.instance?.presentation?.TouchVisible) this.DrawControls(level.player.motion);
        this.help.OnDrawn();
    }

    DrawControls(motion) {
        const ctx = this.screen.Context;
        const origin = this.controls.identifier === null ? Settings.stickOrigin : this.controls.origin;
        const knob = Vector2D.FromObject(origin).Add(this.controls.direction.MultiplyScalar(Settings.stickRadius * 0.7));
        ctx.save();
        ctx.fillStyle = 'rgba(85,151,151,0.1)'; ctx.strokeStyle = '#537e88'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(origin.x, origin.y, Settings.stickRadius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#6ccfba'; ctx.beginPath(); ctx.arc(knob.x, knob.y, 24, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#263644'; ctx.strokeStyle = this.frame.theme.gold;
        ctx.beginPath(); ctx.arc(Settings.action.x, Settings.action.y, Settings.action.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        const ready = 1 - motion.cooldownRemaining / Settings.cooldownSeconds;
        ctx.strokeStyle = '#75dfb4'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(Settings.action.x, Settings.action.y, Settings.action.radius + 7, -Math.PI / 2, -Math.PI / 2 + ready * Math.PI * 2); ctx.stroke();
        ctx.restore();
        this.frame.Text('MOVE', origin.x, origin.y + 5, { size: 10, color: '#153c43', weight: 700, align: 'center' });
        this.frame.Text('DASH', Settings.action.x, Settings.action.y + 5, { size: 15, color: this.frame.theme.gold, weight: 700, align: 'center' });
    }

    Dispose() {
        for (const { button } of this.buttons) button.Dispose();
        this.help.Dispose();
    }
}
