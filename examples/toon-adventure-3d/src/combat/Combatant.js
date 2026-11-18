import { HealthComponent, Vector3D } from 'gameforgejs/core';
import { Mesh, PrimitiveMesh, ToonMaterial, Rigidbody3D, SphereCollider3D } from 'gameforgejs/3d';
import { MeleeAttack } from './MeleeAttack.js';
import { Encounter } from '../data/Encounter.js';

export class Combatant extends Mesh {
    constructor(physics, spawn, color, stats, attackSettings) {
        super({
            geometry: PrimitiveMesh.Sphere(Encounter.colliderRadius),
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
            collider: new SphereCollider3D({ radius: Encounter.colliderRadius }),
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
        const position = Vector3D.FromArray(this.transform.position);
        const sourcePosition = Vector3D.FromArray(source.transform.position);
        const x = position.x - sourcePosition.x;
        const z = position.z - sourcePosition.z;
        const velocity = Vector3D.FromArray(this.rigidbody.velocity);
        const length = Math.hypot(x, z);
        velocity.x = length > 0 ? x / length * Encounter.knockback.speed : 0;
        velocity.z = length > 0 ? z / length * Encounter.knockback.speed : Encounter.knockback.speed;
        velocity.ToArray(this.rigidbody.velocity);
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
