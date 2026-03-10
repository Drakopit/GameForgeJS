// ==========================================
// ESTADO: ATACANDO (Attack_1)
// ==========================================

import { State } from "../State.js";
import { IdleState } from "./PlayerIdleState.js";

export class AttackState extends State {
    Enter() {
        this.locked = true;
        this.owner.animator.Play("Attack_1");
    }

    Update(dt) {
        let sprite = this.owner.sprite;

        if (sprite.index >= sprite.frameCount - 1) {
            this.locked = false;

            this.owner.stateMachine.ChangeState(
                new IdleState(this.owner)
            );
        }
    }

    Exit() {
        // Segurança vital
        this.owner.isAttacking = false;
        this.owner.attackHitBox.active = false;
    }
}