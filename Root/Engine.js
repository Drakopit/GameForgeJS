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
import { Level } from "../Template/Level.js";

// Level Handler
export const LevelHandler = {
    levels: [],
    current: null,
    index: 0,

        /**
     * @doc Method
     * @description Adds a new level to the level handler.
     * @param {Level} level - The level to add.
     * @example
     *  LevelHandler.addLevel(new Level());
     * @returns {void}
     */
    addLevel(level) {
        this.levels.push(level);
        this.current = level;
    }
};

// Time
let startTime;
let lastTime = performance.now();
let deltaTime = 0;

export class Engine extends Base {
    constructor() {
        super();
    }

    /**
     * @doc Method
     * @description Initializes the engine, loads the first level, and starts the game loop.
     * @example
     *  Engine.OnStart();
     * @returns {void}
     */
    static OnStart() {
        window.onload = () => {
            // // Initialize the first level
            // const level = new Level();
            // LevelHandler.levels.push(level);
            // LevelHandler.current = level;

            // Configure the level handler for child objects
            LevelHandler.current.LEVEL_HANDLER = LevelHandler;

            // Start the first level
            LevelHandler.current.OnStart();

            // Start the game loop
            this.OnFixedUpdate();
        };
    }

    /**
     * @doc Method
     * @description Main game loop, updates the game state and renders the scene.
     * @example
     *  Engine.OnFixedUpdate();
     * @returns {void}
     */
    static OnFixedUpdate() {
        startTime = performance.now();
        deltaTime = (startTime - lastTime) / 1000.0; // Correctly calculate delta time in seconds

        // Check if there is a new level to load
        if (LevelHandler.current.Next) {
            this.RemoveLevel(LevelHandler.current.TelaId);

            // Move to the next level
            LevelHandler.index++;
            LevelHandler.current = LevelHandler.levels[LevelHandler.index];
            LevelHandler.current.LEVEL_HANDLER = LevelHandler; // Reassign level handler
            LevelHandler.current.OnStart();
            LevelHandler.current.Next = false;
        }

        // Update the current level
        if (LevelHandler.current) {
            LevelHandler.current.OnUpdate();
            LevelHandler.current.OnFixedUpdate(deltaTime);
            LevelHandler.current.OnDrawn();
            LevelHandler.current.OnGUI();
        }

        // Call engine's draw method
        this.OnDrawn();

		let self = this;
        lastTime = startTime;
        window.requestAnimationFrame(self.OnFixedUpdate.bind(this));
    }

    /**
     * @doc Method
     * @description Override this method to implement custom drawing logic.
     * @example
     *  Engine.OnDrawn = function() { // Custom draw logic };
     * @returns {void}
     */
    static OnDrawn() {}

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
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }
}
