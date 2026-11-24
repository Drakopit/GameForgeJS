export function createGame(options: any): Game;
export { resolveModules } from "./ModuleGraph.js";
/**
 * Services and data shared with levels and modules during one game session.
 * @typedef {Object} GameContext
 * @property {Game} game - The owning game session.
 * @property {HTMLCanvasElement|null} canvas - Canvas passed to the constructor, if any.
 * @property {Object} config - Defaults merged with the game configuration.
 * @property {EventEmitter} events - Session event bus.
 * @property {AssetManager} assets - Session asset store (images, audio, shaders, models, jsons).
 * @property {Map<string, *>} services - Services registered by modules (e.g. "audio").
 * @property {(cleanup: Function) => Function} onDispose - Registers a cleanup that runs on dispose().
 * @property {(type: string, loader: Function) => Function} registerAssetLoader - Adds a custom asset loader.
 */
/**
 * An independent game session. Browser services are created by optional modules.
 * start() is idempotent, stop() pauses, and dispose() permanently releases resources.
 */
export class Game {
    constructor({ canvas, config, configPath, manifestPath, levels, modules, beforeStart, fixedStep, requestFrame, cancelFrame, }?: {
        canvas?: any;
        config?: {};
        configPath?: any;
        manifestPath?: any;
        levels?: any[];
        modules?: any[];
        beforeStart?: any;
        fixedStep?: number;
        requestFrame?: (callback: any) => number;
        cancelFrame?: (id: any) => void;
    });
    state: string;
    levels: any[];
    currentIndex: number;
    modules: any[];
    configPath: any;
    manifestPath: any;
    beforeStart: any;
    fixedStep: number;
    requestFrame: (callback: any) => number;
    cancelFrame: (id: any) => void;
    frameId: number;
    lastTime: any;
    accumulator: number;
    timeScale: number;
    hitStopRemaining: number;
    cleanups: any[];
    initialized: boolean;
    startedLevels: Set<any>;
    startPromise: any;
    disposePromise: Promise<void>;
    stopRequested: boolean;
    disposing: boolean;
    /** @type {GameContext} */
    context: GameContext;
    events: EventEmitter;
    tick: (timestamp: any) => void;
    get currentLevel(): any;
    start(): any;
    startInternal(): Promise<this>;
    /** "Stats for Nerds" HUD: debug.statsKey (F3) toggles it; debug.stats shows it at start. */
    installStats(): void;
    enterLevel(): void;
    frame(timestamp: any): void;
    stop(): this;
    hitStop(seconds?: number): void;
    dispose(): Promise<void>;
    releaseResources(): Promise<any[]>;
}
/**
 * Services and data shared with levels and modules during one game session.
 */
export type GameContext = {
    /**
     * - The owning game session.
     */
    game: Game;
    /**
     * - Canvas passed to the constructor, if any.
     */
    canvas: HTMLCanvasElement | null;
    /**
     * - Defaults merged with the game configuration.
     */
    config: any;
    /**
     * - Session event bus.
     */
    events: EventEmitter;
    /**
     * - Session asset store (images, audio, shaders, models, jsons).
     */
    assets: AssetManager;
    /**
     * - Services registered by modules (e.g. "audio").
     */
    services: Map<string, any>;
    /**
     * - Registers a cleanup that runs on dispose().
     */
    onDispose: (cleanup: Function) => Function;
    /**
     * - Adds a custom asset loader.
     */
    registerAssetLoader: (type: string, loader: Function) => Function;
};
import { EventEmitter } from "./EventEmitter.js";
import { AssetManager } from "./Assets/AssetManager.js";
