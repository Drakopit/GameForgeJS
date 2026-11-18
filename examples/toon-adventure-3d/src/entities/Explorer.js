import { ShallowWaterContact } from '../components/ShallowWaterContact.js';
import { ActionManager, Vector3D } from 'gameforgejs/core';
import { Combatant } from '../combat/Combatant.js';
import { Encounter } from '../data/Encounter.js';

export class Explorer extends Combatant {
    constructor(physics, spawn, waterZones = []) {
        super(physics, spawn, '#e5b85c', Encounter.player, Encounter.playerAttack);
        this.name = 'Explorer';
        this.waterContact = new ShallowWaterContact(waterZones).Attach(this);
    }

    OnUpdate() {
        this.moveX = ActionManager.GetActionValue('RIGHT') - ActionManager.GetActionValue('LEFT');
        this.moveZ = ActionManager.GetActionValue('DOWN') - ActionManager.GetActionValue('UP');
        this.attackRequested ||= ActionManager.IsActionDown('ATTACK');
    }

    OnFixedUpdate(dt) {
        this.waterContact.OnFixedUpdate(dt);
        this.TickCombat(dt);
        const requested = this.attackRequested;
        this.attackRequested = false;
        if (!this.health.IsAlive() || this.hurtRemaining > 0) return;

        const length = Math.max(1, Math.hypot(this.moveX, this.moveZ));
        if (this.CanAct() && (this.moveX !== 0 || this.moveZ !== 0)) {
            const directionLength = Math.hypot(this.moveX, this.moveZ);
            this.facing = [this.moveX / directionLength, this.moveZ / directionLength];
        }
        if (requested && this.CanAct()) this.attack.Start();

        const speed = this.CanAct() ? Encounter.player.speed * this.waterContact.speedMultiplier : 0;
        const velocity = Vector3D.FromArray(this.rigidbody.velocity);
        velocity.x = this.moveX / length * speed;
        velocity.z = this.moveZ / length * speed;
        velocity.ToArray(this.rigidbody.velocity);
    }

    OnDestroy() {
        this.waterContact.Detach();
        super.OnDestroy();
    }

    Reset() {
        super.Reset();
        this.waterContact?.Reset();
        this.moveX = 0;
        this.moveZ = 0;
        this.attackRequested = false;
    }
}
