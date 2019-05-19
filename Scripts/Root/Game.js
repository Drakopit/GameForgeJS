import { Base } from "../Base.js";
import { Input } from "../Inputs/Input.js";

// Elementos do meu jogo
import { myGame } from "../../Jogo de Exemplo/myGame.js";

export class Game {
    constructor() {
        this.input = new Input();
        this.base = new Base();
        const FPS = 1000/60;
        const FPSTest = 1000;
    }

    static Awake() {
        window.onload = () => {
            // Carregar meu Jogo
            this.myGame = new myGame();
            this.Start;
            this.Update;
            this.FixedUpdate;
            this.DrawSelf;
            this.OnGUI;
        }
    }

    static Start() {
        this.myGame.Start();
        console.log(this.myGame);
        this.base.Start;
    }

    static Update() {
        this.myGame.Update();
        console.log("Atualizando");
        this.base.Update = this.Update();
    }

    static FixedUpdate() {
        this.myGame.FixedUpdate();
        this.base.FixedUpdate = this.FixedUpdate();
    }

    static DrawSelf() {
        this.myGame.DrawSelf();
        this.base.DrawSelf;
    }

    static OnGUI() {
        this.myGame.OnGUI();
        this.base.OnGUI = this.OnGUI();
    }
}