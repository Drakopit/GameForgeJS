import { GameObject } from 'gameforgejs/2d';
import { WaypointMotion } from '../components/WaypointMotion.js';
import { CourierControl } from '../components/CourierControl.js';
import { CourierVisual } from '../components/CourierVisual.js';
import { CourierSteps } from '../components/CourierSteps.js';

export class Courier extends GameObject {
    constructor(level) {
        super(); this.path = this.AddComponent(new WaypointMotion(level.rules.waypoints, level.rules.walkSpeed));
        this.AddComponent(new CourierControl(level)); this.AddComponent(new CourierVisual(level));
        this.AddComponent(new CourierSteps(level.sound));
    }
}
