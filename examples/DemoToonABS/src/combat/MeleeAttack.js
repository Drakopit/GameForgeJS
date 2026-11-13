import { StateMachine } from 'gameforgejs/addons/state-machine';
import { ReadyState } from './states/ReadyState.js';
import { WindupState } from './states/WindupState.js';
import { ActiveState } from './states/ActiveState.js';
import { RecoveryState } from './states/RecoveryState.js';

export class MeleeAttack {
    constructor(actor, settings) {
        this.actor = actor;
        this.settings = settings;
        this.direction = [0, -1];
        this.hitTargets = new Set();
        this.machine = new StateMachine(this);
        this.states = {
            ready: new ReadyState(this),
            windup: new WindupState(this),
            active: new ActiveState(this),
            recovery: new RecoveryState(this),
        };
        this.Reset();
    }

    Start() {
        if (this.phase !== 'ready' || !this.actor.health.IsAlive()) return false;
        this.direction = [...this.actor.facing];
        this.hitTargets.clear();
        this.machine.ChangeState(this.states.windup);
        return true;
    }

    Contains(target) {
        const origin = this.actor.transform.position;
        const point = target.transform.position;
        const x = point[0] - origin[0];
        const z = point[2] - origin[2];
        const forward = x * this.direction[0] + z * this.direction[1];
        const sideways = x * this.direction[1] - z * this.direction[0];
        return forward >= 0 && forward <= this.settings.reach + 0.55
            && Math.abs(sideways) <= this.settings.halfWidth + 0.55
            && Math.abs(point[1] - origin[1]) < 1;
    }

    TryHit() {
        if (this.phase !== 'active') return;
        for (const target of this.actor.targets) {
            if (!target.health.IsAlive() || this.hitTargets.has(target) || !this.Contains(target)) continue;
            // Each living target gets one damage attempt per swing, even during invulnerability.
            this.hitTargets.add(target);
            target.health.Damage(1, this.actor);
        }
    }

    Update(dt) {
        this.machine.Update(dt);
    }

    Reset() {
        this.hitTargets.clear();
        this.machine.ChangeState(this.states.ready);
    }

    Dispose() {
        this.machine.Dispose();
        this.hitTargets.clear();
    }
}
