/**
 * @doc Class Input
 * @namespace Input
 * @class Input
 * @author Patrick Faustino Camello
 * @summary Manages keyboard input for the game framework.
 * @Date 26/07/2024
 * @example
 * import { Input } from "./Input.js";
 * if (Input.GetKey("ArrowUp")) {
 *     // Execute some action
 * }
 * @returns {Object}
 */
export class Input {
    constructor() {
        this.keys = {}; // To store the state of keys
        this.keysDown = {}; // To store the state of keys pressed
        this.keysUp = {}; // To store the state of keys released
        
        // Bind methods to the context of this instance
        this.keyDownHandler = this.keyDownHandler.bind(this);
        this.keyUpHandler = this.keyUpHandler.bind(this);

        // Add event listeners
        window.addEventListener('keydown', this.keyDownHandler);
        window.addEventListener('keyup', this.keyUpHandler);

        // Singleton instance
        if (!Input.instance) {
            Input.instance = this;
        }
        return Input.instance;
    }

    keyDownHandler(event) {
        if (!this.keys[event.code]) {
            this.keysDown[event.code] = true;
        }
        this.keys[event.code] = true;
    }

    keyUpHandler(event) {
        this.keys[event.code] = false;
        this.keysUp[event.code] = true;
    }

    /**
     * @doc Method
     * @description Check if a key is currently pressed
     * @param {string} key - The key code (e.g., "ArrowUp", "KeyA")
     * @returns {boolean} - True if the key is pressed, false otherwise
     * @example
     * if (Input.GetKey("ArrowUp")) { // Check if the "ArrowUp" key is pressed
     *     // Do something
     * }
     */
    static GetKey(key) {
        return Input.instance.keys[key] === true;
    }

    /**
     * @doc Method
     * @description Check if a key was pressed in the current frame
     * @param {string} key - The key code (e.g., "ArrowUp", "KeyA")
     * @returns {boolean} - True if the key was pressed in the current frame, false otherwise
     * @example
     * if (Input.GetKeyDown("ArrowUp")) { // Check if the "ArrowUp" key was pressed in the current frame
     *     // Do something
     * }
     */
    static GetKeyDown(key) {
        const result = Input.instance.keysDown[key] === true;
        // Clear the keyDown state after reading
        if (result) {
            delete Input.instance.keysDown[key];
        }
        return result;
    }

    /**
     * @doc Method
     * @description Check if a key was released in the current frame
     * @param {string} key - The key code (e.g., "ArrowUp", "KeyA")
     * @returns {boolean} - True if the key was released in the current frame, false otherwise
     * @example
     * if (Input.GetKeyUp("ArrowUp")) { // Check if the "ArrowUp" key was released in the current frame
     *     // Do something
     * }
     */
    static GetKeyUp(key) {
        const result = Input.instance.keysUp[key] === true;
        // Clear the keyUp state after reading
        if (result) {
            delete Input.instance.keysUp[key];
        }
        return result;
    }
}

// Initialize the singleton instance
Input.instance = new Input();
