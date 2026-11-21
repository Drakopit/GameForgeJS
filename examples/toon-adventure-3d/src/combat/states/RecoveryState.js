import { State } from 'gameforgejs/addons/state-machine';

export class RecoveryState extends State {
    Enter() {
        this.owner.phase = 'recovery';
        this.remaining = this.owner.settings.recovery;
    }

    Update(dt) {
        this.remaining -= dt;
        if (this.remaining <= 0) {
            this.owner.machine.ChangeState(this.owner.states.ready);
        }
    }
}
