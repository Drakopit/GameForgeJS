import { HealthComponent } from 'gameforgejs/core';
import { Mesh, PrimitiveMesh, ToonMaterial, Rigidbody3D, SphereCollider3D } from 'gameforgejs/3d';
import { MeleeAttack } from './MeleeAttack.js';
import { Encounter } from '../data/Encounter.js';

export class Combatant extends Mesh {
    constructor(physics, spawn, color, stats, attackSettings) {
        super({
            geometry: PrimitiveMesh.Sphere(0.55),
            material: new ToonMaterial({ albedoColor: color }),
        });
        this.physics = physics;
        this.targets = [];
        this.spawn = [...spawn];
        this.facing = [0, -1];
        this.health = new HealthComponent({ hp: stats.hp, invulnerability: stats.invulnerability });
        this.health.Attach(this);
        this.rigidbody = new Rigidbody3D({ damping: 1 });
        this.body = physics.AddBody({
            object: this,
            rigidbody: this.rigidbody,
            collider: new SphereCollider3D({ radius: 0.55 }),
        });
        this.attack = new MeleeAttack(this, attackSettings);
        this.Reset();
    }

    TickCombat(dt) {
        this.health.OnUpdate(dt);
        this.hurtRemaining = Math.max(0, this.hurtRemaining - dt);
        if (this.health.IsAlive()) this.attack.Update(dt);
    }

    CanAct() {
        return this.health.IsAlive() && this.hurtRemaining === 0 && this.attack.phase === 'ready';
    }

    OnDamage(amount, source) {
        this.attack.Reset();
        this.hurtRemaining = Encounter.knockback.duration;
        const x = this.transform.position[0] - source.transform.position[0];
        const z = this.transform.position[2] - source.transform.position[2];
        const length = Math.hypot(x, z);
        this.rigidbody.velocity[0] = length > 0 ? x / length * Encounter.knockback.speed : 0;
        this.rigidbody.velocity[2] = length > 0 ? z / length * Encounter.knockback.speed : Encounter.knockback.speed;
    }

    OnDeath() {
        this.attack.Reset();
        this.body.enabled = false;
        this.visible = false;
        this.rigidbody.velocity.fill(0);
    }

    Reset() {
        this.transform.SetPosition(...this.spawn);
        this.rigidbody.velocity.fill(0);
        this.health.Reset();
        this.attack.Reset();
        this.hurtRemaining = 0;
        this.facing = [0, -1];
        this.body.enabled = true;
        this.visible = true;
    }

    OnDestroy() {
        this.attack.Dispose();
        this.health.Detach();
        this.target = null;
        this.targets = [];
        this.physics.RemoveBody(this.body);
    }
}
