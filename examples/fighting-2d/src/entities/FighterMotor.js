import { Component } from 'gameforgejs/core';
import { FighterSettings as Settings } from '../data/FightingSettings.js';

export class FighterMotor extends Component {
    Reset() { this.dashRemaining = 0; this.leftTap = this.rightTap = 0; this.wasLeft = this.wasRight = false; }
    OnAttach(owner) { super.OnAttach(owner); this.Reset(); }

    Control(dt, input) {
        const fighter = this.owner;
        this.leftTap = Math.max(0, this.leftTap - dt);
        this.rightTap = Math.max(0, this.rightTap - dt);
        this.dashRemaining = Math.max(0, this.dashRemaining - dt);
        if (input.down && fighter.IsGrounded()) {
            fighter.ChangeState('guard'); fighter.velocity.x = 0; return;
        }
        if (input.up && fighter.IsGrounded()) {
            fighter.velocity.y = Settings.jumpStrength;
            fighter.ChangeState('jump'); this.dashRemaining = 0;
        }
        if (input.left && !this.wasLeft) {
            if (this.leftTap > 0) this.dashRemaining = Settings.dashSeconds;
            this.leftTap = Settings.doubleTapSeconds;
        }
        if (input.right && !this.wasRight) {
            if (this.rightTap > 0) this.dashRemaining = Settings.dashSeconds;
            this.rightTap = Settings.doubleTapSeconds;
        }
        this.wasLeft = input.left; this.wasRight = input.right;
        const direction = Number(Boolean(input.right)) - Number(Boolean(input.left));
        if (direction) {
            const dash = this.dashRemaining > 0 ? Settings.dashMultiplier : 1;
            fighter.velocity.x = direction * Settings.walkSpeed * fighter.stats.speedMult * dash * (fighter.IsGrounded() ? 1 : Settings.airControl);
            if (fighter.IsGrounded()) fighter.ChangeState('walk');
        } else {
            fighter.velocity.x *= Math.pow(Settings.friction, dt * 60);
            if (fighter.IsGrounded()) fighter.ChangeState('idle');
        }
    }

    OnUpdate(dt) {
        const fighter = this.owner;
        if (fighter.level.roundState === 'intro') return;
        if (fighter.level.roundState !== 'fight') fighter.velocity.x *= Math.pow(Settings.friction, dt * 60);
        fighter.velocity.y += Settings.gravity * dt;
        fighter.position.AddSelf(fighter.velocity.MultiplyScalar(dt));
        if (fighter.position.y >= fighter.groundY) {
            if(fighter.velocity.y>80)fighter.landTimer=0.12;
            fighter.position.y = fighter.groundY; fighter.velocity.y = 0;
        }
        const arena = fighter.level.arena;
        fighter.position.x = Math.max(arena.left + Settings.pushRadius, Math.min(arena.right - Settings.pushRadius, fighter.position.x));
    }
}
