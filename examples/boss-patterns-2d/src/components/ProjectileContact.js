import { Component } from 'gameforgejs/core';
import { CircleHit } from '../data/CombatMath.js';

export class ProjectileContact extends Component {
    constructor(level) { super(); this.level = level; }
    OnFixedUpdate() {
        const projectile = this.owner, level = this.level;
        if (!projectile.active) return;
        const target = projectile.team === 'player' ? level.boss : level.player;
        if (target.active !== false && CircleHit(projectile.position, projectile.radius, target.position, target.radius)) {
            target.health.Damage(1, projectile); projectile.Release(); return;
        }
        const {width, height} = level.rules.arena, p = projectile.position;
        if (p.x < 0 || p.y < 0 || p.x > width || p.y > height) projectile.Release();
    }
    OnDrawn() {
        const projectile = this.owner;
        if (!projectile.active) return;
        const ctx = this.level.screen.Context; this.level.view.Begin();
        ctx.fillStyle = projectile.team === 'player' ? '#a4f8e1' : '#f5a66d';
        ctx.beginPath(); ctx.arc(projectile.position.x, projectile.position.y, projectile.radius, 0, Math.PI * 2); ctx.fill();
        this.level.view.End();
    }
}
