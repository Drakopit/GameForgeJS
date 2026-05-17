import { Collider3D } from "./Collider3D.js";

export class SphereCollider3D extends Collider3D {
    constructor({ radius = 0.5, offset = [0, 0, 0], isTrigger = false } = {}) {
        super({ type: "sphere", offset, isTrigger });
        this.radius = radius;
    }
}
