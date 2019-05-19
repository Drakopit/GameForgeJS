import { Sprite } from "../Scripts/Drawing/Sprite.js";
import { Screen } from "../Scripts/Window/Screen.js";
import { Base } from "../Scripts/Base.js";
import { Vector2D } from "../Scripts/Math/Vector2D.js";
import { Scene } from "../Scripts/Root/Scene.js";
import { Draw } from "../Scripts/Drawing/Draw.js";

export class Player {
    constructor(fileName, screen) {
        this.x, this.y, this.z, this.deth = 0;
        this.position = new Vector2D(this.x, this.y);
        this.sprite = new Sprite(fileName);
        this.sprite.SetScreen(screen);
        this.draw = new Draw(screen);
        this.base = new Base();
    }

    Start() {
        this.deltaTime; this.lastTime;
        console.log(this.deltaTime);
        this.requestAnimationFrame = Base.prototype.getRefreshScreen();
    }

    Update() {
        this.base.Update();
    }

    FixedUpdate() {
        this.deltaTime = this.base.prototype.getDeltaTime();
        console.log(this.deltaTime);
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
        this.base.FixedUpdate(this.FixedUpdate());
        this.lastTime = Date.now();
        console.log(this.lastTime);
    }

    DrawSelf() {
        this.sprite.DrawSprite(this.position);
        this.base.DrawSelf(this.DrawSelf());
    }

    OnGUI() {
        this.draw.Color = "purple";
        this.draw.Font = "Arial";
        this.draw.FontSize = "12px";
        this.draw.DrawText("Funciona!", 10, 10);
        this.base.OnGUI(this.OnGUI());
    }
}

export class myGame {
    constructor() {
        this.screen = new Screen("PrimeiraFase", 800, 600);
        this.screen.Init("Fase01");
        this.scene = new Scene("PrimeiraFase", this.screen);
        this.scene.CallScene("PrimeiraFase", "Fase_01");
        this.jogador = new Player("sprite.png", this.screen);
        console.log(`Tela: ${this.screen}`);
        console.log(`Cena: ${this.scene}`);
        console.log(`Jogador: ${this.jogador}`)
    }

    Start() {
        console.log(this.jogador);
        this.jogador.Start();
    }

    Update() {
        this.jogador.Update();
    }

    FixedUpdate() {
        this.jogador.FixedUpdate();
    }

    DrawSelf() {
        this.jogador.DrawSelf();
    }

    OnGUI() {
        this.jogador.OnGUI();
    }
}