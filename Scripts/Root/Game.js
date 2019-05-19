import { Base } from "../Base.js";

// Elementos do meu jogo
import { myGame } from "../../Jogo de Exemplo/myGame.js";

export class Game {
    constructor() {
        this.input = new Input();
        const FPS = 1000/60;
        const FPSTest = 1000;
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
        }
    }

    static Start() {
        this.myGame.Start();
        Base.Start();
    }

    static Update() {
        this.myGame.Update();
        Base.Update(this.Update());
    }

    static FixedUpdate() {
        this.myGame.FixedUpdate();
        Base.FixedUpdate(this.FixedUpdate());
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