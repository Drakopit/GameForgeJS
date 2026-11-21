import { State } from 'gameforgejs/addons/state-machine';

export class PatrolState extends State {
    Enter() {
        this.owner.label = 'Patrol';
    }

    Update(dt) {
        const actor = this.owner;
        const { left: leftBoundary, right: rightBoundary, speed } = actor.patrol;

        actor.position.x += actor.direction * speed * dt;

        if (actor.position.x >= rightBoundary || actor.position.x <= leftBoundary) {
            actor.position.x = Math.max(leftBoundary, Math.min(rightBoundary, actor.position.x));
            actor.machine.ChangeState(actor.states.rest);
        }
    }
}
