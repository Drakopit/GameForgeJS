/**
 * Viewport camera for translating, zooming and shaking a 2D game world.
 *
 * @param {Vector2D} position - Initial world position.
 * @param {Vector2D} size - Visible viewport size.
 */
export class Camera extends Base {
    /**
     * @doc Constructor
     * @param {Vector2D} position - Initial position of the camera.
     * @param {Vector2D} size - Size of the camera view.
     * @description Initializes the camera with a given position and size.
     */
    constructor(position: Vector2D, size: Vector2D);
    position: Vector2D;
    size: Vector2D;
    zoom: number;
    GameWorld: any;
    screen: any;
    draw: Draw;
    shake: {
        remaining: number;
        duration: number;
        intensity: number;
        frequency: number;
        elapsed: number;
        offset: Vector2D;
    };
    /**
     * @doc Method
     * @param {Object} screen - The screen or canvas where the game is rendered.
     * @param {Object} GameWorld - The game world object.
     * @description Initializes the camera with screen and game world.
     */
    Init(screen: any, GameWorld: any): void;
    /**
     * @doc Method
     * @param {Object} Obj - The object to center the camera on.
     * @description Centers the camera view on the given object.
     */
    LookAt(Obj: any): void;
    /**
     * @doc Method
     * @param {number} value - Zoom factor.
     * @description Zooms in by a given factor.
     */
    ZoomIn(value: number): void;
    /**
     * @doc Method
     * @param {number} value - Zoom factor.
     * @description Zooms out by a given factor.
     */
    ZoomOut(value: number): void;
    /**
     * @doc Method
     * @description Constrains the camera within the game world boundaries.
     */
    StrictLimit(): void;
    /**
     * @doc Method
     * @description Begins camera transformation for rendering.
     */
    Begin(): void;
    /** Set magnification without cumulatively changing the viewport size. */
    SetZoom(value: any): this;
    /**
     * @doc Method
     * @description Ends camera transformation after rendering.
     */
    End(): void;
    /**
     * @doc Method
     * @param {Object} char - The character or object to focus the camera on.
     * @description Updates the camera position and zoom based on the given object.
     */
    Update(char: any, deltaTime?: number): void;
    Shake(duration?: number, intensity?: number, frequency?: number): void;
    UpdateShake(deltaTime?: number): void;
    ApplyShakeOffset(): void;
    /**
     * @doc Method
     * @returns {number} - The left edge position of the camera view.
     */
    LeftEdge(): number;
    /**
     * @doc Method
     * @returns {number} - The right edge position of the camera view.
     */
    RightEdge(): number;
    /**
     * @doc Method
     * @returns {number} - The top edge position of the camera view.
     */
    TopEdge(): number;
    /**
     * @doc Method
     * @returns {number} - The bottom edge position of the camera view.
     */
    BottomEdge(): number;
}
import { Base } from "../../core/Base.js";
import { Vector2D } from "../../core/Math/Vector2D.js";
import { Draw } from "../Graphics/Draw.js";
