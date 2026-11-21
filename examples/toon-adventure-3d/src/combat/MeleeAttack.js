import { Vector2D, Vector3D } from 'gameforgejs/core';
import { Encounter } from '../data/Encounter.js';
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
        const origin = Vector3D.FromArray(this.actor.transform.position);
        const point = Vector3D.FromArray(target.transform.position);
        const direction = Vector2D.FromArray(this.direction);
        const x = point.x - origin.x;
        const z = point.z - origin.z;
        const forward = x * direction.x + z * direction.y;
        const sideways = x * direction.y - z * direction.x;
        return forward >= 0 && forward <= this.settings.reach + target.body.collider.radius
            && Math.abs(sideways) <= this.settings.halfWidth + target.body.collider.radius
            && Math.abs(point.y - origin.y) < Encounter.verticalHitTolerance;
    }

    TryHit() {
        if (this.phase !== 'active') return;
        for (const target of this.actor.targets) {
            if (!target.health.IsAlive() || this.hitTargets.has(target) || !this.Contains(target)) continue;
            // Each living target gets one damage attempt per swing, even during invulnerability.
            this.hitTargets.add(target);
            if (target.health.Damage(1, this.actor) > 0) this.onHit?.();
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
        this.onHit = null;
        this.machine.Dispose();
        this.hitTargets.clear();
    }
}
