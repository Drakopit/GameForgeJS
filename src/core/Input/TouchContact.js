import { Vector2D } from '../Math/Vector2D.js';

/** Snapshot of one identified contact, in browser client coordinates. */
export class TouchContact {
    constructor(identifier, position, startPosition = position, cancelled = false) {
        this.identifier = identifier;
        this.position = Vector2D.FromObject(position);
        this.startPosition = Vector2D.FromObject(startPosition);
        this.cancelled = cancelled;
    }

    Clone() {
        return new TouchContact(this.identifier, this.position, this.startPosition, this.cancelled);
    }
}
