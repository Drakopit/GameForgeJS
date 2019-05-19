import { Sprite } from "../Scripts/Drawing/Sprite.js";
import { Screen } from "../Scripts/Window/Screen.js";
import { Base } from "../Scripts/Base.js";
import { Vector2D } from "../Scripts/Math/Vector2D.js";
import { Scene } from "../Scripts/Root/Scene.js";
import { Draw } from "../Scripts/Drawing/Draw.js";
import { Input } from "../Scripts/Inputs/Input.js";

export class Player {
    constructor(fileName, screen) {
        this.x, this.y, this.z, this.deth = 0;
        this.position = new Vector2D(this.x, this.y);
        this.sprite = new Sprite(fileName);
        this.sprite.SetScreen(screen);
        this.draw = new Draw(screen);
        this.input = new Input();
        console.log("Base in Player: ", Base);
    }

    Start() {  }

    Update() {  }

    FixedUpdate(deltaTime) {
        console.log(deltaTime);
        /** **/if (this.input.GetKeyDown(this.input.KeyCode["A"])) {
            this.position.AddValue(new Vector2D(-40*this.deltaTime,0));
            console.log(`Tecla: ${this.input.KeyCode["A"]}`);
            console.log("Esquerda");
        } else if (this.input.GetKeyDown(this.input.KeyCode["D"])) {
            this.position.AddValue(new Vector2D(40*this.deltaTime,0));
            console.log(`Tecla: ${this.input.KeyCode["D"]}`);
            console.log("Direita");
        } else if (this.input.GetKeyDown(this.input.KeyCode["W"])) {
            this.position.AddValue(new Vector2D(0,-40*this.deltaTime));
            console.log(`Tecla: ${this.input.KeyCode["W"]}`);
            console.log("Cima");
        } else if (this.input.GetKeyDown(this.input.KeyCode["S"])) {
            this.position.AddValue(new Vector2D(0,40*this.deltaTime));
            console.log(`Tecla: ${this.input.KeyCode["S"]}`);
            console.log("Baixo");
        }
    }

    DrawSelf() {
        this.sprite.DrawSprite(this.position);
    }

    OnGUI() {
        this.draw.Color = "purple";
        this.draw.Font = "Arial";
        this.draw.FontSize = "12px";
        this.draw.DrawText("Funciona!", 10, 10);
    }
}

export class myGame {
    constructor() {
        this.screen = new Screen("PrimeiraFase", 800, 600);
        this.screen.Init("Fase01");
        this.scene = new Scene("PrimeiraFase", this.screen);
        this.scene.CallScene("PrimeiraFase", "Fase_01");
        this.jogador = new Player("sprite.png", this.screen);
        console.log("Tela: ", this.screen);
        console.log("Cena: ", this.scene);
        console.log("Jogador: ", this.jogador);
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