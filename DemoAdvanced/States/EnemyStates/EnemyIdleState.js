import { EnemyRunState } from "./EnemyRunState.js";
import { State } from "../State.js";

export class EnemyIdleState extends State {

    Enter() {
        this.owner.animator.Play("Idle");
    }

    Update(dt) {

        let dist = Math.abs(
            this.owner.position.x - this.owner.player.position.x
        );

        if (dist < 200) {
            this.owner.stateMachine.ChangeState(
                new EnemyRunState(this.owner)
            );
        }
    }
}