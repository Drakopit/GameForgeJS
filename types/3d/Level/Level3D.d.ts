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
    scene: any;
    camera: any;
    physics: PhysicsWorld3D;
    /**
     * Scene construction hook implemented by a game level.
     * @returns {void}
     */
    BuildScene(): void;
    /**
     * Builds the level from a scene file, exactly as the editor's 3D view draws it
     * (SceneManifest3D.Create: camera, background, fog, skybox, lights, objects), and starts the
     * scene's systems: animations, particle emitters, audio sources and UI canvases
     * (SceneSystems). Positional audio hears from the camera.
     * @param {SceneDocument|Object|string} source - A scene, its JSON, or its resources.json name.
     * @returns {Object} SceneManifest3D content plus `systems` and `document`.
     * @example
     * BuildScene() {
     *     const { systems } = this.BuildFromScene("first_scene");
     *     this.hud = systems.Find("hud").canvas;
     * }
     */
    BuildFromScene(source: SceneDocument | any | string): any;
    sceneSystems: {
        audio: import("../../core/index.js").AudioSource[];
        emitters: import("../../core/index.js").ParticleEmitter[];
        renderers: any[];
        canvases: import("../../core/index.js").UICanvas[];
        animations: AnimationPlayer[];
        byId: Map<string, {
            audio?: import("../../core/index.js").AudioSource;
            emitter?: import("../../core/index.js").ParticleEmitter;
            canvas?: import("../../core/index.js").UICanvas;
            animation?: AnimationPlayer;
        }>;
        Find(id: string): {
            audio?: import("../../core/index.js").AudioSource;
            emitter?: import("../../core/index.js").ParticleEmitter;
            canvas?: import("../../core/index.js").UICanvas;
            animation?: AnimationPlayer;
        };
        All(): any[];
    };
    OnFixedUpdate(dt: any): void;
}
import { Level } from "../../core/Level/Level.js";
import { Screen3D } from "../Window/Screen3D.js";
import { WebGL3DRenderer } from "../Render3D/index.js";
import { PhysicsWorld3D } from "../Physics/PhysicsWorld3D.js";
import { SceneDocument } from "../../core/Scene/SceneDocument.js";
import { AnimationPlayer } from "../../core/Animation/AnimationPlayer.js";
