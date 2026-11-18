import { MenuSettings } from '../data/TrailSettings.js';
import { ActionManager } from 'gameforgejs/core';

export class TrailMenuNavigation {
    constructor() {
        this.direction = 0;
        this.remaining = 0;
    }

    ReadStep(dt) {
        const down = ActionManager.GetActionValue('DOWN');
        const up = ActionManager.GetActionValue('UP');
        const direction = down > MenuSettings.directionThreshold ? 1 : up > MenuSettings.directionThreshold ? -1 : 0;
        if (!direction) {
            this.direction = 0;
            this.remaining = 0;
            return 0;
        }
        if (direction !== this.direction) {
            this.direction = direction;
            this.remaining = MenuSettings.initialRepeatSeconds;
            return direction;
        }
        this.remaining -= dt;
        if (this.remaining > 0) return 0;
        this.remaining = MenuSettings.repeatSeconds;
        return direction;
    }
}
