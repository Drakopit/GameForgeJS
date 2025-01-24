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
        this.index = this.levels.length - 1;
    },

    getCurrent(index) {
        if (!this.current) {
            this.current = this.levels[0];
        } else {
            this.current = this.levels[index];
        }
        return this.current;
    }
};

// Time
let startTime;
let lastTime = performance.now();
let deltaTime = 0;

// FPS Calculation
let frameCount = 0;
let fps = 0;
let fpsTime = 0;

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
            LevelHandler.current = LevelHandler.getCurrent(0);
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

        // Update FPS calculation
        frameCount++;
        fpsTime += deltaTime;
        if (fpsTime >= 1.0) {
            fps = frameCount / fpsTime;
            frameCount = 0;
            fpsTime = 0;
        }

        // Check if there is a new level to load
        if (LevelHandler.current.Next) {
            this.RemoveLevel(LevelHandler.current.TelaId);

            // Increment the index before fetching the next level
            let index = LevelHandler.levels.findIndex(level => level.TelaId === LevelHandler.current.TelaId) + 1;
            LevelHandler.current = LevelHandler.getCurrent(index);
            
            // Ensure index is within bounds
            if (LevelHandler.index >= LevelHandler.levels.length) {
                LevelHandler.index = 0; // Loop back to the first level or handle it as needed
                LevelHandler.current = LevelHandler.getCurrent(LevelHandler.index);
            }

            LevelHandler.current.OnStart();
            LevelHandler.current.Next = false; // Reset the Next flag
        }

        // Update the current level
        if (LevelHandler.current) {
            LevelHandler.current.FPS = fps.toFixed(2);
            LevelHandler.current.OnUpdate();
            LevelHandler.current.OnFixedUpdate(deltaTime);
            LevelHandler.current.OnDrawn();
            LevelHandler.current.OnGUI();
        }

        // Call engine's draw method
        this.OnDrawn();

        lastTime = startTime;
        window.requestAnimationFrame(this.OnFixedUpdate.bind(this));
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
