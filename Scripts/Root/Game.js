import { World } from "../../Jogo de Exemplo/World.js";
import { Base } from "./Base.js";

export class Game extends Base {
    constructor() {
        super();
    }

    static Awake() {
        // Carregar meu Jogo
        window.onload = () => {
            this.World = new World();
            this.Start();
            this.Loop();
        }
    }

    static Start() {
        this.startTime;
        this.lastTime;
        this.deltaTime;
    }

    static Loop() {
        this.startTime = performance.now();
        this.deltaTime = ((this.startTime - this.lastTime) / 1000.0);

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

    static FindObject(name) {
        if (Game.World[name] !== undefined) {
            return Game.World[name];
        }
    }

    static RecursiveFindProperty(name) {
        var names = Object.getOwnPropertyNames(Game);
    //     while (Object.getOwnPropertyNames(Game)) {
    //         if (typeof Object !== undefined) {

    //         }
    //     }
    //     if (Game.World[name] !== undefined) {
    //         return Game.World[name];
    //     }
    }
}