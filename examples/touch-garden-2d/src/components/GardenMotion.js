import { ActionManager, Component, Vector2D } from 'gameforgejs/core';
import { GardenSettings as Settings } from '../data/GardenSettings.js';

export class GardenMotion extends Component {
    constructor(controls) {
        super();
        this.controls = controls;
        this.Reset();
    }

    Reset() {
        this.direction = new Vector2D();
        this.facing = new Vector2D(0, -1);
        this.dashRequested = false;
        this.dashRemaining = this.cooldownRemaining = 0;
        this.dashes = 0;
    }

    OnUpdate() {
        const keyboard = new Vector2D(ActionManager.GetActionValue('RIGHT') - ActionManager.GetActionValue('LEFT'),
            ActionManager.GetActionValue('DOWN') - ActionManager.GetActionValue('UP'));
        this.direction = this.controls.identifier !== null ? this.controls.direction.Clone() : keyboard;
        if (this.direction.Length() > 1) this.direction.NormalizeSelf();
        this.dashRequested ||= this.controls.dashPressed || ActionManager.IsActionDown('DASH');
    }

    OnFixedUpdate(dt) {
        this.cooldownRemaining = Math.max(0, this.cooldownRemaining - dt);
        this.dashRemaining = Math.max(0, this.dashRemaining - dt);
        if (this.direction.Length() > 0) this.facing = this.direction.Normalize();
        if (this.dashRequested && this.cooldownRemaining === 0) {
            this.dashRemaining = Settings.dashSeconds;
            this.cooldownRemaining = Settings.cooldownSeconds;
            this.dashes++;
        }
        this.dashRequested = false;
        const direction = this.dashRemaining > 0 ? this.facing : this.direction;
        const speed = Settings.speed * (this.dashRemaining > 0 ? Settings.dashMultiplier : 1);
        this.owner.velocity.SetVelocity(direction.x * speed, direction.y * speed);
    }
}
