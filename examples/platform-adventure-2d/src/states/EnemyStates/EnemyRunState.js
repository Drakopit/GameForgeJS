import { EnemyIdleState } from './EnemyIdleState.js';
import { EnemyAttackState } from './EnemyAttackState.js';
import { State } from '../State.js';

export class EnemyRunState extends State {
    Enter() { this.owner.animator.Play('Run'); }

    Update(dt) {
        if (this.owner.isTakingDamage) return;
        if (this.owner.CanAttackPlayer()) {
            this.owner.stateMachine.ChangeState(new EnemyAttackState(this.owner));
        } else if (!this.owner.brain.Move(dt)) {
            this.owner.stateMachine.ChangeState(new EnemyIdleState(this.owner));
        }
    }
}
