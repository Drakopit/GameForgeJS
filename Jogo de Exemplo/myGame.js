import { Sprite } from "../Scripts/Drawing/Sprite.js";
import { Screen } from "../Scripts/Window/Screen.js";
import { Vector2D } from "../Scripts/Math/Vector2D.js";
import { Scene } from "../Scripts/Root/Scene.js";
import { Draw } from "../Scripts/Drawing/Draw.js";
import { Input } from "../Scripts/Inputs/Input.js";

export class Player {
    constructor(fileName, screen) {
        this.x, this.y, this.z, this.deth = 0;
        this.position = new Vector2D(this.x, this.y);
        // this.sprite = new Sprite(fileName);
        // this.sprite.SetScreen(screen);
        this.draw = new Draw(screen);
        this.input = new Input();
    }

    Start() {  }

    Update() {  }

    FixedUpdate(deltaTime) {
        console.log("DeltaTime Jogador: ", deltaTime);
        /** **/if (this.input.GetKeyDown("A")) {
            this.position.AddValue(new Vector2D(-40*deltaTime,0));
            console.log("Moveu A");
        } else if (this.input.GetKeyDown("D")) {
            this.position.AddValue(new Vector2D(40*deltaTime,0));
            console.log("Moveu D");
        } else if (this.input.GetKeyDown("W")) {
            this.position.AddValue(new Vector2D(0,-40*deltaTime));
            console.log("Moveu W");
        } else if (this.input.GetKeyDown("S")) {
            this.position.AddValue(new Vector2D(0,40*deltaTime));
            console.log("Moveu S");
        }
    }

    DrawSelf() {
        // this.sprite.DrawSprite(this.position);
        // Debug
        this.draw.Color = "Blue";
        this.draw.DrawRect(this.position.GetValue().x, this.position.GetValue().y, 32, 32);
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
        this.screen = new Screen("PrimeiraFase", 1024, 768);
        this.screen.Init("Fase01");
        this.scene = new Scene("PrimeiraFase", this.screen);
        this.scene.CallScene("PrimeiraFase", "Fase_01");
        this.jogador = new Player("sprite.png", this.screen);
    }

    Start() {
        this.jogador.Start();
    }

    Update() {
        this.jogador.Update();
    }

    FixedUpdate(dt) {
        this.jogador.FixedUpdate(dt);
    }

    DrawSelf(dt) {
        this.jogador.DrawSelf(dt);
    }

    OnGUI(dt) {
        this.jogador.OnGUI(dt);
    }
}