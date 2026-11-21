import { Component, ActionManager } from 'gameforgejs/core';

export class CourierControl extends Component {
    constructor(level) { super(); this.level = level; }
    OnUpdate(dt) {
        if (this.level.sequence.playing) return;
        const axis = ActionManager.GetActionValue('RIGHT') - ActionManager.GetActionValue('LEFT') + this.level.hud.stick.direction.x;
        this.owner.position.x = Math.max(80, Math.min(this.level.rules.world.width - 80,
            this.owner.position.x + Math.max(-1, Math.min(1, axis)) * this.level.rules.walkSpeed * dt));
        this.level.focus.Copy(this.owner.position);
    }
}
