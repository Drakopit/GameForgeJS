/**
 * Identified touch stick sharing Input's contacts; owns no DOM, listeners or loop.
 * Set origin from the HUD layout, then Update once per frame and read direction.
 */
export class VirtualStick {
    /** @param {import('../Window/Screen.js').Screen} screen @param {{radius?: number, deadzone?: number}} [options] */
    constructor(screen: import("../Window/Screen.js").Screen, { radius, deadzone }?: {
        radius?: number;
        deadzone?: number;
    });
    screen: import("../index.js").Screen;
    radius: number;
    deadzone: number;
    origin: Vector2D;
    direction: Vector2D;
    identifier: any;
    /** Call each engine frame; origin can follow responsive HUD layout. */
    Update(): void;
    Draw(context: any): void;
    Cancel(): void;
}
import { Vector2D } from '../../core/Math/Vector2D.js';
