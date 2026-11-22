/** Snapshot of one identified contact, in browser client coordinates. */
export class TouchContact {
    constructor(identifier: any, position: any, startPosition?: any, cancelled?: boolean);
    identifier: any;
    position: Vector2D;
    startPosition: Vector2D;
    cancelled: boolean;
    Clone(): TouchContact;
}
import { Vector2D } from '../Math/Vector2D.js';
