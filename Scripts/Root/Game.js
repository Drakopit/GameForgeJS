import { Base } from "../Base.js";

// Elementos do meu jogo
import { myGame } from "../../Jogo de Exemplo/myGame.js";

export class Game extends Base {
    constructor() {
        this.startTime = Date.now();
        this.lastTime = this.startTime;
        this.deltaTime = ((this.startTime - this.lastTime) / 1000);
        // this.requestAnimFrame = (() => {
        //     return window.requestAnimationFrame    || // Padrão
        //         window.webkitRequestAnimationFrame || // Chrome
        //         window.mozRequestAnimationFrame    || // Mozilla
        //         window.oRequestAnimationFrame      ||
        //         window.msRequestAnimationFrame     || // Safari
        //         function(callback) { window.setTimeout(callback, 1000 / 60); }; // Simula FPS 60
        // })();
    }

    static Awake() {
        window.onload = () => {
            // Carregar meu Jogo
            this.myGame = new myGame();
            this.Start();
            this.Update();
            this.FixedUpdate();
            this.DrawSelf();
            this.OnGUI();
            this.Loop();
        }
    }

    static Start() {
        // this.startTime;
        // this.lastTime;
        // this.deltaTime;
        this.myGame.Start();
    }

    static Update() {
        this.myGame.Update();
    }

    static FixedUpdate(dt) {
        console.log("DeltaTime Game: ", dt);
        this.myGame.FixedUpdate(dt);
    }

    static Loop() {
        this.startTime = Date.now();
        this.deltaTime = ((this.startTime - this.lastTime) / 1000.0);
        console.log("Delta Time: ", this.deltaTime);
        this.Update();
        this.FixedUpdate(this.deltaTime);
        this.DrawSelf(this.deltaTime);
        this.OnGUI(this.deltaTime);
        this.lastTime = this.startTime;
        window.requestAnimationFrame(this.Loop);
    }

    static DrawSelf(dt) {
        this.myGame.DrawSelf(dt);
    }

    static OnGUI(dt) {
        this.myGame.OnGUI(dt);
    }
}