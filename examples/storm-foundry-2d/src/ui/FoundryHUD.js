// @ts-check
import { Draw, HUDFrame, InputHelpPanel as InfoPanel } from 'gameforgejs/2d';
import { FoundryPanel } from './FoundryPanel.js';

/** In-engine typography and a compact diagnostic readout; no HTML/CSS gameplay UI. */
export class FoundryHUD {
    /** @param {import('../levels/FoundryLevel.js').FoundryLevel} level */
    constructor(level) {
        this.level = level;
        this.info = new InfoPanel(new Draw(level.screen), { title: 'STORM FOUNDRY / HELP', lines: [] });
        this.frame = new HUDFrame(new Draw(level.screen), { panel: 'rgba(5,15,24,0.94)',
            border: 'rgba(86,136,146,0.55)', gold: '#f4bc78', text: '#dbe9e9' });
        this.panel = new FoundryPanel(level, this.frame);
    }
    get help() { return this.info.visible; }
    /** @param {boolean} visible */
    set help(visible) { this.info.visible = visible; }
    /** @param {number} dt */
    Update(dt) { if (!this.help) this.panel.Update(dt); }
    Draw() {
        const level = this.level, w = level.world, screen = level.screen, f = this.frame;
        const compact = screen.Width < 600 || screen.Height < 500;
        f.Text('G F  /  GAMEFORGEJS', 24, 32, { size: 12, color: '#9bb7c0', weight: 700 });
        if (!compact) {
            f.Text('REAL-TIME SYSTEMS / FX LAB', 40, 100, { size: 11, color: '#7eadaf' });
            f.Text('STORM', 36, 169, { size: 72, weight: 800, color: '#edf4e8' });
            f.Text('FOUNDRY', 36, 239, { size: 72, weight: 800, color: '#efbc79' });
            f.Text('Rain. Reflections. Reactive worlds.', 40, 270, { size: 15, color: '#acc9cb' });
            f.Text('A zero-dependency Canvas laboratory.', 40, 294, { size: 12, color: '#75949e' });
        } else {
            f.Text('STORM FOUNDRY', 22, 79, { size: 29, weight: 800, color: '#f0c48e' });
            f.Text('Tap / drag to throw. Open the lab to tune.', 24, 103, { size: 11, color: '#94b7c2' });
        }
        if (level.model.telemetry && !this.panel.open) {
            const x = screen.Width - (compact ? 150 : 244);
            f.Text(`${level.telemetry.fps.toFixed(0)} FPS  /  ${level.telemetry.deltaMs.toFixed(1)} ms / ${level.entities.length} entities`, x, 32,
                { size: compact ? 10 : 12, color: '#92d9d1' });
            if (!compact) {
                const particles = w.rain.particles.length + w.particles.particles.length + w.splashes.particles.length;
                f.Text(`${particles} particles  /  ${w.props.filter(p => p.active).length} bodies`, x, 52, { size: 11, color: '#6f9ca7' });
                f.Text(`${level.entities.length} entities · ${w.physics.contacts} contacts`, x, 70, { size: 10, color: '#587e8c' });
            }
        }
        if (!compact && !this.panel.open) {
            f.Text('ACTIVE PRESET', 40, screen.Height - 150, { size: 10, color: '#729b9f' });
            f.Text(level.model.current.name, 40, screen.Height - 120, { size: 23, color: '#dbece7', weight: 700 });
            this.info.DrawAction('HELP',24,screen.Height-100);
        }
        if (level.model.debug) this.DrawInspector();
        this.panel.Draw();
        if (this.help) {
            this.DrawHelp();
            for (const [id, button] of this.panel.buttons) if (id !== 'help') button.enabled = false;
        }
    }
    DrawInspector() {
        const level = this.level, w = level.world, f = this.frame;
        const y = level.screen.Height < 500 ? 116 : 320;
        const box = { x: 24, y, width: Math.min(360, level.screen.Width - 48), height: 180 }; f.Panel(box);
        const components = level.entities.reduce((sum, actor) => sum + (actor.components?.length ?? 0), 0);
        const rows = [
            'LIVE COMPOSITION / I', `${level.entities.length} entities · ${components} components`,
            'Fixed: wind → Velocity → circle contacts', 'Frame: emitters → pooled particles → ripples',
            'Draw: scene → reflection → particles → post',
            `Rain ${w.rain.particles.length}/${w.rain.capacity} · FX ${w.particles.particles.length}/${w.particles.capacity}`,
            `Dropped at cap: ${w.rain.dropped + w.particles.dropped + w.splashes.dropped}`,
        ];
        rows.forEach((text, index) => f.Text(text, box.x + 12, y + 25 + index * 22,
            { size: 11, color: index === 0 ? '#f4c183' : '#98c0c5', maxWidth: box.width - 24 }));
    }
    DrawHelp() {
        const screen = this.level.screen;
        const width = Math.min(580, screen.Width - 32), x = (screen.Width - width) / 2;
        this.info.layout = { x, y: 80, width, lineHeight: 27 };
        this.info.OnDrawn();
    }
    Dispose() { this.info.Dispose(); this.panel.Dispose(); }
}
