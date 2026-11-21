import { State } from 'gameforgejs/addons/state-machine';

export class ReadyState extends State {
    Enter() {
        this.owner.phase = 'ready';
    }
}
