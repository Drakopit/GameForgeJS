import { Component } from 'gameforgejs/core';
import { BattleRules } from '../data/BattleRules.js';
/** CT, action budgets and phase transitions. No input or rendering dependencies. */
export class TurnSystem extends Component {
    constructor(grid, pawns, sound) { super(); this.grid = grid; this.pawns = pawns; this.sound = sound; this.Reset(); }
    Reset() { this.phase = 'charge'; this.active = null; this.message = 'The highland watch — defeat the Ash patrol'; this.result = null; this.seed = 74; this.feedback = []; this.command = 0; }
    Alive() { return this.pawns.filter(p => p.stats.hp > 0); }
    Occupied(actor) { return new Set(this.Alive().filter(p => p !== actor).map(p => this.grid.Key(p.stats))); }
    Range(actor = this.active) { return this.grid.Reachable(actor.stats, { move: 3, climb: 1, jump: 2, occupied: this.Occupied(actor) }); }
    Begin(actor) {
        this.active = actor;
        this.moved = false;
        this.acted = false;
        this.command = 0;
        actor.stats.energy = Math.min(2, actor.stats.energy + 1);
        actor.stats.exposed = Math.max(0, actor.stats.exposed - 1);
        this.cursor = { col: actor.stats.col, row: actor.stats.row };
        this.phase = actor.stats.team === 'ally' ? 'command' : 'ai';
        this.delay = 0.55;
        this.message = `${actor.stats.name}: Move, Act, then choose a facing`;
    }
    OnUpdate(dt) {
        for (const text of this.feedback)
            text.life -= dt;
        this.feedback = this.feedback.filter(text => text.life > 0);
        if (this.result)
            return;
        if (this.phase === 'charge') {
            for (const pawn of this.Alive())
                pawn.stats.ct += pawn.stats.speed * dt * 3;
            const ready = this.Alive().filter(p => p.stats.ct >= 100).sort((a, b) => b.stats.ct - a.stats.ct || a.stats.id.localeCompare(b.stats.id));
            if (ready.length)
                this.Begin(ready[0]);
        }
        else if (this.phase === 'ai') {
            this.delay -= dt;
            if (this.delay <= 0)
                this.EnemyStep();
        }
        else if (this.phase === 'resolve') {
            this.delay -= dt;
            if (this.delay <= 0) {
                this.ResolveAttack();
            }
        }
    }
    Choose(index) {
        if (this.phase !== 'command')
            return;
        this.command = index;
        if (index === 0) {
            if (this.moved) {
                this.message = 'Movement already spent';
                return;
            }
            this.area = this.Range();
            this.phase = 'move';
        }
        else if (index === 3) {
            this.phase = 'face';
            this.message = 'Choose a direction, then confirm Wait';
        }
        else {
            if (this.acted) {
                this.message = 'Action already spent';
                return;
            }
            this.ability = index === 2 ? 'spark' : 'strike';
            this.phase = 'target';
            this.message = this.ability === 'spark' ? 'Spark: range 3, line of sight, exposes armor' : 'Strike: range 1, height reach 1';
        }
    }
    Move(tile) {
        if (!this.active || !['move', 'ai'].includes(this.phase))
            return false;
        const entry = this.Range().get(this.grid.Key(tile));
        if (!entry || !entry.path.length || this.moved)
            return false;
        this.active.stats.facing = BattleRules.Facing(this.active.stats, entry.path[0]);
        this.moved = true;
        const next = this.active.stats.team === 'ally' ? 'command' : 'ai';
        this.phase = 'travel';
        this.active.travel.Follow(entry.path, () => { this.phase = next; this.cursor = { col: tile.col, row: tile.row }; this.delay = 0.45; });
        this.sound.Play('step');
        return true;
    }
    Attack(target, ability = this.ability) {
        if (!this.active || !['target', 'ai'].includes(this.phase))
            return false;
        if (this.acted || !target || !BattleRules.CanAttack(this.grid, this.active.stats, target.stats, ability))
            return false;
        this.target = target;
        this.ability = ability;
        this.preview = BattleRules.Preview(this.grid, this.active.stats, target.stats, ability);
        this.active.stats.facing = BattleRules.Facing(this.active.stats, target.stats);
        this.phase = 'resolve';
        this.delay = 0.35;
        this.message = `${this.preview.side} · ${this.preview.chance}% · ${this.preview.damage} damage`;
        this.sound.Play('warning');
        return true;
    }
    ResolveAttack() {
        this.seed = (Math.imul(this.seed, 1664525) + 1013904223) >>> 0;
        const hit = this.seed / 4294967296 * 100 < this.preview.chance, defender = this.target.stats;
        if (hit) {
            defender.hp = Math.max(0, defender.hp - this.preview.damage);
            defender.flash = 0.3;
            if (this.ability === 'spark')
                defender.exposed = 2;
        }
        if (this.ability === 'spark')
            this.active.stats.energy--;
        this.feedback.push({ pawn: this.target, text: hit ? `-${this.preview.damage}${this.ability === 'spark' ? ' EXPOSED' : ''}` : 'MISS', life: 1.7 });
        this.sound.Play(hit ? 'hit' : 'select');
        this.acted = true;
        const teams = new Set(this.Alive().map(p => p.stats.team));
        if (teams.size < 2) {
            this.result = teams.has('ally') ? 'VICTORY' : 'DEFEAT';
            this.phase = 'result';
            this.message = 'Battle complete — Retry to play again';
            this.sound.Play('success');
            return;
        }
        this.phase = this.active.stats.team === 'ally' ? 'command' : 'ai';
        this.delay = 0.5;
    }
    EndTurn() {
        if (!this.active || !['face', 'ai'].includes(this.phase))
            return;
        this.active.stats.ct = Math.max(0, this.active.stats.ct - (20 + (this.moved ? 30 : 0) + (this.acted ? 50 : 0)));
        this.phase = 'charge';
        this.active = null;
        this.preview = null;
        this.sound.Play('select');
    }
    EnemyStep() {
        const foes = this.Alive().filter(p => p.stats.team !== this.active.stats.team);
        const adjacent = foes.find(p => BattleRules.CanAttack(this.grid, this.active.stats, p.stats, 'strike'));
        if (!this.acted && adjacent) {
            this.Attack(adjacent, 'strike');
            return;
        }
        if (!this.moved) {
            const range = [...this.Range().values()].filter(tile => tile.path.length);
            const distance = tile => Math.min(...foes.map(p => Math.abs(p.stats.col - tile.col) + Math.abs(p.stats.row - tile.row)));
            range.sort((a, b) => distance(a) - distance(b) || a.cost - b.cost);
            if (range.length && this.Move(range[0]))
                return;
        }
        const target = foes.sort((a, b) => Math.abs(a.stats.col - this.active.stats.col) + Math.abs(a.stats.row - this.active.stats.row) - Math.abs(b.stats.col - this.active.stats.col) - Math.abs(b.stats.row - this.active.stats.row))[0];
        if (target)
            this.active.stats.facing = BattleRules.Facing(this.active.stats, target.stats);
        this.EndTurn();
    }
}
