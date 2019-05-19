import { Base } from "../Base.js";
import { Input } from "../Inputs/Input.js";

// Elementos do meu jogo
import { myGame } from "../../Jogo de Exemplo/myGame.js";

export class Game {
    constructor() {
        this.input = new Input();
        this.deltaTime; this.lastTime;
        const FPS = 1000/60;
        const FPSTest = 1000;
    }

    static Awake() {
        window.onload = () => {
            // Carregar meu Jogo
            this.myGame = new myGame();
            console.log("My Game: ", this.myGame);
            this.Start();
            this.Update();
            this.FixedUpdate();
            this.DrawSelf();
            this.OnGUI();
        }
    }

    static Start() {
        this.myGame.Start();
        Base.Start();
    }

    static Update() {
        this.myGame.Update();
        console.log("Atualizando");
        Base.Update();
    }

    static FixedUpdate() {
        this.deltaTime = Base.prototype.getDeltaTime();
        this.myGame.FixedUpdate(this.deltaTime);
        Base.FixedUpdate(this.FixedUpdate());
        this.lastTime = Date.now();
    }

    static DrawSelf() {
        this.myGame.DrawSelf();
        Base.DrawSelf();
    }

    static OnGUI() {
        this.myGame.OnGUI();
        Base.OnGUI(this.OnGUI());
    }
}