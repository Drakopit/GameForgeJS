import { State } from 'gameforgejs/addons/state-machine';

export class RestState extends State {
    Enter() {
        this.owner.label = 'Rest';
        this.remaining = 0.8;
    }

    Update(dt) {
        this.remaining -= dt;

        if (this.remaining <= 0) {
            this.owner.direction *= -1;
            this.owner.machine.ChangeState(this.owner.states.patrol);
        }
    }
}
