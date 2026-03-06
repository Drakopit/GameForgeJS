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
import { Level } from "../Template/Level.js"

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

// Substitua as variáveis de tempo globais por estas:
let lastTime = performance.now();
let accumulator = 0;
const TIME_STEP = 1 / 60; // 60 atualizações de física por segundo (0.0166s cravados)

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
        // Pega a primeira fase (que no seu caso é o Menu)
        LevelHandler.current = LevelHandler.getCurrent(0);

        // Configura o handler
        LevelHandler.current.LEVEL_HANDLER = LevelHandler;

        // Inicia o Level (Isso vai chamar o OnStart do Menu)
        LevelHandler.current.OnStart();

        // Inicia o Loop passando o timestamp inicial
        window.requestAnimationFrame(this.GameLoop.bind(this));
    }

    /**
     * @doc Method
     * @description Main game loop, updates the game state and renders the scene.
     * @example
     *  Engine.OnFixedUpdate();
     * @returns {void}
     */
    static GameLoop(currentTime) {
        let deltaTime = (currentTime - lastTime) / 1000.0;

        if (deltaTime > 0.25) deltaTime = 0.25;

        lastTime = currentTime;
        accumulator += deltaTime;

        // Cálculo de FPS
        frameCount++;
        fpsTime += deltaTime;
        if (fpsTime >= 1.0) {
            fps = frameCount / fpsTime;
            frameCount = 0;
            fpsTime = 0;
        }

        // --- LÓGICA DE TRANSIÇÃO DE LEVEL CORRIGIDA ---
        if (LevelHandler.current && (LevelHandler.current.Next || LevelHandler.current.Back)) {

            // 1. A fase atual limpa o seu próprio lixo (Múltiplos canvases, eventos, etc)
            if (typeof LevelHandler.current.OnExit === "function") {
                LevelHandler.current.OnExit();
            }

            // 2. Calcula o novo index baseado na flag
            if (LevelHandler.current.Next) {
                LevelHandler.index++;
                // Se passou da última fase, volta para a primeira (ou pode travar na última, se preferir)
                if (LevelHandler.index >= LevelHandler.levels.length) LevelHandler.index = 0;
            }
            else if (LevelHandler.current.Back) {
                LevelHandler.index--;
                // Se tentou voltar antes da primeira, vai para a última (ou trava no 0)
                if (LevelHandler.index < 0) LevelHandler.index = LevelHandler.levels.length - 1;
            }

            // 3. Reseta as flags da fase velha para não dar loop infinito se voltarmos para ela
            LevelHandler.current.Next = false;
            LevelHandler.current.Back = false;

            // 4. Carrega a nova fase
            LevelHandler.current = LevelHandler.getCurrent(LevelHandler.index);
            LevelHandler.current.LEVEL_HANDLER = LevelHandler;

            // 5. Inicia a nova fase
            if (typeof LevelHandler.current.OnStart === "function") {
                LevelHandler.current.OnStart();
            }
        }

        if (LevelHandler.current) {
            LevelHandler.current.FPS = fps.toFixed(2);

            // Chama os métodos da fase com checagem de segurança (Duck Typing seguro)
            if (typeof LevelHandler.current.OnUpdate === "function")
                LevelHandler.current.OnUpdate(deltaTime);

            while (accumulator >= TIME_STEP) {
                if (typeof LevelHandler.current.OnFixedUpdate === "function")
                    LevelHandler.current.OnFixedUpdate(TIME_STEP);
                accumulator -= TIME_STEP;
            }

            if (typeof LevelHandler.current.OnDrawn === "function")
                LevelHandler.current.OnDrawn();

            if (typeof LevelHandler.current.OnGUI === "function")
                LevelHandler.current.OnGUI();
        }

        this.OnDrawn();

        window.requestAnimationFrame(this.GameLoop.bind(this));
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
