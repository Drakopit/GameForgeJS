import { Component } from 'gameforgejs/core';
/** Distance-based cadence stays stable when a cutscene changes walking speed. */
export class CourierSteps extends Component {
    constructor(sound) { super(); this.sound = sound; this.distance = 0; this.previous = null; }
    OnUpdate() {
        const current = this.owner.position;
        if (this.previous !== null)
            this.distance += Math.min(30, Math.abs(current.x - this.previous));
        this.previous = current.x;
        if (this.distance > 65) {
            this.distance = 0;
            this.sound.Play('step');
        }
    }
}
