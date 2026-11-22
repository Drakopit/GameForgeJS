/**
 * Canvas effect for short-lived labels such as damage or collectible feedback.
 *
 * @param {Screen} screen - Target 2D canvas screen.
 */
export class FloatingText {
    constructor(screen: any);
    name: string;
    zIndex: number;
    draw: Draw;
    position: Vector2D;
    velocity: Vector2D;
    active: boolean;
    text: string;
    age: number;
    lifeTime: number;
    color: string;
    font: string;
    fontSize: number;
    /**
     * Activates this effect at a world or HUD position.
     * @param {string|number} text - Display content.
     * @param {number} x - Horizontal position.
     * @param {number} y - Vertical position.
     * @param {Object} [options={}] - Velocity, lifetime and font overrides.
     * @returns {void}
     */
    Spawn(text: string | number, x: number, y: number, options?: any): void;
    OnUpdate(dt: any): void;
    OnDrawn(): void;
}
import { Draw } from "../Graphics/Draw.js";
import { Vector2D } from "../../core/Math/Vector2D.js";
