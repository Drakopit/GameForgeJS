import { State } from 'gameforgejs/addons/state-machine';

export class ActiveState extends State {
    Enter() {
        this.owner.phase = 'active';
        this.remaining = this.owner.settings.active;
    }

    Update(dt) {
        this.owner.TryHit();
        this.remaining -= dt;
        if (this.remaining <= 0) {
            this.owner.machine.ChangeState(this.owner.states.recovery);
        }
    }
}
