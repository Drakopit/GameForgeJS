import { startModules } from './Module.js';
import { EventEmitter } from "./EventEmitter.js";
import { AssetManager } from "./Assets/AssetManager.js";
import { ResourceManifestLoader } from "./Assets/ResourceManifestLoader.js";
import { Config } from "./Config.js";
import { FrameStats } from "./Debug/FrameStats.js";
import { StatsOverlay } from "./Debug/StatsOverlay.js";
import { SceneManager } from "./Scene/SceneManager.js";

import { resolveModules } from './ModuleGraph.js';
export { resolveModules } from './ModuleGraph.js';

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
    constructor({ canvas = null, config = {}, configPath = null, manifestPath = null,
        levels = [], modules = [], beforeStart = null, fixedStep = 1 / 60,
        requestFrame = callback => globalThis.requestAnimationFrame(callback),
        cancelFrame = id => globalThis.cancelAnimationFrame(id),
    } = {}) {
        if (!(Number.isFinite(fixedStep) && fixedStep > 0)) throw new Error("fixedStep must be positive and finite.");
        this.state = "created";
        this.levels = [...levels];
        this.currentIndex = 0;
        this.modules = [...modules];
        this.configPath = configPath;
        this.manifestPath = manifestPath;
        this.beforeStart = beforeStart;
        this.fixedStep = fixedStep;
        this.requestFrame = requestFrame;
        this.cancelFrame = cancelFrame;
        this.frameId = null;
        this.lastTime = null;
        this.accumulator = 0;
        this.timeScale = 1;
        this.hitStopRemaining = 0;
        this.cleanups = [];
        this.initialized = false;
        this.startedLevels = new Set();
        this.startPromise = null;
        this.disposePromise = null;
        this.stopRequested = false;
        this.disposing = false;
        const events = new EventEmitter();
        const assets = new AssetManager({ shared: false });
        /** @type {GameContext} */
        this.context = {
            game: this, canvas, config: Config.DeepMerge(Config.Defaults(), config), events, assets,
            services: new Map(),
            onDispose: cleanup => {
                if (typeof cleanup !== "function") throw new TypeError("onDispose requires a cleanup function.");
                this.cleanups.push(cleanup);
                return cleanup;
            },
            registerAssetLoader: (type, loader) => {
                const cleanup = assets.RegisterLoader(type, loader);
                this.cleanups.push(cleanup);
                return cleanup;
            },
        };
        this.events = events;
        /** Scene switching (`context.scenes`): load registered levels by name or index. */
        this.scenes = new SceneManager({
            levels: () => this.levels,
            getIndex: () => this.currentIndex,
            setIndex: index => { this.currentIndex = index; },
            enter: () => this.enterLevel(),
        });
        this.context.scenes = this.scenes;
        this.tick = timestamp => this.frame(timestamp);
    }

    get currentLevel() { return this.levels[this.currentIndex] ?? null; }

    /**
     * Loads a registered scene (level) by name or index at the start of the next frame.
     * @see SceneManager#Load
     */
    loadScene(target, params) { return this.scenes.Load(target, params); }

    start() {
        if (this.disposing || this.state === "disposed") return Promise.reject(new Error("Cannot start a disposed game."));
        if (this.startPromise) return this.startPromise;
        if (this.state === "running") return Promise.resolve(this);
        this.stopRequested = false;
        this.startPromise = this.startInternal().finally(() => { this.startPromise = null; });
        return this.startPromise;
    }

    async startInternal() {
        this.state = "starting";
        try {
            if (!this.initialized) {
                const ordered = resolveModules(this.modules);
                if (this.configPath) this.context.config = await Config.Read(this.configPath, this.context.config);
                for (const module of ordered) {
                    const cleanup = await module.setup(this.context);
                    if (cleanup !== undefined && typeof cleanup !== "function") {
                        throw new TypeError(`Module '${module.id}' must return a cleanup function or undefined.`);
                    }
                    if (cleanup) this.cleanups.push(cleanup);
                }
                if (this.manifestPath) {
                    this.context.manifest = await ResourceManifestLoader.Load(this.manifestPath, this.context.assets);
                }
                await this.beforeStart?.(this.context);
                this.installStats();
                await startModules(ordered);
                // A scene loaded before start (loadScene) is the first one.
                const first = this.scenes.pending;
                this.scenes.pending = null;
                if (first) {
                    this.currentIndex = first.index;
                    this.scenes.params = first.params;
                    if (this.currentLevel) this.currentLevel.sceneParams = first.params;
                }
                this.enterLevel();
                this.initialized = true;
            }
            this.lastTime = null;
            this.accumulator = 0;
            this.state = this.stopRequested || this.disposing ? "stopped" : "running";
            if (this.state === "running") {
                this.frameId = this.requestFrame(this.tick);
                this.events.emit("started", this.context);
            }
            return this;
        } catch (error) {
            this.stop();
            const cleanupErrors = await this.releaseResources();
            this.state = "disposed";
            if (cleanupErrors.length) throw new AggregateError([error, ...cleanupErrors], "Game startup failed and cleanup reported errors.");
            throw error;
        }
    }

    /** "Stats for Nerds" HUD: debug.statsKey (F3) toggles it; debug.stats shows it at start. */
    installStats() {
        const debug = this.context.config?.debug ?? {};
        if (typeof window === "undefined" || typeof document === "undefined" || debug.statsKey === false) return;
        this.cleanups.push(StatsOverlay.Install({ key: debug.statsKey || "F3", visible: debug.stats === true }));
    }

    enterLevel() {
        const level = this.currentLevel;
        if (!level) return;
        level.context = this.context;
        // Register before calling user code so a partially initialized level is cleaned up.
        this.startedLevels.add(level);
        level.OnStart?.(this.context);
    }

    frame(timestamp) {
        this.frameId = null;
        if (this.state !== "running") return;
        const stats = FrameStats.global;
        const workStart = stats.enabled ? globalThis.performance?.now?.() : null;
        try {
            const dt = this.lastTime === null ? 0 : Math.max(0, Math.min((timestamp - this.lastTime) / 1000, 0.25));
            this.lastTime = timestamp;
            let gameDt = dt * Math.max(0, this.timeScale);
            if (this.hitStopRemaining > 0) {
                this.hitStopRemaining = Math.max(0, this.hitStopRemaining - dt);
                gameDt = 0;
            }
            this.events.emit("PreUpdate", timestamp);
            if (this.state !== "running") return;
            // Scene switches (loadScene, level.Next / level.Back): OnExit, then the new OnStart.
            this.scenes.Apply();
            this.accumulator += gameDt;
            this.events.emit("update", gameDt);
            if (this.state !== "running") return;
            this.currentLevel?.OnUpdate?.(gameDt);
            while (this.accumulator >= this.fixedStep) {
                this.events.emit("fixedUpdate", this.fixedStep);
                this.currentLevel?.OnFixedUpdate?.(this.fixedStep);
                this.accumulator -= this.fixedStep;
            }
            this.events.emit("draw", gameDt);
            this.currentLevel?.OnDrawn?.();
            this.events.emit("gui", gameDt);
            this.currentLevel?.OnGUI?.();
            this.events.emit("render", this.accumulator / this.fixedStep);
            this.events.emit("PostUpdate", timestamp);
            if (workStart !== null && workStart !== undefined) {
                stats.Work(globalThis.performance.now() - workStart);
                const entities = this.currentLevel?.entities;
                if (Array.isArray(entities)) stats.Observe("entities", entities.length);
            }
        } catch (error) {
            this.stop();
            if (this.events.listeners.error?.length) this.events.emit("error", error);
            else globalThis.console?.error("GameForgeJS frame failed:", error);
            return;
        }
        if (this.state === "running") this.frameId = this.requestFrame(this.tick);
    }

    stop() {
        this.stopRequested = true;
        if (this.frameId !== null) this.cancelFrame(this.frameId);
        this.frameId = null;
        if (this.state !== "disposed") this.state = "stopped";
        return this;
    }

    hitStop(seconds = 0.06) {
        this.hitStopRemaining = Math.max(this.hitStopRemaining, Math.max(0, seconds));
    }

    dispose() {
        if (this.disposePromise) return this.disposePromise;
        this.disposing = true;
        this.stop();
        this.disposePromise = (async () => {
            if (this.startPromise) await this.startPromise.catch(() => {});
            if (this.state === "disposed") return;
            const errors = await this.releaseResources();
            this.state = "disposed";
            if (errors.length) throw new AggregateError(errors, "Game cleanup failed.");
        })();
        return this.disposePromise;
    }

    async releaseResources() {
        const errors = [];
        for (const level of [...this.startedLevels].reverse()) {
            try {
                if (typeof level.OnDestroy === "function") await level.OnDestroy();
                else await level.OnExit?.();
            } catch (error) { errors.push(error); }
        }
        this.startedLevels.clear();
        while (this.cleanups.length) {
            try { await this.cleanups.pop()(); } catch (error) { errors.push(error); }
        }
        try { this.context.assets.Dispose(); } catch (error) { errors.push(error); }
        this.context.services.clear();
        this.events.clear();
        return errors;
    }
}

export function createGame(options) { return new Game(options); }
