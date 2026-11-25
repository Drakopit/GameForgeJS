/**
 * @doc Class Engine
 * @namespace Root
 * @class Engine
 * @author Patrick Faustino Camello
 * @summary This class represents the main engine of the framework, responsible for running the entire game/application.
 * @description Manages game levels, updates, and rendering.
 * @Date 15/05/2019
 * @returns {void}
 */

import { Base } from "./Base.js";
import { Level } from "./Level/Level.js"
import { EventEmitter } from "./EventEmitter.js";
import { FrameStats } from "./Debug/FrameStats.js";
import { StatsOverlay } from "./Debug/StatsOverlay.js";
import { SceneManager } from "./Scene/SceneManager.js";

/**
 * Ordered level registry and current-level cursor used by `Engine`.
 * @type {Object}
 */
export const LevelHandler = {
    levels: [],
    current: null,
    index: 0,

    /**
     * @doc Method
     * @description Adds a new level to the level handler.
     * @param {import("./Level/Level.js").Level} level - The level to add.
     * @example
     *  LevelHandler.addLevel(new Level());
     * @returns {void}
     */
    addLevel(level) {
        this.levels.push(level);
        if (this.levels.length === 1) {
            this.index = 0;
        }
    },

    getCurrent(index = this.index) {
        this.current = this.levels[index] ?? null;
        return this.current;
    }
};

// Substitua as variáveis de tempo globais por estas:
let lastTime = performance.now();
let accumulator = 0;
const TIME_STEP = 1 / 60; // 60 atualizações de física por segundo (0.0166s cravados)

// FPS Calculation
let frameCount = 0;
let fps = 0;
let fpsTime = 0;

import { Config } from "./Config.js";
/**
 * Reads whether collision and hitbox debugging is enabled in config.
 * @returns {boolean} Current hitbox debug flag.
 */
export const DEBUG = () => Config.data?.debug?.showHitboxes ?? false; // Lê do config.json

/**
 * Main update and render loop orchestrator for the active GameForgeJS level.
 *
 * The engine publishes frame events consumed by systems such as `Input`.
 */
export class Engine extends Base {
    constructor() {
        super();
    }

    static events = new EventEmitter();
    static timeScale = 1;
    static hitStopRemaining = 0;
    static running = false;
    static initialized = false;
    static frameId = null;
    static cleanups = [];
    static startedLevels = new Set();
    static context = null;
    /** Scene switching (`context.scenes`): load registered levels by name or index. */
    static scenes = new SceneManager({
        levels: () => LevelHandler.levels,
        getIndex: () => LevelHandler.index,
        setIndex: index => {
            LevelHandler.index = index;
            LevelHandler.current = LevelHandler.getCurrent(index);
            if (LevelHandler.current) LevelHandler.current.LEVEL_HANDLER = LevelHandler;
        },
        enter: level => {
            Engine.startedLevels.add(level);
            level.context = Engine.context;
            level.OnStart?.(Engine.context);
        },
    });

    static HitStop(duration = 0.06) {
        this.hitStopRemaining = Math.max(this.hitStopRemaining, Math.max(0, duration));
    }

    static IsHitStopped() {
        return this.hitStopRemaining > 0;
    }

    /**
     * @doc Method
     * @description Initializes the engine, loads the first level, and starts the game loop.
     * @example
     *  Engine.OnStart();
     * @returns {void}
     */
    static OnStart() {
        if (this.running) return;
        if (this.initialized) {
            this.running = true;
            lastTime = performance.now();
            accumulator = 0;
            this.frameId = window.requestAnimationFrame(this.GameLoop.bind(this));
            return;
        }
        // The first level, or the scene loaded before start (context.scenes.Load).
        const first = this.scenes.pending;
        this.scenes.pending = null;
        LevelHandler.index = first?.index ?? 0;
        LevelHandler.current = LevelHandler.getCurrent(LevelHandler.index);
        if (LevelHandler.current && first) LevelHandler.current.sceneParams = this.scenes.params = first.params;
        if (!LevelHandler.current) {
            throw new Error("Engine.OnStart requires at least one level.");
        }

        // Configura o handler
        LevelHandler.current.LEVEL_HANDLER = LevelHandler;
        if (typeof document !== "undefined" && this.context?.config?.debug?.statsKey !== false) {
            this.statsCleanup ??= StatsOverlay.Install({ key: this.context?.config?.debug?.statsKey || "F3", visible: this.context?.config?.debug?.stats === true });
        }

        // Inicia o Level (Isso vai chamar o OnStart do Menu)
        this.startedLevels.add(LevelHandler.current);
        LevelHandler.current.context = this.context;
        LevelHandler.current.OnStart(this.context);
        this.initialized = true;
        this.running = true;
        lastTime = performance.now();
        accumulator = 0;

        this.events.emit("EngineStarted");

        // Inicia o Loop passando o timestamp inicial
        this.frameId = window.requestAnimationFrame(this.GameLoop.bind(this));
    }

