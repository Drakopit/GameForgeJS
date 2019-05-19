/**
 * @doc Class Base
 * @namespace Scripts
 * @class Base
 * @author Patrick Faustino Camello
 * @summary That class was made, to compose the EngineHtml5 framework.
 * This class should be inherited, not instinctive.
 * @Date 15/05/2019
 * @returns {Object} Object
 */
export class Base {
    constructor() {}
    
    /**
     * @doc Method
     * @description It's call when class is build
     */
    static Awake() {
        throw "Need be implemented!";
    }

    /**
     * @doc Method
     * @description Firts method call (take off Awake)
     */
    static Start() {
        this.lastTime; this.deltaTime;
        this.requestAnimationFrame = this.prototype.getRefreshScreen();
    }

    /**
     * @doc Method
     * @param {functionToUpdate} callBack
     * @description Method called every frame
     */
    static Update(callBack) {
        requestAnimationFrame(() => callBack);
    }

    /**
     * @doc Method
     * @param {dt} deltaTime 
     * @description Method called each second
     */
    static FixedUpdate(callBack) {
        this.deltaTime = this.prototype.getDeltaTime(lastTime);
        requestAnimationFrame(() => callBack)
        this.lastTime = Date.now();
    }

    /**
     * @doc Method
     * @description Method called to draw the char, his draws 
     */
    static DrawSelf(callBack) {
        this.deltaTime = this.prototype.getDeltaTime(lastTime);
        requestAnimationFrame(() => callBack)
        this.lastTime = Date.now();
    }

    /**
     * @doc Method
     * @param {deltaTime} deltaTime
     * @description Method called to draw UI
     */
    static OnGUI(callBack) {
        this.deltaTime = this.prototype.getDeltaTime(lastTime);
        requestAnimationFrame(() => callBack)
        this.lastTime = Date.now();
    }
}

Base.prototype.getDeltaTime = () => {
    let startTime = Date.now();
    let lastTime; let deltaTime = (startTime - lastTime) / 1000.0;
    return deltaTime;
}

Base.prototype.getRefreshScreen = () => {
    return (window.requestAnimationFrame // Padrão
    || window.mozRequestAnimationFrame // Mozilla
    || window.webkitRequestAnimationFrame // Chrome
    || window.msRequestAnimationFrame // Safari
    || function(f) {return setTimeout(f, 1000/60)}) // Simula FPS 60
}