/**
 * Canvas sprite renderer supporting sheet-based animation frames.
 *
 * @param {Screen} screen - Destination canvas screen.
 * @param {string} spriteSrc - Loaded image key or sprite source.
 */
export class Sprite {
    constructor(screen: any, spriteSrc: any);
    screen: any;
    position: Vector2D;
    size: Vector2D;
    scale: number;
    direction: string;
    row: number;
    index: number;
    frameCount: number;
    loop: boolean;
    finished: boolean;
    updateFrame: number;
    updatesPerFrame: number;
    frameTimer: number;
    sprite: HTMLImageElement;
    /**
     * @doc Method
     * @param {string} [spriteSrc] - The path to the sprite image.
     * @param {Vector2D} position - The position on the canvas to draw the sprite.
     * @description Draws a static sprite on the canvas.
     * @example
     *  sprite.Static('path/to/sprite.png', new Vector2D(100, 100));
     */
    Static(spriteSrc?: string, position: Vector2D): void;
    /**
     * @doc Method
     * @param {string} [spriteSrc] - The path to the sprite image.
     * @param {Vector2D} position - The position on the canvas to draw the sprite.
     * @param {Vector2D} size - The size of the sprite to draw.
     * @param {Vector2D} cutPosition - The position to start clipping from.
     * @param {Vector2D} cutSize - The size of the clipping area.
     * @description Draws a clipped portion of a sprite.
     * @example
     *  sprite.Cliping('path/to/sprite.png', new Vector2D(100, 100), new Vector2D(32, 32), new Vector2D(0, 0), new Vector2D(32, 32));
     */
    Cliping(spriteSrc?: string, position: Vector2D, size: Vector2D, cutPosition: Vector2D, cutSize: Vector2D): void;
    /**
     * @doc Method
     * @param {string} [spriteSrc] - The path to the sprite image.
     * @param {Vector2D} position - The position on the canvas to draw the sprite.
     * @param {Vector2D} size - The new size to stretch the sprite.
     * @description Draws the sprite stretched to the specified size on the canvas.
     * @example
     *  sprite.Stretched('path/to/sprite.png', new Vector2D(100, 100), new Vector2D(200, 200));
     */
    Stretched(spriteSrc?: string, position: Vector2D, size: Vector2D): void;
    /**
     * @doc Method
     * @param {string} spriteSrc - The path to the sprite image.
     * @param {Vector2D} position - The position on the canvas to draw the sprite.
     * @param {string} [direction='horizontal'] - The animation direction ('horizontal' or 'vertical').
     * @param {number} [row=0] - The row index for vertical animations.
     * @description Draws an animated sprite based on the current index and row.
     * @example
     *  sprite.Animation('path/to/sprite.png', new Vector2D(100, 100), 'horizontal', 0);
     */
    Animation(spriteSrc: string, position: Vector2D, direction?: string, row?: number, facingRight?: boolean, scale?: number): void;
    /**
     * @doc Method
     * @description Updates the animation frame using the old updates-per-frame value as a 60 FPS timing reference.
     * @example
     *  sprite.Update(deltaTime);
     */
    Update(deltaTime?: number): void;
    /**
     * @doc Method
     * @description Resets the animation frame to the first frame.
     * @example
     *  sprite.Reset();
     */
    Reset(): void;
}
import { Vector2D } from "../../core/Math/Vector2D.js";