    static Stop() {
        this.running = false;
        if (this.frameId !== null) (globalThis.cancelAnimationFrame ?? globalThis.window?.cancelAnimationFrame)?.(this.frameId);
        this.frameId = null;
    }

    static async Dispose() {
        this.Stop();
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
        this.statsCleanup?.();
        this.statsCleanup = null;
        LevelHandler.levels = [];
        LevelHandler.current = null;
        LevelHandler.index = 0;
        this.scenes.pending = null;
        this.scenes.params = {};
        this.initialized = false;
        this.context = null;
        this.hitStopRemaining = 0;
        this.timeScale = 1;
        accumulator = frameCount = fps = fpsTime = 0;
        this.events.clear();
        if (errors.length) throw new AggregateError(errors, "Legacy engine cleanup failed.");
    }

    /**
     * @doc Method
     * @description Main game loop, updates the game state and renders the scene.
     * @example
     *  Engine.OnFixedUpdate();
     * @returns {void}
     */
    static GameLoop(currentTime) {
        this.frameId = null;
        if (!this.running) return;
        const stats = FrameStats.global;
        const workStart = stats.enabled ? performance.now() : null;
        let deltaTime = (currentTime - lastTime) / 1000.0;

        if (deltaTime > 0.25) deltaTime = 0.25;

        lastTime = currentTime;

        let gameDeltaTime = deltaTime * this.timeScale;
        if (this.hitStopRemaining > 0) {
            this.hitStopRemaining = Math.max(0, this.hitStopRemaining - deltaTime);
            gameDeltaTime = 0;
        }

        accumulator += gameDeltaTime;

        // Cálculo de FPS
        frameCount++;
        fpsTime += deltaTime;
        if (fpsTime >= 1.0) {
            fps = frameCount / fpsTime;
            frameCount = 0;
            fpsTime = 0;
        }

        // PreUpdate Event
        this.events.emit("PreUpdate", currentTime);


        // Scene switches (context.scenes.Load, level.Next / level.Back): OnExit, then the new OnStart.
        this.scenes.Apply();

        if (LevelHandler.current) {
            LevelHandler.current.FPS = fps.toFixed(2);

            // Chama os métodos da fase com checagem de segurança (Duck Typing seguro)
            if (gameDeltaTime > 0) {
                this.events.emit("update", gameDeltaTime);
                if (typeof LevelHandler.current.OnUpdate === "function") LevelHandler.current.OnUpdate(gameDeltaTime);
            }

            if (gameDeltaTime > 0) {
                while (accumulator >= TIME_STEP) {
                    this.events.emit("fixedUpdate", TIME_STEP);
                    if (typeof LevelHandler.current.OnFixedUpdate === "function")
                        LevelHandler.current.OnFixedUpdate(TIME_STEP);
                    accumulator -= TIME_STEP;
                }
            }

            this.events.emit("draw", gameDeltaTime);
            if (typeof LevelHandler.current.OnDrawn === "function")
                LevelHandler.current.OnDrawn();

            this.events.emit("gui", gameDeltaTime);
            if (typeof LevelHandler.current.OnGUI === "function")
                LevelHandler.current.OnGUI();
        }

        this.OnDrawn();

        this.events.emit("PostUpdate", lastTime);
        if (workStart !== null) {
            stats.Work(performance.now() - workStart);
            if (Array.isArray(LevelHandler.current?.entities)) stats.Observe("entities", LevelHandler.current.entities.length);
        }
        if (this.running) this.frameId = window.requestAnimationFrame(this.GameLoop.bind(this));
    }

    /**
     * @doc Method
     * @description Override this method to implement custom drawing logic.
     * @example
     *  Engine.OnDrawn = function() { // Custom draw logic };
     * @returns {void}
     */
    static OnDrawn() { /* TODO document why this static method 'OnDrawn' is empty */ }

    /**
     * @doc Method
     * @param {string} levelId - The ID of the level to remove.
     * @description Removes the specified level from the DOM.
     * @example
     *  Engine.RemoveLevel("level1");
     * @returns {void}
     */
    static RemoveLevel(levelId) {
        const element = document.getElementById(levelId);
        if (element?.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    /**
     * @doc Method
     * @description Displays the FPS on the screen.
     * @example
     *  Engine.DisplayFPS();
     * @returns {void}
     */
    // static DisplayFPS() {
    //     const fpsElement = document.getElementById('fps');
    //     if (fpsElement) {
    //         fpsElement.innerText = `FPS: ${fps.toFixed(2)}`;
    //     } else {
    //         const newFpsElement = document.createElement('div');
    //         newFpsElement.id = 'fps';
    //         newFpsElement.style.position = 'absolute';
    //         newFpsElement.style.top = '10px';
    //         newFpsElement.style.left = '720px';
    //         newFpsElement.style.color = 'white';
    //         newFpsElement.style.backgroundColor = 'black';
    //         newFpsElement.style.padding = '5px';
    //         newFpsElement.style.zIndex = '1000';
    //         newFpsElement.innerText = `FPS: ${fps.toFixed(2)}`;
    //         document.body.appendChild(newFpsElement);
    //     }
    // }
}
