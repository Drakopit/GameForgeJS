export class Collider3D {
    constructor({ type = "collider", offset = [0, 0, 0], isTrigger = false } = {}) {
        this.type = type;
        this.offset = [...offset];
        this.isTrigger = isTrigger;
    }

    GetCenter(transform) {
        return [
            transform.position[0] + this.offset[0],
            transform.position[1] + this.offset[1],
            transform.position[2] + this.offset[2],
        ];
    }
}
