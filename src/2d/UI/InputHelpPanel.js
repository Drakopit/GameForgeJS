import { InfoPanel } from './InfoPanel.js';
import { InputPromptRegistry } from './InputPromptRegistry.js';
import { InputPromptAtlas } from './InputPromptAtlas.js';
import { Button } from './Button.js';
import { Rectangle } from '../Graphics/Rectangle.js';
import { AssetManager } from '../../core/Assets/AssetManager.js';
import { Input } from '../../core/Input/Input.js';
import { ActionManager } from '../../core/Input/ActionManager.js';
import { AudioManager } from '../../core/Audio/AudioManager.js';
/** Data-authored action help with native sprite prompts and compact input settings. */
export class InputHelpPanel extends InfoPanel {
    constructor(draw, options = {}) {
        super(draw, options);
        this.screen = draw.screen;
        this.page = 0;
        this.playerRows = options.playerRows;
        this.data = options.data ?? AssetManager.instance?.jsons?.prompts ?? {};
        this.registry = new InputPromptRegistry(this.data.glyphs);
        this.atlas = new InputPromptAtlas(AssetManager.instance);
        const profile = () => Input.instance?.presentation;
        this.buttons = [
            { id: 'profile', run: () => { const names = ['auto', ...Object.keys(this.registry.profiles)]; const p = profile(); p?.SetProfile(names[(names.indexOf(p.profile) + 1) % names.length]); } },
            { id: 'touch', run: () => { const p = profile(), modes = ['auto', 'on', 'off']; p?.SetTouchMode(modes[(modes.indexOf(p.touchMode) + 1) % 3]); } },
            { id: 'sound', run: () => { const audio = AudioManager._instance; if (audio)
                    audio.SetMuted(!audio.muted); } },
            { id: 'stats', run: () => profile()?.telemetry?.toggle() },
            { id: 'next', run: () => this.page++ },
            { id: 'close', run: () => this.visible = false },
        ].map(item => { const button = new Button(this.screen, { pointerInput: true }); button.modalOwner=this; button.enabled = false; button.OnClick(item.run); return { ...item, button }; });
    }
    get visible() { return this._visible ?? false; }
    set visible(value) {
        this._visible = Boolean(value);
        if(this.screen){
            if(this._visible)this.screen.inputModal=this;
            else if(this.screen.inputModal===this)this.screen.inputModal=null;
        }
        for (const item of this.buttons ?? [])
            item.button.enabled = this._visible && (item.id !== 'stats' || Boolean(Input.instance?.presentation?.telemetry));
    }
    DrawAction(action, x, y) {
        const profile = Input.instance?.presentation?.Profile ?? 'keyboard';
        const glyphs = this.registry.ForAction(action, profile);
        glyphs.slice(0, 1).forEach(glyph => this.atlas.Draw(this.screen.Context, glyph, x, y, 30));
        const label = this.data.rows?.find(row => row.actions?.includes(action))?.label ?? action;
        this.frame.Text(label, x + 38, y + 21, { size: 13, maxWidth: 110 });
    }
    DrawRow(id, x, y) {
        const row = this.data.rows?.find(row => row.id === id);
        if (!row)
            return;
        const profile = Input.instance?.presentation?.Profile ?? 'keyboard';
        const glyphs = this.registry.FromPaths(row.sources, profile);
        glyphs.slice(0, 1).forEach(glyph => this.atlas.Draw(this.screen.Context, glyph, x, y, 30));
        this.frame.Text(row.label, x + 38, y + 21, { size: 13, maxWidth: 110 });
    }
    OnDrawn() {
        if (!this.visible)
            return;
        // Legacy demos may retain a large logical canvas on a small CSS viewport.
        // Draw help in CSS-sized units, then scale hit regions back to Screen units.
        const unit = Math.max(1, this.screen.Width / Math.max(1, this.screen.Canvas.getBoundingClientRect().width));
        const screenWidth = this.screen.Width / unit, screenHeight = this.screen.Height / unit;
        const ctx = this.screen.Context;
        ctx.save();
        ctx.scale(unit, unit);
        // A right-hand drawer keeps the scene visible and remains usable on
        // short landscape screens. Pagination owns overflow, never the stage.
        const seats = this.playerRows?.() ?? [];
        const width = Math.min(seats.length > 1 ? 640 : 360, screenWidth - 24);
        const x = screenWidth - width - 12;
        const y = 12;
        const height = Math.min(510, screenHeight - 24);
        const compact = height < 290;
        const footerHeight = compact ? 48 : 98;
        const rowHeight = compact ? 34 : 42;
        const rowsPerPage = Math.max(1, Math.floor((height - footerHeight - 70) / rowHeight));
        const rows = this.data.rows ?? Object.keys(ActionManager.mappings).map(action => ({ label: action.replaceAll('_', ' ').toLowerCase(), actions: [action] }));
        const pages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
        const split = seats.length > 1;
        const pageSize = split ? Math.max(1, rowsPerPage - 1) : rowsPerPage;
        const pageCount = split ? Math.max(1, ...seats.map(seat => Math.ceil(seat.length / pageSize))) : pages;
        this.page %= pageCount;
        const presentation = Input.instance?.presentation, profile = presentation?.Profile ?? 'keyboard', frame = this.frame;
        frame.Panel({ x, y, width, height });
        frame.Text(this.data.title ?? this.title ?? 'Controls', x + 14, y + 28, { size: 20, weight: 700, maxWidth: width - 82 });
        frame.Text(`${profile.toUpperCase()} · ${this.page + 1}/${pageCount}`, x + 14, y + 50, { size: 12, color: frame.theme.muted });
        const drawRow = (row, index, x, width, inset) => {
            const top = y + 64 + inset + index * rowHeight;
            frame.Text(row.label, x + 14, top + 24, { size: 14, maxWidth: width * 0.42 });
            const descriptors = this.registry.FromPaths(row.sources, profile).concat((row.actions ?? []).flatMap(action => {
                const glyphs = this.registry.ForAction(action, profile);
                return row.actions.length > 1 ? glyphs.slice(0, 1) : glyphs;
            })).concat((row.rules ?? []).filter(rule => rule.device === (profile === 'keyboard' ? 'keyboard' : 'gamepad')).map(rule => this.registry.Resolve(rule, profile)));
            const unique = [...new Map(descriptors.map(glyph => [glyph.token, glyph])).values()];
            const size = split ? 22 : 30;
            const stride = size + 4;
            const max = Math.max(1, Math.floor(width * 0.5 / stride));
            unique.slice(0, max).forEach((glyph, i) => this.atlas.Draw(this.screen.Context, glyph, x + width * 0.47 + i * stride, top, size));
            if (!unique.length)
                frame.Text('—', x + width * 0.5, top + 24, { size: 14, color: frame.theme.muted });
        };
        if (split) {
            const widthPerSeat = width / seats.length;
            seats.forEach((seat, index) => {
                const left = x + index * widthPerSeat;
                frame.Text('PLAYER ' + (index + 1), left + 14, y + 72, { color: frame.theme.gold, weight: 700 });
                seat.slice(this.page * pageSize, (this.page + 1) * pageSize).forEach((row, i) =>
                    drawRow(row, i, left, widthPerSeat, 22));
            });
        } else {
            rows.slice(this.page * pageSize, (this.page + 1) * pageSize).forEach((row, i) => drawRow(row, i, x, width, 0));
        }
        const labels = { profile: `Profile: ${presentation?.profile ?? 'auto'}`, touch: `Touch ${presentation?.touchMode ?? 'auto'}`, sound: AudioManager._instance?.muted ? 'Sound off' : 'Sound on', stats: presentation?.telemetry?.visible ? 'Stats on' : 'Stats off', next: 'More' };
        const footer = this.buttons.filter(item => item.id !== 'close' && (item.id !== 'stats' || presentation?.telemetry));
        const columns = compact ? footer.length : Math.ceil(footer.length / 2);
        const buttonWidth = (width - 24 - (columns - 1) * 7) / columns;
        for (const item of this.buttons) if (item.id !== 'close') item.button.enabled = false;
        footer.forEach((item, index) => {
            item.button.enabled = true;
            const rect = new Rectangle(x + 12 + index % columns * (buttonWidth + 7), y + height - footerHeight + Math.floor(index / columns) * 46, buttonWidth, 42);
            item.button.SetButton(new Rectangle(rect.x * unit, rect.y * unit, rect.width * unit, rect.height * unit));
            frame.Panel(rect);
            frame.Text(labels[item.id], rect.x + rect.width / 2, rect.y + 26, { align: 'center', size: 13, maxWidth: rect.width - 12 });
        });
        const close = this.buttons.find(item => item.id === 'close').button;
        close.SetButton(new Rectangle((x + width - 56) * unit, (y + 8) * unit, 44 * unit, 44 * unit));
        close.enabled = true;
        frame.Panel({ x: x + width - 56, y: y + 8, width: 44, height: 44 });
        frame.Text('×', x + width - 34, y + 37, { align: 'center', size: 23 });
        ctx.restore();
    }
    Dispose() { for (const item of this.buttons)
        item.button.Dispose(); this.atlas.Dispose(); this.visible = false; }
}
