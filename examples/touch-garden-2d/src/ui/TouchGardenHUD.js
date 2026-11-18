import { HUDFrame } from 'gameforgejs/2d';
import { Vector2D } from 'gameforgejs/core';
import { GardenSettings as Settings } from '../data/GardenSettings.js';

export class TouchGardenHUD {
    constructor(screen, controls) {
        this.screen = screen;
        this.controls = controls;
        this.frame = new HUDFrame({ screen });
        this.helpVisible = false;
    }

    Draw(level) {
        const frame = this.frame;
        frame.Panel({ x: 16, y: 16, width: 448, height: 109 });
        frame.Text('TOUCH GARDEN', 30, 44, { size: 21, color: frame.theme.gold, weight: 700 });
        frame.Text('BUILDING BLOCKS  /  GAMEFORGEJS', 30, 62, { size: 10, color: frame.theme.muted });
        for (const [label, box] of [['?', Settings.helpButton], ['R', Settings.resetButton]]) {
            frame.Panel(box); frame.Text(label, box.x + box.width / 2, box.y + 22, { size: 16, align: 'center' });
        }
        frame.Text(`${level.collected} / ${level.crystals.length} crystals`, 30, 90, { size: 15, weight: 700 });
        frame.Text(`${level.player.motion.dashes} dashes  /  ${level.player.bumps} bumps`, 450, 89, { size: 11, align: 'right', color: frame.theme.muted });
        frame.Meter(level.collected / level.crystals.length, { x: 30, y: 103, width: 420, height: 5 }, frame.theme.gold);
        frame.Text(level.collected === level.crystals.length ? 'Garden cleared. Keep exploring, or tap R to replay.' : 'Collect the crystals. Dash around the stone planters.', 240, 141,
            { size: 12, color: frame.theme.text, align: 'center', maxWidth: 450 });
        this.DrawControls(level.player.motion);
        frame.Text('Left thumb: move   •   Right thumb: dash', 240, 770, { size: 12, align: 'center', color: frame.theme.muted });
        frame.Text(`${this.controls.touch.GetActiveTouches().length} active touches  /  H: help  /  R: reset`, 240, 790, { size: 10, align: 'center', color: frame.theme.muted });
        if (this.helpVisible) this.DrawHelp();
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
        this.frame.Text('Space / A', Settings.action.x, Settings.action.y + 24, { size: 9, color: this.frame.theme.muted, align: 'center' });
    }

    DrawHelp() {
        this.frame.Panel({ x: 40, y: 205, width: 400, height: 330 });
        this.frame.Text('TOUCH FIELD GUIDE', 62, 240, { size: 21, color: this.frame.theme.gold, weight: 700 });
        const lines = [
            'Drag in the lower-left area to steer.',
            'Use a second finger on DASH while moving.',
            'The green ring shows dash recovery.',
            'Release or cancel to stop the stick.',
            'Stone planters block movement and dashes.',
            'Keyboard: WASD/arrows, Space, H, R.',
            'Gamepad: left stick/D-pad, A, Start, Y.',
            'Tap ? or press H to close. Play stays active.',
        ];
        lines.forEach((text, index) => this.frame.Text(text, 62, 276 + index * 29, { size: 13, maxWidth: 356 }));
    }
}
