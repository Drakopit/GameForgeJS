/**
 * @doc Class Level
 * @namespace Template
 * @class Level
 * @summary This class was made to compose the EngineHtml5 framework.
 * @description Base class for levels.
 * @Date 15/05/2019
 * @example
 *  Is used for inheritance.
 * @returns void
 */

import { Base } from "../Root/Base.js";

export class Level extends Base {
    constructor() {
        super();

        // The level name
        this.caption = "Modelo de Level";

        // If pass to the next level
        this.Next = false;

        // Level ID
        this.TelaId = null;

        // Level Handler
        this.LEVEL_HANDLER = this;

        // Entities within the level
        this.entities = [];
    }

    /**
     * @doc Method
     * @description Called when the level starts.
     * @example
     *  level.OnStart();
     * @returns {void}
     */
    OnStart() {
        // Set the document title to the level's caption
        document.title = this.caption;

        // Initialize entities
        this.entities.forEach(entity => entity.OnStart());
    }

    /**
     * @doc Method
     * @description Called every frame to update the game state.
     * @example
     *  level.OnUpdate();
     * @returns {void}
     */
    OnUpdate() {
        // Update all entities
        this.entities.forEach(entity => entity.OnUpdate());
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
        this.entities.forEach(entity => entity.OnFixedUpdate(deltaTime));
    }

    /**
     * @doc Method
     * @description Called to draw the level.
     * @example
     *  level.OnDraw();
     * @returns {void}
     */
    OnDrawn() {
        // Draw all entities
        this.entities.forEach(entity => entity.OnDrawn());
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
        this.entities.forEach(entity => entity.OnGUI());
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
        this.entities.push(entity);
        if (typeof entity.OnStart === "function") {
            entity.OnStart();
        }
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
        }
    }
}
