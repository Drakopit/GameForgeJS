import { World } from "../../Jogo de Exemplo/World.js";

export class Game {
    constructor() {}

    static Awake() {
        // Encontra o requestAnimationFrame correto
        // let findRequestAnimationFrame = (() => {
        //     return window.requestAnimationFrame    || // Padrão
        //         window.webkitRequestAnimationFrame || // Chrome
        //         window.mozRequestAnimationFrame    || // Mozilla
        //         window.oRequestAnimationFrame      ||
        //         window.msRequestAnimationFrame     || // Safari
        //         function(callback) { window.setTimeout(callback, 1000 / 60); }; // Simula FPS 60
        // });
        // this.requestAnimFrame = findRequestAnimationFrame();

        // Carregar meu Jogo
        window.onload = () => {
            this.World = new World();
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
    }

    static Update() {}

    static FixedUpdate(dt) {}

    static Loop() {
        this.startTime = performance.now();
        this.deltaTime = ((this.startTime - this.lastTime) / 1000.0);
        this.Update();
        this.FixedUpdate(this.deltaTime);
        this.DrawSelf(this.deltaTime);
        this.OnGUI(this.deltaTime);

        // Atualiza o Jogo
        this.World.Loop(this.deltaTime);

        this.lastTime = this.startTime;
        // Erro no Callback. Por algum motivo o objeto
        // perde a referência depois de um tempo usando o this.
        // Aparentemente o próprio Javascript se enrola em tanto this.
        // Url com uma explicação (ou quase), sobre isso.
        // https://www.freecodecamp.org/forum/t/issues-with-function-losing-scope/108231
        // O curioso, é o fato de setInterval(Game.Loop.bind(Game), 1000/60);
        // Funcionar.
        let self = this;
        window.requestAnimationFrame(self.Loop.bind(self));
    }

    static DrawSelf(dt) {}

    static OnGUI(dt) {}
}