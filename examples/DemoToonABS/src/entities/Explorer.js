import { ActionManager } from 'gameforgejs/core';
import { Combatant } from '../combat/Combatant.js';
import { Encounter } from '../data/Encounter.js';

export class Explorer extends Combatant {
    constructor(physics, spawn) {
        super(physics, spawn, '#e5b85c', Encounter.player, Encounter.playerAttack);
        this.name = 'Explorer';
    }

    OnUpdate() {
        this.moveX = Number(ActionManager.IsAction('RIGHT')) - Number(ActionManager.IsAction('LEFT'));
        this.moveZ = Number(ActionManager.IsAction('DOWN')) - Number(ActionManager.IsAction('UP'));
        this.attackRequested ||= ActionManager.IsActionDown('ATTACK');
    }

    OnFixedUpdate(dt) {
        this.TickCombat(dt);
        const requested = this.attackRequested;
        this.attackRequested = false;
        if (!this.health.IsAlive() || this.hurtRemaining > 0) return;

        const length = Math.max(1, Math.hypot(this.moveX, this.moveZ));
        if (this.CanAct() && (this.moveX !== 0 || this.moveZ !== 0)) {
            this.facing = [this.moveX / length, this.moveZ / length];
        }
        if (requested && this.CanAct()) this.attack.Start();

        const speed = this.CanAct() ? Encounter.player.speed : 0;
        this.rigidbody.velocity[0] = this.moveX / length * speed;
        this.rigidbody.velocity[2] = this.moveZ / length * speed;
    }

    Reset() {
        super.Reset();
        this.moveX = 0;
        this.moveZ = 0;
        this.attackRequested = false;
    }
}
