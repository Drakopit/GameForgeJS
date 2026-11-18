import { State } from 'gameforgejs/addons/state-machine';

export class WindupState extends State {
    Enter() {
        this.owner.phase = 'windup';
        this.remaining = this.owner.settings.windup;
    }

    Update(dt) {
        this.remaining -= dt;
        if (this.remaining <= 0) {
            this.owner.machine.ChangeState(this.owner.states.active);
        }
    }
}
