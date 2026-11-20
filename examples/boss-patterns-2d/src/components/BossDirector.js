import { Component } from 'gameforgejs/core';
import { FanAttack } from './FanAttack.js';
import { RingAttack } from './RingAttack.js';
import { ChargeAttack } from './ChargeAttack.js';

/** Four encounter states orchestrate interchangeable pattern objects. */
export class BossDirector extends Component {
    constructor(level) {
        super(); this.level = level; this.patterns = {fan: new FanAttack(level), ring: new RingAttack(level), charge: new ChargeAttack(level)};
        this.handlers = {waiting: () => this.Windup(), windup: () => this.Attack(), recovering: () => this.Windup()}; this.Reset();
    }
    Reset() { this.state = 'waiting'; this.remaining = 1.8; this.phase = 0; this.turn = 0; this.pattern = null; }
    Windup() {
        const rules = this.level.rules.boss, fraction = this.level.boss.health.hp / this.level.boss.health.maxHp;
        const phase = rules.phases.findIndex(definition => fraction > definition.threshold);
        this.phase = phase < 0 ? rules.phases.length - 1 : phase;
        const cycle = rules.phases[this.phase].patterns;
        this.pattern = this.patterns[cycle[this.turn++ % cycle.length]]; this.pattern.Prepare();
        this.state = 'windup'; this.remaining = rules.windup / (1 + this.phase * 0.15);
        this.level.events.emit('boss:telegraph', this.pattern.name);
    }
    Attack() { this.state = 'attacking'; this.pattern.Begin(this.phase); }
    OnFixedUpdate(dt) {
        if (this.level.result) return;
        if (this.state === 'attacking') {
            if (this.pattern.Update(dt)) { this.state = 'recovering'; this.remaining = this.level.rules.boss.recovery; }
            return;
        }
        this.remaining -= dt; if (this.remaining <= 0) this.handlers[this.state]();
    }
}
