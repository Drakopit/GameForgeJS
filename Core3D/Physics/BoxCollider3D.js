import { Collider3D } from "./Collider3D.js";

export class BoxCollider3D extends Collider3D {
    constructor({ size = [1, 1, 1], offset = [0, 0, 0], isTrigger = false } = {}) {
        super({ type: "box", offset, isTrigger });
        this.size = [...size];
    }

    GetBounds(transform) {
        const center = this.GetCenter(transform);
        const half = [this.size[0] / 2, this.size[1] / 2, this.size[2] / 2];

        return {
            min: [center[0] - half[0], center[1] - half[1], center[2] - half[2]],
            max: [center[0] + half[0], center[1] + half[1], center[2] + half[2]],
        };
    }
}
