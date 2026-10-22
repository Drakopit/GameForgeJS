/**
 * @doc Class Level
 * @namespace Template
 * @class Level
 * @summary This class was made to compose the GameForgeJS framework.
 * @description Base class for levels.
 * @Date 15/05/2019
 * @example
 *  Is used for inheritance.
 * @returns void
 */

import { Base } from "../Base.js";
import { Logger } from "../Logger.js";

/**
 * Base scene lifecycle container updated and drawn by the engine.
 *
 * Extend this class to own a game's entities and canvas screens.
 */
export class Level extends Base {
    constructor() {
        super();
        this.screen = null;

        // The level name
        this.caption = "Modelo de Level";

        // Level ID
        this.TelaId = this.screen ? (this.screen.id || this.screen.ScreenId) : null;

        // FPS
        this.FPS = 0;

        // Level Handler
        this.LEVEL_HANDLER = this;

        // Entities within the level
        this.entities = [];
        this._started = false;
        this._destroyed = false;
        this._exited = true;
        this._startedEntities = new WeakSet();
        this._destroyedEntities = new WeakSet();
        this.context = null;
    }

    /**
     * @doc Method
     * @description Called when the level starts.
     * @example
     *  level.OnStart();
     * @returns {void}
     */
    OnStart(context = this.context) {
        if (this._started) return;
        this._started = true;
        this._destroyed = false;
        this._exited = false;
        this.context = context;
        // Set the document title to the level's caption
        if (globalThis.document) document.title = this.caption;

        // Initialize entities
        this.entities.forEach(entity => {
            this.StartEntity(entity);
        });
    }

    /**
     * @doc Method
     * @description Called every frame to update the game state.
     * @example
     *  level.OnUpdate();
     * @returns {void}
     */
    OnUpdate(deltaTime) {
        // Update all entities
        this.entities.forEach(entity => {
            if (typeof entity.OnUpdate === "function") {
                entity.OnUpdate(deltaTime);
            }
        });
    }

    /**
     * @doc Method
     * @description Called at a fixed rate to update the game state.
     * @param {number} deltaTime - The time elapsed since the last update.
     * @example
     *  level.OnFixedUpdate(deltaTime);
     * @returns {void}
     */
    OnFixedUpdate(deltaTime) {
        // Fixed update for all entities
        this.entities.forEach(entity => {
            if (typeof entity.OnFixedUpdate === "function") {
                entity.OnFixedUpdate(deltaTime);
            }
        });
    }

    /**
     * @doc Method
     * @description Called to draw the level.
     * @example
     *  level.OnDraw();
     * @returns {void}
     */
    OnDrawn() {
        // Limpa a tela automaticamente em qualquer Level que herde desta classe
        if (this.screen) {
            this.screen.Refresh();
        }

        // Draw the GUI for all entities
        this.entities.forEach(entity => {
            if (typeof entity.OnDrawn === "function") {
                entity.OnDrawn();
            }
        });
    }

    /**
     * @doc Method
     * @description Called to draw the GUI.
     * @example
     *  level.OnGUI();
     * @returns {void}
     */
    OnGUI() {
        // Draw the GUI for all entities
        this.entities.forEach(entity => {
            if (typeof entity.OnGUI === "function") {
                entity.OnGUI();
            }
        });
    }

    /**
     * @doc Method
     * @description Get an entity by its name.
     * @param {string} name
     * @example
     * level.GetEntityByName("Player"); 
     * @returns {Object} The entity with the specified name.
     */
    GetEntityByName(name) {
        let entity = this.entities.find((entity) => { return entity.name == name });
        return entity;
    }

    /**
     * @doc Method
     * @description Adds an entity to the level.
     * @param {Object} entity - The entity to add.
     * @example
     *  level.AddEntity(entity);
     * @returns {void}
     */
    AddEntity(entity) {
        if (!entity || this.entities.includes(entity)) return entity;
        this.entities.push(entity);
        entity.level = this;
        entity.context = this.context;
        if (this._started) this.StartEntity(entity);
        return entity;
    }

    StartEntity(entity) {
        if (this._startedEntities.has(entity)) return;
        this._startedEntities.add(entity);
        entity.level = this;
        entity.context = this.context;
        entity.OnStart?.(this.context);
    }

    DestroyEntity(entity) {
        if (this._destroyedEntities.has(entity)) return;
        this._destroyedEntities.add(entity);
        try { entity.OnDestroy?.(); }
        finally { if (entity.level === this) entity.level = null; }
    }

    /**
     * @doc Method
     * @description Removes an entity from the level.
     * @param {Object} entity - The entity to remove.
     * @example
     *  level.RemoveEntity(entity);
     * @returns {void}
     */
    RemoveEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities.splice(index, 1);
            this.DestroyEntity(entity);
        }
    }

    // Adicione este método na sua classe Menu.js e MiniGame3DMenu.js
    OnExit() {
        this._exited = true;
        const errors = [];
        for (const entity of this.entities.splice(0)) {
            try { this.DestroyEntity(entity); } catch (error) { errors.push(error); }
        }
        this._started = false;
        if (this.screen && this.screen.Canvas) {
            this.screen.Canvas.remove();
            Logger.log("info", `[Level] Tela ${this.TelaId} destruída com sucesso.`);
        }
        if (errors.length) throw new AggregateError(errors, "Level entity cleanup failed.");
    }

    OnDestroy() {
        if (this._destroyed) return;
        this._destroyed = true;
        const errors = [];
        for (const entity of this.entities.splice(0)) {
            try { this.DestroyEntity(entity); } catch (error) { errors.push(error); }
        }
        if (!this._exited) {
            try { this.OnExit(); } catch (error) { errors.push(error); }
        }
        this._started = false;
        if (errors.length) throw new AggregateError(errors, "Level cleanup failed.");
    }

    ShowFPS(draw, x, y) {
        // Draw FPS
        draw.Color = "green";
        draw.FontSize = "16px";
        draw.DrawText(`FPS: ${this.FPS}`, x, y);
        draw.FontSize = "12px";
        draw.Color = "white";
    }
}
