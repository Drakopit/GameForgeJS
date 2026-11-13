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
        this.rigidbody.velocity[0] = 0;
        this.rigidbody.velocity[2] = 0;
        if (!this.CanAct() || !this.target.health.IsAlive()) return;

        const x = this.target.transform.position[0] - this.transform.position[0];
        const z = this.target.transform.position[2] - this.transform.position[2];
        const distance = Math.hypot(x, z);
        if (distance > 0 && distance < this.attack.settings.reach + 0.55) {
            this.facing = [x / distance, z / distance];
            this.attack.Start();
        }
    }
}
