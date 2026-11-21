import { Component, Vector2D } from 'gameforgejs/core';

/** Distance-budget path traversal handles multiple short segments in one frame. */
export class WaypointMotion extends Component {
    constructor(points, speed) { super(); this.points = points.map(Vector2D.FromObject); this.speed = speed; this.index = 0; this.playing = false; }
    Restart() { this.index = 1; this.owner.position.Copy(this.points[0]); this.playing = true; }
    OnUpdate(dt) {
        if (!this.playing) return;
        let distance = this.speed * dt;
        while (this.index < this.points.length && distance >= 0) {
            const target = this.points[this.index], remaining = target.Subtract(this.owner.position), length = remaining.Length();
            if (length > distance) { this.owner.position.Copy(this.owner.position.Add(remaining.MultiplyScalar(distance / length))); break; }
            this.owner.position.Copy(target); distance -= length; this.index++;
        }
        if (this.index >= this.points.length) this.playing = false;
    }
}
