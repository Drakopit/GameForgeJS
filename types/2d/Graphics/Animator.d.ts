/**
 * @doc Class Animator
 * @namespace Graphic
 * @class Animator
 * @summary Controls animation selection and transitions for one sprite.
 */
export class Animator {
    constructor(sprite: any);
    sprite: any;
    animations: {};
    currentAnimation: any;
    currentAnimationName: any;
    onEvent: any;
    lastFrame: number;
    nextAnimation: any;
    transitionTime: number;
    transitionDuration: number;
    /**
     * @description Registers an animation and its sprite-sheet settings.
     * @param {string} name - Animation name, such as "Idle" or "Run".
     * @param {HTMLImageElement|HTMLCanvasElement} image - Loaded sprite sheet.
     * @param {number} row - Row in the sprite sheet.
     * @param {number} totalFrames - Number of animation frames.
     * @param {number} speed - Animation timing in updates per frame.
     * @param {number} [pivotX=0.5] - Horizontal sprite pivot.
     * @param {number} [pivotY=1] - Vertical sprite pivot.
     * @param {number} [groundOffset=0] - Offset applied at the ground anchor.
     * @param {Object|null} [events=null] - Animation events keyed by frame.
     * @param {Object} [options={}] - Additional settings, including loop.
     */
    AddAnimation(name: string, image: HTMLImageElement | HTMLCanvasElement, row: number, totalFrames: number, speed: number, pivotX?: number, pivotY?: number, groundOffset?: number, events?: any | null, options?: any): void;
    Transition(name: any, duration?: number): void;
    Update(dt: any): void;
    /**
     * @description Plays the animation unless it is already active.
     */
    Play(name: any): void;
}
