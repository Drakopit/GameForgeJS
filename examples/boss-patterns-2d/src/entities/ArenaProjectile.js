import { GameObject } from 'gameforgejs/2d';
import { VelocityComponent, LifetimeComponent } from 'gameforgejs/core';
import { ProjectileContact } from '../components/ProjectileContact.js';

export class ArenaProjectile extends GameObject {
    constructor(level) {
        super(); this.level = level; this.radius = 7; this.team = 'enemy'; this.active = false;
        this.velocity = this.AddComponent(new VelocityComponent({useFixedUpdate: true}));
        this.life = this.AddComponent(new LifetimeComponent({duration: level.rules.projectiles.lifetime, mode: 'disable', onExpire: () => this.Release()}));
        this.AddComponent(new ProjectileContact(level)); this.Release();
    }
    Launch(position, velocity, team) {
        this.position.Copy(position); this.velocity.SetVelocity(velocity.x, velocity.y); this.team = team;
        this.life.Reset(); this.active = true; this.enabled = true; for (const component of this.components) component.enabled = true;
    }
    Release() { this.active = false; for (const component of this.components) component.enabled = false; }
}
