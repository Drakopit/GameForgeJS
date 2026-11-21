import { GameObject } from 'gameforgejs/2d';
import { HealthComponent, BoundsComponent } from 'gameforgejs/core';
import { CombatVisual } from '../components/CombatVisual.js';

export class ArenaBoss extends GameObject {
    constructor(level) {
        super(); this.level = level; this.radius = 38; this.position.Set(480, 220);
        this.health = this.AddComponent(new HealthComponent({hp: level.rules.boss.hp, invulnerability: 0.06}));
        this.AddComponent(new BoundsComponent({width: 76, height: 76, offsetX: -38, offsetY: -38}));
        this.AddComponent(new CombatVisual(level, 'boss'));
    }
    OnDamage() { this.level.events.emit('combat:hit', 'boss'); }
    OnDeath() { this.level.Finish('VICTORY'); }
}
