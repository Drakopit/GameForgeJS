import { Sprite } from "../Scripts/Drawing/Sprite.js"
import { Screen } from "../Scripts/Window/Screen.js"
import { Base } from "../Scripts/Base.js"
import { Vector2D } from "../Scripts/Math/Vector2D.js";
import { Scene } from "../Scripts/Root/Scene.js"

var screen = new Screen("PrimeiraFase", 800, 600);
screen.Init("Fase01");
var scene = new Scene("PrimeiraFase", screen);
scene.Load2D("Fase_01");
var jogador = new Player("sprite.png");

class Player {
    constructor(fileName) {
        this.x, this.y, this.z, this.deth = 0;
        this.position = new Vector2D(this.x, this.y);
        this.sprite = new Sprite(fileName);
    }

    Start() {
        this.deltaTime; this.lastTime;
        this.requestAnimationFrame = Base.prototype.getRefreshScreen();
    }

    Update() {
    }

    FixedUpdate() {
        this.deltaTime = Base.prototype.getDeltaTime();
        /** **/if (this.input.GetKeyDown(this.input.KeyCode["A"])) {
            this.position.AddValue(new Vector2D(-40*this.deltaTime,0));
            // console.log(`Tecla: ${this.input.KeyCode["A"]}`);
            // console.log("Esquerda");
        } else if (this.input.GetKeyDown(this.input.KeyCode["D"])) {
            this.position.AddValue(new Vector2D(40*this.deltaTime,0));
            // console.log(`Tecla: ${this.input.KeyCode["D"]}`);
            // console.log("Direita");
        } else if (this.input.GetKeyDown(this.input.KeyCode["W"])) {
            this.position.AddValue(new Vector2D(0,-40*this.deltaTime));
            // console.log(`Tecla: ${this.input.KeyCode["W"]}`);
            // console.log("Cima");
        } else if (this.input.GetKeyDown(this.input.KeyCode["S"])) {
            this.position.AddValue(new Vector2D(0,40*this.deltaTime));
            // console.log(`Tecla: ${this.input.KeyCode["S"]}`);
            // console.log("Baixo");
        }
        Base.FixedUpdate(this.FixedUpdate());
        this.lastTime = Date.now();
    }

    DrawSelf() {
        Base.DrawSelf(this.DrawSelf());
    }

    OnGUI() {
        Base.OnGUI(this.OnGUI());
    }
}

export class myGame {
    constructor() {
    }

    Start() {

    }
}