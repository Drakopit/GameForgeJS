// @ts-check
import { ActionManager } from 'gameforgejs/core';
import { Button, Rectangle, Slider } from 'gameforgejs/2d';
import { ControlGroups } from './ControlSpecs.js';

/** Collapsible Canvas tuning dock; sliders share framework input, and touch has 44px hit areas. */
export class FoundryPanel {
    /** @param {import('../levels/FoundryLevel.js').FoundryLevel} level @param {import('gameforgejs/2d').HUDFrame} frame */
    constructor(level, frame) {
        this.level = level; this.frame = frame; this.open = false; this.tab = 0; this.page = 0; this.selected = 0;
        this.repeat = 0;
        /** @type {Map<string, Button>} */ this.buttons = new Map();
        /** @type {Map<import('../data/FoundryTypes.js').NumericSetting, Slider>} */ this.sliders = new Map();
        /** @type {{x:number,y:number,width:number,height:number} | null} */ this.occlusion = null;
        for (const group of ControlGroups) for (const control of group.controls) {
            if ('key' in control) this.sliders.set(control.key, new Slider(level.screen, { ...control,
                value: level.model.current[control.key], onChange: value => { level.model.current[control.key] = value; } }));
            else this.CreateButton(control.toggle, () => this.Toggle(control.toggle));
        }
        this.CreateButton('lab', () => this.ToggleOpen());
        this.CreateButton('close', () => this.ToggleOpen());
        this.CreateButton('more', () => { this.page++; this.selected = 0; });
        this.CreateButton('reset', () => level.Reset());
        this.CreateButton('drop', () => level.world.Drop(level.world.emitter.x, level.world.emitter.y - 70));
        this.CreateButton('burst', () => level.world.Burst());
        this.CreateButton('gust', () => level.world.Gust());
        this.CreateButton('help', () => { level.hud.help = !level.hud.help; });
        for (let index = 0; index < ControlGroups.length; index++) this.CreateButton(`tab${index}`, () => this.SetTab(index));
        for (let index = 0; index < level.model.data.presets.length; index++) this.CreateButton(`preset${index}`, () => level.SetPreset(index));
    }
    /** @param {string} id @param {() => void} callback */
    CreateButton(id, callback) {
        const button = new Button(this.level.screen, { pointerInput: true }); button.OnClick(callback); this.buttons.set(id, button);
    }
    ToggleOpen() { this.open = !this.open; for (const slider of this.sliders.values()) slider.Cancel(); }
    /** @param {number} index */
    SetTab(index) { this.tab = (index + ControlGroups.length) % ControlGroups.length; this.page = 0; this.selected = 0; }
    /** @param {import('./ControlSpecs.js').ToggleControl['toggle']} key */
    Toggle(key) {
        if (key === 'debug' || key === 'telemetry' || key === 'reducedMotion') this.level.model[key] = !this.level.model[key];
        else this.level.model.current[key] = !this.level.model.current[key];
    }
    /** @param {import('./ControlSpecs.js').ToggleControl['toggle']} key */
    ReadToggle(key) {
        return key === 'debug' || key === 'telemetry' || key === 'reducedMotion' ? this.level.model[key] : this.level.model.current[key];
    }
    Layout() {
        const screen = this.level.screen, width = Math.min(352, screen.Width - 24);
        const y = screen.Height < 500 ? 12 : 82;
        const height = Math.min(510, screen.Height - y - 12);
        const rows = Math.max(1, Math.min(6, Math.floor((height - 198) / 48)));
        const controls = ControlGroups[this.tab].controls;
        const pages = Math.ceil(controls.length / rows); this.page %= pages;
        return { x: screen.Width - width - 12, y, width, height, rows, pages,
            controls: controls.slice(this.page * rows, (this.page + 1) * rows) };
    }
    /** @param {{x:number,y:number}} point */
    Contains(point) {
        const rect = this.occlusion;
        if (rect && point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height) return true;
        return [...this.buttons.values()].some(button => button.enabled && point.x >= button.rect.x
            && point.x <= button.rect.x + button.rect.width && point.y >= button.rect.y && point.y <= button.rect.y + button.rect.height);
    }
    /** @param {number} dt */
    Update(dt) {
        if (ActionManager.IsActionDown('LAB')) this.ToggleOpen();
        if (!this.open) return;
        if (ActionManager.IsActionDown('TAB_NEXT')) this.SetTab(this.tab + 1);
        if (ActionManager.IsActionDown('TAB_PREVIOUS')) this.SetTab(this.tab - 1);
        const layout = this.Layout();
        if (ActionManager.IsActionDown('UP')) {
            if (this.selected === 0) { this.page = (this.page + layout.pages - 1) % layout.pages; this.selected = this.Layout().controls.length - 1; }
            else this.selected--;
        }
        if (ActionManager.IsActionDown('DOWN')) {
            this.selected++;
            if (this.selected >= layout.controls.length) { this.page++; this.selected = 0; }
        }
        const controls = this.Layout().controls;
        for (const control of controls) if ('key' in control) {
            const slider = this.sliders.get(control.key);
            if (slider) { slider.value = this.level.model.current[control.key]; slider.OnUpdate(); }
        }
        this.repeat -= dt;
        const selected = controls[this.selected % controls.length];
        const direction = Number(ActionManager.IsAction('RIGHT')) - Number(ActionManager.IsAction('LEFT'));
        if (direction && this.repeat <= 0) {
            if ('key' in selected) this.sliders.get(selected.key)?.Adjust(direction);
            else this.Toggle(selected.toggle);
            this.repeat = 0.16;
        }
        if (!direction) this.repeat = 0;
        if (ActionManager.IsActionDown('DROP') && 'toggle' in selected) this.Toggle(selected.toggle);
    }
    /** @param {string} id @param {string} label @param {number} x @param {number} y @param {number} width @param {number} [height] @param {boolean} [selected] */
    DrawButton(id, label, x, y, width, height = 40, selected = false) {
        const button = this.buttons.get(id);
        if (!button) return;
        button.SetButton(new Rectangle(x, y, width, height)); button.enabled = true;
        this.frame.Panel(button.rect);
        this.frame.Text(label, x + width / 2, y + height / 2 + 4, { align: 'center', size: 13,
            color: selected ? '#ffd497' : '#a8c4cb', weight: selected ? 700 : 400, maxWidth: width - 8 });
    }
    Draw() {
        for (const button of this.buttons.values()) button.enabled = false;
        const screen = this.level.screen, f = this.frame;
        this.DrawButton('lab', this.open ? 'CLOSE LAB  ×' : 'OPEN FX LAB', 20, screen.Height - 62, 148, 42, true);
        this.DrawButton('drop', 'DROP', 178, screen.Height - 62, 50, 42);
        this.DrawButton('burst', 'BURST', 238, screen.Height - 62, 54, 42);
        this.DrawButton('gust', 'GUST', 302, screen.Height - 62, 50, 42);
        if (screen.Width >= 640) this.DrawButton('help', 'H / HELP', 364, screen.Height - 62, 76, 42);
        else this.DrawButton('help', '?', screen.Width - 52, 48, 36, 36);
        this.occlusion = this.open ? this.Layout() : null;
        if (!this.open) return;
        const box = this.Layout(); f.Panel(box);
        for (const button of this.buttons.values()) {
            if (button.rect.x < box.x + box.width && button.rect.x + button.rect.width > box.x
                && button.rect.y < box.y + box.height && button.rect.y + button.rect.height > box.y) button.enabled = false;
        }
        f.Text('LIVE ENGINE LAB', box.x + 16, box.y + 25, { size: 13, color: '#f4c28a', weight: 700 });
        this.DrawButton('close', '×', box.x + box.width - 40, box.y + 8, 30, 28);
        const tabWidth = (box.width - 28) / 4;
        ControlGroups.forEach((group, index) => this.DrawButton(`tab${index}`, group.name,
            box.x + 14 + index * tabWidth, box.y + 42, tabWidth - 4, 28, this.tab === index));
        box.controls.forEach((control, index) => {
            const y = box.y + 82 + index * 48;
            if ('key' in control) {
                const slider = this.sliders.get(control.key);
                if (!slider) return;
                slider.rect = { x: box.x + 18, y, width: box.width - 36, height: 44 };
                f.Text(`${index === this.selected ? '› ' : ''}${control.label}`, box.x + 18, y + 12, { size: 13 });
                f.Text(this.level.model.current[control.key].toFixed(control.step < 1 ? 2 : 0), box.x + box.width - 18, y + 12,
                    { align: 'right', size: 13, color: '#f5c58c' });
                const ctx = f.context, start = box.x + 18, track = box.width - 36;
                ctx.fillStyle = '#25424b'; ctx.fillRect(start, y + 29, track, 3);
                const fraction = (this.level.model.current[control.key] - control.min) / (control.max - control.min);
                ctx.fillStyle = '#8ee7da'; ctx.fillRect(start, y + 29, track * fraction, 3);
                ctx.beginPath(); ctx.arc(start + track * fraction, y + 30, 5, 0, Math.PI * 2); ctx.fill();
            } else this.DrawButton(control.toggle, `${control.label}  ${this.ReadToggle(control.toggle) ? 'ON' : 'OFF'}`,
                box.x + 14, y, box.width - 28, 40, index === this.selected);
        });
        const bottom = box.y + box.height;
        if (box.pages > 1) this.DrawButton('more', `MORE CONTROLS  ${this.page + 1}/${box.pages}`, box.x + 14, bottom - 124, box.width - 28, 24);
        const presetWidth = (box.width - 28) / 4;
        this.level.model.data.presets.forEach((preset, index) => this.DrawButton(`preset${index}`, preset.label,
            box.x + 14 + index * presetWidth, bottom - 88, presetWidth - 4, 32, this.level.model.presetIndex === index));
        this.DrawButton('reset', 'RESET SCENE  /  R', box.x + 14, bottom - 44, box.width - 28, 32);
    }
    Dispose() { for (const button of this.buttons.values()) button.Dispose(); for (const slider of this.sliders.values()) slider.Cancel(); }
}
