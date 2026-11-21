import { ActionManager } from 'gameforgejs/core';
import { Button, HUDFrame, InputHelpPanel, Slider } from 'gameforgejs/2d';

const subjects = ['Basin', 'Polished metal', 'Rough stone', 'Wood grain'];

export class RendererHUD {
    constructor(level) {
        this.screen = level.ui.Screen;
        this.frame = new HUDFrame(level.ui.Draw, { gold: '#a9ddec', border: '#597586', text: '#edf4f7' });
        this.help = new InputHelpPanel(level.ui.Draw);
        this.open = false;
        this.sample = 0;
        this.focus = -1;
        this.animate = true;
        this.reflection = true;
        this.telemetry = false;
        this.orbit = new Slider(this.screen, { min: -0.9, max: 0.9, value: 0.32 });
        this.light = new Slider(this.screen, { min: -3.14, max: 3.14, value: -2.1 });
        this.rain = new Slider(this.screen, { min: 0, max: 1, value: level.gallery.intensity,
            onChange: value => level.gallery.SetRain(value) });
        this.sliders = [['Camera angle', this.orbit], ['Light angle', this.light], ['Rain intensity', this.rain]];
        const button = (label, change) => {
            const control = new Button(this.screen, { pointerInput: true });
            const activate = () => {
                change();
                level.gallery.sound.Play('select');
            };
            control.OnClick(activate);
            return { control, label, activate };
        };
        this.menu = button(() => this.open ? 'Close controls' : 'Render controls', () => this.Toggle());
        this.options = [
            button(() => subjects[this.sample], () => this.sample = (this.sample + 1) % subjects.length),
            button(() => this.animate ? 'Light moving' : 'Light fixed', () => this.animate = !this.animate),
            button(() => this.reflection ? 'Reflection on' : 'Reflection off', () => {
                this.reflection = !this.reflection;
                level.scene.planarReflection = this.reflection ? { height: 0 } : null;
            }),
            button(() => this.telemetry ? 'Stats on' : 'Stats off', () => this.telemetry = !this.telemetry),
        ];
        this.Toggle(false);
    }

    Toggle(open = !this.open) {
        this.open = open;
        this.focus = -1;
        for (const { control } of this.options) control.enabled = open;
        if (!open) for (const [, slider] of this.sliders) slider.Cancel();
    }

    Update() {
        if (!this.open) return;
        for (const [, slider] of this.sliders) slider.OnUpdate();
        const count = this.sliders.length + this.options.length;
        if (ActionManager.IsActionDown('INSPECT_DOWN')) this.focus = (this.focus + 1) % count;
        if (ActionManager.IsActionDown('INSPECT_UP')) this.focus = this.focus < 1 ? count - 1 : this.focus - 1;
        const slider = this.sliders[this.focus]?.[1];
        if (slider) {
            if (ActionManager.IsActionDown('INSPECT_LEFT')) slider.Adjust(-5);
            if (ActionManager.IsActionDown('INSPECT_RIGHT')) slider.Adjust(5);
        }
        if (ActionManager.IsActionDown('INSPECT_CONFIRM')) this.options[this.focus - this.sliders.length]?.activate();
    }

    DrawButton(option, x, y, width, height, scale, focused = false) {
        const rect = { x, y, width, height };
        option.control.SetButton({ x: x * scale, y: y * scale, width: width * scale, height: height * scale });
        this.frame.Panel(rect);
        this.frame.Text(option.label(), x + width / 2, y + height / 2 + 5, { size: 13, align: 'center', color: focused ? this.frame.theme.gold : this.frame.theme.text });
    }

    Draw(level) {
        const screen = this.screen;
        const ctx = screen.Context;
        const scale = Math.max(1, screen.Width / Math.max(1, screen.Canvas.getBoundingClientRect().width));
        const width = screen.Width / scale;
        const height = screen.Height / scale;
        const panelWidth = Math.min(250, width - 20);
        const x = width - panelWidth - 10;
        const row = Math.min(42, (height - 58) / 5);
        ctx.save();
        ctx.scale(scale, scale);
        this.DrawButton(this.menu, width - 145, 10, 135, 34, scale);
        if (this.open) {
            this.frame.Panel({ x, y: 49, width: panelWidth, height: row * 5 + 3 });
            this.sliders.forEach(([label, slider], i) => {
                const y = 50 + row * i;
                const track = { x: x + 12, y: y + row * 0.69, width: panelWidth - 24, height: 5 };
                this.frame.Text(label, track.x, y + 15, { size: 12, color: i === this.focus ? this.frame.theme.gold : this.frame.theme.text });
                this.frame.Meter((slider.value - slider.min) / (slider.max - slider.min), track, '#87cdde');
                slider.rect = { x: track.x * scale, y: (y + row * 0.42) * scale,
                    width: track.width * scale, height: row * 0.55 * scale };
            });
            this.options.forEach((option, i) => {
                const w = (panelWidth - 30) / 2;
                this.DrawButton(option, x + 12 + (i % 2) * (w + 6), 50 + row * (3 + Math.floor(i / 2)),
                    w, row - 4, scale, this.focus === this.sliders.length + i);
            });
            if (width >= 430) this.help.DrawAction('WEATHER', 10, 10);
        }
        if (this.telemetry) {
            this.frame.Panel({ x: 10, y: height - 42, width: Math.min(235, width - 20), height: 32 });
            this.frame.Text(`${level.FPS} FPS / ${level.frameTime?.toFixed(1) ?? '0.0'} ms / ${level.entities.length} entities`,
                20, height - 21, { size: 13, maxWidth: width - 40 });
        }
        ctx.restore();
    }

    Dispose() {
        this.help.Dispose();
        for (const { control } of [this.menu, ...this.options]) control.Dispose();
    }
}
