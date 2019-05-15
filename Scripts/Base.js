/**
 * @doc Class Base
 * @namespace Scripts
 * @class Base
 * @author Patrick Faustino Camello
 * @summary That class was made, to compose the EngineHtml5 framework.
 * This class should be inherited, not instinctive.
 * @Date 15/05/2019
 * @returns {Object}
 */
class Base {
    constructor() {
        Awake();
    }
    
    /**
     * @doc Method
     * @description It's call when class is build
     * @returns {}
     */
    static Awake() {
        // Cálcula o tempo de Runtime
        this.startTime;
        this.deltaTime = deltaTime || new Date().getTime();
        this.runTime = deltaTime - startTime;

        // Define o método de atualização da tela
        window.requestAnimationFrame = window.requestAnimationFrame // Padrão
        || window.mozRequestAnimationFrame // Mozilla
        || window.webkitRequestAnimationFrame // Chrome
        || window.msRequestAnimationFrame // Safari
        || function(f) {return setTimeout(f, 1000/60)} // Simula FPS 60
    }

    /**
     * @doc Method
     * @description Firts method call (take off Awake)
     * @returns {}
     */
    Start() {}

    /**
     * @doc Method
     * @param {functionToUpdate} callBack
     * @description Method called every frame
     * @returns {} 
     */
    Update(callBack) {
        requestAnimationFrame(() => callBack())
    }

    /**
     * @doc Method
     * @param {functionToUpdateFixed} callBackFixed 
     * @description Method called each second
     * @returns {}
     */
    FixedUpdate(callBackFixed) {
        requestAnimationFrame(() => callBackFixed())
    }

    /**
     * @doc Method
     * @param {canvas} canvas 
     * @param {context} context
     * @description Method called to draw the char, his draws 
     * @returns {}
     */
    DrawSelf(canvas, context) {
        this.canvas = (canvas != undefined) ? canvas : console.log("Canvas não definido! A classe Button precisa ter um canvas.");
        this.context = (context != undefined) ? context : console.log("Contexto não definido! A classe Button precisa ter um contexto.");
    }

    /**
     * @doc Method
     * @description Method called to draw UI
     * @return {}
     */
    OnGUI() {
        this.Update(this.OnGUI());
    }
}