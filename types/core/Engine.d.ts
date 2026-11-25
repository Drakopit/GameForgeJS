/**
 * Ordered level registry and current-level cursor used by `Engine`.
 * @type {Object}
 */
export const LevelHandler: any;
export function DEBUG(): boolean;
/**
 * Main update and render loop orchestrator for the active GameForgeJS level.
 *
 * The engine publishes frame events consumed by systems such as `Input`.
 */
export class Engine extends Base {
    static events: EventEmitter;
    static timeScale: number;
    static hitStopRemaining: number;
    static running: boolean;
    static initialized: boolean;
    static frameId: any;
    static cleanups: any[];
    static startedLevels: Set<any>;
    static context: any;
    /** Scene switching (`context.scenes`): load registered levels by name or index. */
    static scenes: SceneManager;
    static HitStop(duration?: number): void;
    static IsHitStopped(): boolean;
    /**
     * @doc Method
     * @description Initializes the engine, loads the first level, and starts the game loop.
     * @example
     *  Engine.OnStart();
     * @returns {void}
     */
    static OnStart(): void;
    static Stop(): void;
    static Dispose(): Promise<void>;
    /**
     * @doc Method
     * @description Main game loop, updates the game state and renders the scene.
     * @example
     *  Engine.OnFixedUpdate();
     * @returns {void}
     */
    static GameLoop(currentTime: any): void;
    /**
     * @doc Method
     * @description Override this method to implement custom drawing logic.
     * @example
     *  Engine.OnDrawn = function() { // Custom draw logic };
     * @returns {void}
     */
    static OnDrawn(): void;
    /**
     * @doc Method
     * @param {string} levelId - The ID of the level to remove.
     * @description Removes the specified level from the DOM.
     * @example
     *  Engine.RemoveLevel("level1");
     * @returns {void}
     */
    static RemoveLevel(levelId: string): void;
}
import { Base } from "./Base.js";
import { EventEmitter } from "./EventEmitter.js";
import { SceneManager } from "./Scene/SceneManager.js";
