import { Base } from "../Base.js";

// Elementos do meu jogo
import { myGame } from "../../Jogo de Exemplo/myGame.js";

export class Game extends Base {
    constructor() {
        this.input = new Input();
        const FPS = 1000/60;
        const FPSTest = 1000;
    }

    Awake() {
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
        super.Start();
    }

    static Update() {
        this.myGame.Update();
        super.Update(this.Update());
    }

    static FixedUpdate() {
        this.myGame.FixedUpdate();
        super.FixedUpdate(this.FixedUpdate());
    }

    static DrawSelf() {
        this.myGame.DrawSelf();
        super.DrawSelf();
    }

    static OnGUI() {
        this.myGame.OnGUI();
        super.OnGUI(this.OnGUI());
    }
}