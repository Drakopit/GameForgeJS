import { EnemyIdleState } from "./EnemyIdleState.js";
import { State } from "../State.js";

export class EnemyRunState extends State {

    Enter() {
        this.owner.animator.Play("Run");
    }

    Update(dt) {

        let dist = this.owner.position.x - this.owner.player.position.x;

        if (Math.abs(dist) > 200) {
            this.owner.stateMachine.ChangeState(
                new EnemyIdleState(this.owner)
            );
            return;
        }

        if (dist > 5) {
            this.owner.position.x -= this.owner.speed * dt;
            this.owner.facingRight = false;
        }
        else if (dist < -5) {
            this.owner.position.x += this.owner.speed * dt;
            this.owner.facingRight = true;
        }

    }
}