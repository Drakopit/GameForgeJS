import { EnemyIdleState } from "./EnemyIdleState.js";
import { State } from "../State.js";

export class EnemyHitState extends State {

    Enter() {

        this.owner.animator.Play("Hit");

        this.locked = true;

    }

    Update(dt) {

        this.owner.position.x += this.owner.knockbackSpeed * dt;

        this.owner.knockbackSpeed *= 0.9;

        if (this.owner.isGrounded && this.owner.vy >= 0) {

            this.owner.isTakingDamage = false;

            this.locked = false;

            this.owner.stateMachine.ChangeState(
                new EnemyIdleState(this.owner)
            );

        }

    }

}