/**
 * @doc Class Mouse
 * @namespace Input
 * @class Mouse
 * @author Patrick Faustino Camello
 * @summary Manages mouse input for the game framework.
 * @Date 15/05/2019
 * @example
 * const mouse = new Mouse();
 * if (mouse.isClickDown(rect)) {
 *     // Execute some action when mouse is clicked inside the rectangle
 * }
 * @returns {Object}
 */
export class Mouse {
    constructor({ shared, target }?: {
        shared?: boolean;
        target?: Window & typeof globalThis;
    });
    target: Window & typeof globalThis;
    position: Vector2D;
    clickPosition: Vector2D;
    releasePosition: Vector2D;
    /** @type {Record<number, boolean>} */ buttons: Record<number, boolean>;
    /** @type {Record<number, boolean>} */ buttonsDown: Record<number, boolean>;
    /** @type {Record<number, boolean>} */ buttonsUp: Record<number, boolean>;
    /**
     * @doc Method
     * @description Handles the mouse move event and updates the current position.
     * @param {MouseEvent} event - The mouse move event
     * @example
     * // Automatically handled by the class
     */
    mouseMoveHandler(event: MouseEvent): void;
    /**
     * @doc Method
     * @description Handles the mouse down event and updates the click position.
     * @param {MouseEvent} event - The mouse down event
     * @example
     * // Automatically handled by the class
     */
    mouseDownHandler(event: MouseEvent): void;
    /**
     * @doc Method
     * @description Handles the mouse up event and updates the release position.
     * @param {MouseEvent} event - The mouse up event
     * @example
     * // Automatically handled by the class
     */
    mouseUpHandler(event: MouseEvent): void;
    Dispose(): void;
    /**
     * @doc Method
     * @description Gets the current absolute mouse position.
     * @returns {Vector2D} - The current mouse position
     * @example
     * const position = mouse.getPositionAbsolute();
     * console.log(position.x, position.y);
     */
    getPositionAbsolute(): Vector2D;
    /**
     * @doc Method
     * @description Gets the relative mouse position within a specified element.
     * @param {HTMLElement} element - The HTML element to calculate the relative position against
     * @returns {Vector2D} - The relative mouse position
     * @example
     * const relativePosition = mouse.getPositionRelative(element);
     * console.log(relativePosition.x, relativePosition.y);
     */
    getPositionRelative(element: HTMLElement): Vector2D;
    /**
     * @doc Method
     * @description Gets the mouse position at the time of the last click down.
     * @returns {Vector2D} - The position of the last mouse click down
     * @example
     * const clickPosition = mouse.getPositionClickDown();
     * console.log(clickPosition.x, clickPosition.y);
     */
    getPositionClickDown(): Vector2D;
    /**
     * @doc Method
     * @description Gets the mouse position at the time of the last click release.
     * @returns {Vector2D} - The position of the last mouse click release
     * @example
     * const releasePosition = mouse.getPositionClickRelease();
     * console.log(releasePosition.x, releasePosition.y);
     */
    getPositionClickRelease(): Vector2D;
    /**
     * @doc Method
     * @description Checks if the mouse was clicked down within a specified rectangle.
     * @param {Rectangle} rect - The rectangle to check against
     * @returns {boolean} - True if the mouse click was inside the rectangle, false otherwise
     * @example
     * if (mouse.isClickDown(rect)) {
     *     // Execute some action when mouse is clicked inside the rectangle
     * }
     */
    isClickDown(rect: Rectangle): boolean;
    /**
     * @doc Method
     * @description Checks if the mouse was released within a specified rectangle.
     * @param {Rectangle} rect - The rectangle to check against
     * @returns {boolean} - True if the mouse release was inside the rectangle, false otherwise
     * @example
     * if (mouse.isClickRelease(rect)) {
     *     // Execute some action when mouse is released inside the rectangle
     * }
     */
    isClickRelease(rect: Rectangle): boolean;
    /**
     * @doc Method
     * @description Checks if a point is colliding with a rectangle.
     * @param {Vector2D} point - The point to check
     * @param {Rectangle} rect - The rectangle to check against
     * @returns {boolean} - True if the point is inside the rectangle, false otherwise
     * @example
     * const isColliding = mouse.isColliding(new Vector2D(10, 10), rect);
     * console.log(isColliding);
     */
    isColliding(point: Vector2D, rect: Rectangle): boolean;
    ClearFrameData(): void;
}
import { Vector2D } from "../Math/Vector2D.js";
