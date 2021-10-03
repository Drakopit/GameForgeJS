import { Vector2D } from "./Vector2D.js";

export class MathExt {
    constructor() {}

    static Distance(p1, p2) {
        let distX = p1.position.GetValue().x - p2.position.GetValue().x
        let distY = p1.position.GetValue().y - p2.position.GetValue().y;
        return this.Module(distX + distY);
    }

    static DistanceVector(p1, p2) {
        let distX = (p1.position.GetValue().x - p2.position.GetValue().x);
        let distY = (p1.position.GetValue().y - p2.position.GetValue().y);
        return new Vector2D(this.Module(distX), this.Module(distY));
    }

    static Module(value) {
        return (value < 0) ? value * -1 : value;
    }
}