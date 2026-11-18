import { Vector3D } from 'gameforgejs/core';
import { Combatant } from '../combat/Combatant.js';
import { Encounter } from '../data/Encounter.js';

export class Sentry extends Combatant {
    constructor(physics, spawn = Encounter.sentry.spawn) {
        super(physics, spawn, '#ce6976', Encounter.sentry, Encounter.sentryAttack);
        this.name = 'Sentry';
    }

    OnFixedUpdate(dt) {
        this.TickCombat(dt);
        if (!this.health.IsAlive() || this.hurtRemaining > 0) return;
        const velocity = Vector3D.FromArray(this.rigidbody.velocity);
        velocity.x = 0;
        velocity.z = 0;
        velocity.ToArray(this.rigidbody.velocity);
        if (!this.CanAct() || !this.target.health.IsAlive()) return;

        const position = Vector3D.FromArray(this.transform.position);
        const target = Vector3D.FromArray(this.target.transform.position);
        const x = target.x - position.x;
        const z = target.z - position.z;
        const distance = Math.hypot(x, z);
        if (distance > 0 && distance < this.attack.settings.reach + Encounter.colliderRadius) {
            this.facing = [x / distance, z / distance];
            this.attack.Start();
        }
    }
}
