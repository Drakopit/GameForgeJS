import { Component, ActionManager, Vector2D } from 'gameforgejs/core';
import { Aim, KeepInArena } from '../data/CombatMath.js';

export class CombatMotion extends Component {
    constructor(level) { super(); this.level = level; this.Reset(); }
    Reset() { this.dash = 0; this.cooldown = 0; this.shotCooldown = 0; this.facing = new Vector2D(0, -1); }
    OnFixedUpdate(dt) {
        const level = this.level, actor = this.owner, rules = level.rules.player;
        this.cooldown = Math.max(0, this.cooldown - dt); this.shotCooldown = Math.max(0, this.shotCooldown - dt);
        if (level.result) { actor.velocity.SetVelocity(0, 0); return; }
        const direction = level.hud.Direction();
        if (direction.Length() > 0.1 && this.dash <= 0) this.facing.Copy(direction.Normalize());
        if (level.dashQueued && this.cooldown === 0) {
            this.dash = rules.dashSeconds; this.cooldown = rules.dashCooldown;
            level.sound.Play('jump');
            actor.health.invulnerabilityTimer = Math.max(actor.health.invulnerabilityTimer, rules.dashSeconds);
        }
        level.dashQueued = false;
        const moving = this.dash > 0 ? this.facing.MultiplyScalar(rules.dashSpeed) : direction.MultiplyScalar(rules.speed);
        actor.velocity.SetVelocity(moving.x, moving.y); this.dash = Math.max(0, this.dash - dt);
        actor.position.Copy(KeepInArena(actor.position, level.rules.arena, actor.radius));
        if ((level.shootQueued || ActionManager.IsAction('ACTION')) && this.shotCooldown === 0) {
            level.Emit(actor.position, Aim(actor.position, level.boss.position).MultiplyScalar(level.rules.projectiles.playerSpeed), 'player'); this.shotCooldown = rules.shotCooldown;
        }
        level.shootQueued = false;
    }
}
