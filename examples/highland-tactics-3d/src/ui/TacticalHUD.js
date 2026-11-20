import { Draw, HUDFrame, InputHelpPanel, Button, Rectangle } from 'gameforgejs/2d';
import { Vector3D } from 'gameforgejs/core';
import { BattleRules, Commands, Facings } from '../data/BattleRules.js';
/** Native Canvas HUD: compact CT strip, action buttons and an optional side drawer. */
export class TacticalHUD {
    constructor(level) {
        this.level = level;
        this.screen = level.ui.Screen;
        this.frame = new HUDFrame(level.ui.Draw);
        this.help = new InputHelpPanel(new Draw(this.screen));
        this.footerHeight = 174;
        this.buttons = [];
        this.tools = [
            this.Button('↶', () => level.cameraStep--), this.Button('↷', () => level.cameraStep++),
            this.Button('RAIN', () => level.ToggleWeather()), this.Button('RETRY', () => level.ResetBattle()),
            this.Button('?', () => this.help.Toggle()),
        ];
        this.commands = Commands.map((label, index) => this.Button(label, () => level.turn.Choose(index)));
        this.facings = Facings.map((direction, index) => this.Button(direction.name, () => { level.turn.active.stats.facing = index; }));
        this.confirm = this.Button('CONFIRM WAIT', () => level.turn.EndTurn());
    }
    Button(label, run) {
        const button = new Button(this.screen, { pointerInput: true });
        button.OnClick(run);
        const item = { label, button };
        this.buttons.push(item);
        return item;
    }
    Place(item, x, y, width, height = 38, enabled = true, selected = false) {
        item.button.enabled = enabled;
        item.button.SetButton(new Rectangle(x, y, width, height));
        if (!enabled)
            return;
        this.frame.Panel({ x, y, width, height });
        this.frame.Text(item.label, x + width / 2, y + height * 0.66, { size: 12, align: 'center', weight: selected ? 700 : 400, color: selected ? this.frame.theme.gold : this.frame.theme.text, maxWidth: width - 10 });
    }
    Draw() {
        const { level: l, screen: s, frame: f } = this, t = l.turn, w = s.Width, h = s.Height, compact = w < 650;
        this.footerHeight = compact ? 174 : 156;
        f.Panel({ x: 8, y: 8, width: w - 16, height: 94 });
        f.Text('HIGHLAND TACTICS', 20, 31, { size: 20, weight: 700, color: f.theme.gold });
        f.Text(t.result ?? 'A height-aware 3D skirmish · original GameForgeJS example', 20, 49, { size: 11, maxWidth: w - 40 });
        this.tools.forEach((item, i) => this.Place(item, 20 + i * 62, 57, 55, 44));
        const queue = t.Alive().slice().sort((a, b) => (100 - a.stats.ct) / a.stats.speed - (100 - b.stats.ct) / b.stats.speed);
        queue.slice(0, compact ? 3 : 4).forEach((pawn, i) => {
            const x = 16 + i * (compact ? 120 : 142);
            f.Text(`${i + 1} ${pawn.stats.name} · ${Math.floor(pawn.stats.ct)} CT`, x, 122, { size: 10, maxWidth: compact ? 115 : 138, color: pawn.stats.team === 'ally' ? '#aae0dc' : '#f0b3aa' });
        });
        for (const pawn of t.Alive()) {
            const world = pawn.travel.position, p = l.camera.Project(new Vector3D(world.x, world.y + 1.15, world.z), w, h);
            if (p.visible) {
                f.Meter(pawn.stats.hp / pawn.stats.maxHp, { x: p.x - 18, y: p.y, width: 36, height: 4 }, pawn.stats.team === 'ally' ? '#7cddc5' : '#ed9c91');
                if (pawn === t.active)
                    f.Text('▼', p.x, p.y - 8, { size: 13, align: 'center', color: f.theme.gold });
            }
        }
        for (const feedback of t.feedback) {
            const world = feedback.pawn.travel.position, p = l.camera.Project(new Vector3D(world.x, world.y + 1.5, world.z), w, h);
            f.Text(feedback.text, p.x, p.y - (1.7 - feedback.life) * 18, { size: 14, align: 'center', weight: 700, color: f.theme.gold, maxWidth: 160 });
        }
        const y = h - this.footerHeight;
        f.Panel({ x: 8, y, width: w - 16, height: this.footerHeight - 8 });
        const a = t.active?.stats, tile = t.cursor ? l.grid.Get(t.cursor.col, t.cursor.row) : null;
        const description = a ? `${a.name}  HP ${a.hp}/${a.maxHp}  H ${l.grid.Get(a.col, a.row).h}  ${Facings[a.facing].name}  SP ${a.energy}/2${a.exposed ? ' · EXPOSED' : ''}` : 'CHARGING · CT advances by unit speed';
        f.Text(description, 20, y + 23, { size: compact ? 11 : 13, weight: 700, maxWidth: w - 40 });
        const target = t.Alive().find(p => p.stats.col === t.cursor?.col && p.stats.row === t.cursor?.row && p.stats.team !== a?.team);
        let message = t.message;
        if (t.phase === 'target' && target && BattleRules.CanAttack(l.grid, a, target.stats, t.ability)) {
            const preview = BattleRules.Preview(l.grid, a, target.stats, t.ability);
            message = `${target.stats.name} · ${preview.side} · ${preview.chance}% HIT · ${preview.damage} DMG · ΔH ${preview.elevation}`;
        }
        else if (tile && ['move', 'target'].includes(t.phase))
            message = `Tile ${tile.col},${tile.row} · H ${tile.h} · ${message}`;
        f.Text(message, 20, y + 45, { size: 11, maxWidth: w - 40, color: f.theme.gold });
        const columns = compact ? 2 : 4, bw = (w - 40 - (columns - 1) * 8) / columns;
        this.commands.forEach((item, i) => this.Place(item, 20 + i % columns * (bw + 8), y + 57 + Math.floor(i / columns) * 46, bw, 44, t.phase === 'command', t.command === i));
        this.facings.forEach((item, i) => this.Place(item, 20 + i * (w - 40) / 4, y + 57, (w - 56) / 4, 44, t.phase === 'face', a?.facing === i));
        this.Place(this.confirm, 20, y + 101, w - 40, 44, t.phase === 'face');
        this.help.OnDrawn();
    }
    Dispose() { for (const item of this.buttons)
        item.button.Dispose(); this.help.Dispose(); }
}
