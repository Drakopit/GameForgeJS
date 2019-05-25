import { myGame } from "../../Jogo de Exemplo/myGame.js";

export class Game {
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
        // Carregar meu Jogo
        window.onload = () => {
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
        this.startTime;
        this.lastTime;
        this.deltaTime;
        this.myGame.Start();
    }

    static Update() {
        this.myGame.Update();
    }

    static FixedUpdate(dt) {
        this.myGame.FixedUpdate(dt);
    }

    static Loop() {
        this.startTime = Date.now();
        this.deltaTime = ((this.startTime - this.lastTime) / 1000.0);
        this.Update();
        this.FixedUpdate(this.deltaTime);
        this.DrawSelf(this.deltaTime);
        this.OnGUI(this.deltaTime);
        this.lastTime = this.startTime;
        // Erro no Callback. Por algum motivo o objeto
        // perde a referência depois de um tempo usando o this.
        // Aparentemente o próprio Javascript se enrola em tanto this.
        // Url com uma explicação (ou quase), sobre isso.
        // https://www.freecodecamp.org/forum/t/issues-with-function-losing-scope/108231
        // O curioso, é o fato de setInterval(Game.Loop.bind(Game), 1000/60);
        // Funcionar.
        var self = this;
        window.requestAnimationFrame(self.Loop.bind(self));
    }

    static DrawSelf(dt) {
        this.myGame.DrawSelf(dt);
    }

    static OnGUI(dt) {
        this.myGame.OnGUI(dt);
    }
}