import { GameObject } from 'gameforgejs/2d';
import { HealthComponent, VelocityComponent, BoundsComponent } from 'gameforgejs/core';
import { CombatMotion } from '../components/CombatMotion.js';
import { CombatVisual } from '../components/CombatVisual.js';

export class ArenaPlayer extends GameObject {
    constructor(level) {
        super(); this.level = level; this.radius = 18; this.anchor = level.rules.anchors?.player ?? {x: 480, y: 490}; this.position.Set(this.anchor.x, this.anchor.y);
        this.health = this.AddComponent(new HealthComponent({hp: level.rules.player.hp, invulnerability: 0.8}));
        this.motion = this.AddComponent(new CombatMotion(level));
        this.velocity = this.AddComponent(new VelocityComponent({useFixedUpdate: true}));
        this.AddComponent(new BoundsComponent({width: 36, height: 36, offsetX: -18, offsetY: -18}));
        this.AddComponent(new CombatVisual(level, 'player'));
    }
    OnDamage() { this.level.events.emit('combat:hit', 'player'); }
    OnDeath() { this.level.Finish('DEFEAT'); }
}
