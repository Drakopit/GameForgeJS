import { ActionManager } from 'gameforgejs/core';

export class TrailMenuNavigation {
    constructor() {
        this.direction = 0;
        this.remaining = 0;
    }

    ReadStep(dt) {
        const down = ActionManager.GetActionValue('DOWN');
        const up = ActionManager.GetActionValue('UP');
        const direction = down > 0.45 ? 1 : up > 0.45 ? -1 : 0;
        if (!direction) {
            this.direction = 0;
            this.remaining = 0;
            return 0;
        }
        if (direction !== this.direction) {
            this.direction = direction;
            this.remaining = 0.35;
            return direction;
        }
        this.remaining -= dt;
        if (this.remaining > 0) return 0;
        this.remaining = 0.14;
        return direction;
    }
}
