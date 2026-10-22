import { EventEmitter } from "./EventEmitter.js";
import { AssetManager } from "./Assets/AssetManager.js";
import { ResourceManifestLoader } from "./Assets/ResourceManifestLoader.js";
import { Config } from "./Config.js";

/** Validate the complete module graph before running any setup code. */
export function resolveModules(modules = []) {
    const byId = new Map();
    for (const module of modules) {
        if (!module || typeof module.id !== "string" || !module.id || typeof module.setup !== "function") {
            throw new TypeError("A game module needs a non-empty id and setup(context) function.");
        }
        if (byId.has(module.id)) throw new Error(`Duplicate game module: ${module.id}.`);
        if (module.requires !== undefined && !Array.isArray(module.requires)) {
            throw new TypeError(`Module '${module.id}' requires must be an array.`);
        }
        byId.set(module.id, module);
    }
    const ordered = [];
    const visiting = new Set();
    const visited = new Set();
    function visit(id, path = []) {
        if (visiting.has(id)) throw new Error(`Game module dependency cycle: ${[...path, id].join(" -> ")}.`);
        if (visited.has(id)) return;
        const module = byId.get(id);
        if (!module) throw new Error(`Missing game module '${id}' required by '${path.at(-1)}'.`);
        visiting.add(id);
        for (const dependency of module.requires ?? []) visit(dependency, [...path, id]);
        visiting.delete(id);
        visited.add(id);
        ordered.push(module);
    }
    for (const id of byId.keys()) visit(id);
    return ordered;
}

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
        this.tick = timestamp => this.frame(timestamp);
    }

    get currentLevel() { return this.levels[this.currentIndex] ?? null; }

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
            if (this.currentLevel?.Next || this.currentLevel?.Back) {
                const old = this.currentLevel;
                const offset = old.Next ? 1 : -1;
                old.Next = old.Back = false;
                old.OnExit?.();
                this.currentIndex = (this.currentIndex + offset + this.levels.length) % this.levels.length;
                this.enterLevel();
            }
            this.accumulator += gameDt;
            this.events.emit("update", gameDt);
            if (this.state !== "running") return;
            this.currentLevel?.OnUpdate?.(gameDt);
            while (this.accumulator >= this.fixedStep) {
                this.events.emit("fixedUpdate", this.fixedStep);
                this.currentLevel?.OnFixedUpdate?.(this.fixedStep);
                this.accumulator -= this.fixedStep;
            }
            this.currentLevel?.OnDrawn?.();
            this.currentLevel?.OnGUI?.();
            this.events.emit("render", this.accumulator / this.fixedStep);
            this.events.emit("PostUpdate", timestamp);
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
