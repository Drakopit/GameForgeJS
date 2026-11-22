/**
 * Base level for current Render3D games with optional canvas UI and physics.
 *
 * Extend this class and implement `BuildScene()` to add objects, lights and
 * skyboxes; the standard level lifecycle renders and disposes the scene.
 *
 * @param {Object} [options] - Canvas, rendering and simulation settings.
 * @param {string} [options.canvasId="gameCanvas3D"] - Render canvas identifier.
 * @param {string} [options.uiCanvasId="gameCanvasUI"] - Overlay UI canvas identifier.
 * @param {number} [options.width=960] - Logical render width.
 * @param {number} [options.height=540] - Logical render height.
 * @param {number[]} [options.clearColor] - RGBA clear color.
 * @param {boolean} [options.useUI=true] - Whether to create `ScreenUI`.
 * @param {boolean} [options.usePhysics=true] - Whether to create `PhysicsWorld3D`.
 * @example
 * class FirstLevel extends Level3D {
 *     BuildScene() {
 *         this.scene.Add(new DirectionalLight({ castShadow: true }));
 *     }
 * }
 */
export class Level3D extends Level {
    constructor({ canvasId, uiCanvasId, width, height, clearColor, useUI, usePhysics, }?: {
        canvasId?: string;
        uiCanvasId?: string;
        width?: number;
        height?: number;
        clearColor?: number[];
        useUI?: boolean;
        usePhysics?: boolean;
    });
    canvasId: string;
    uiCanvasId: string;
    width: number;
    height: number;
    clearColor: number[];
    useUI: boolean;
    usePhysics: boolean;
    screen3D: Screen3D;
    ui: any;
    renderer: WebGL3DRenderer;
    scene: Scene3D;
    camera: PerspectiveCamera;
    physics: PhysicsWorld3D;
    /**
     * Scene construction hook implemented by a game level.
     * @returns {void}
     */
    BuildScene(): void;
    OnFixedUpdate(dt: any): void;
}
import { Level } from "../../core/Level/Level.js";
import { Screen3D } from "../Window/Screen3D.js";
import { WebGL3DRenderer } from "../Render3D/index.js";
import { Scene3D } from "../Render3D/index.js";
import { PerspectiveCamera } from "../Render3D/index.js";
import { PhysicsWorld3D } from "../Physics/PhysicsWorld3D.js";
