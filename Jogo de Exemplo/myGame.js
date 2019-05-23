import { Sprite } from "../Scripts/Drawing/Sprite.js";
import { Screen } from "../Scripts/Window/Screen.js";
import { Vector2D } from "../Scripts/Math/Vector2D.js";
import { Scene } from "../Scripts/Root/Scene.js";
import { Draw } from "../Scripts/Drawing/Draw.js";
import { Input } from "../Scripts/Inputs/Input.js";

export class Player {
    constructor(fileName, screen) {
        this.x = 200, this.y = 200, this.z, this.deth = 0;
        this.count = 0;
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
        this.draw.Color = "Red";
        this.draw.DrawRect(200, 50, 32, 32);
    }

    OnGUI() {        
        this.count++;
        this.draw.Color = "purple";
        this.draw.Font = "Arial";
        this.draw.FontSize = "12px";
        this.draw.DrawText("Porra, que merda é essa?", 100, 100);
        this.draw.DrawText("Olá Mundo!", 300, 100);
        this.draw.DrawText(`Coordenadas do Player: ${this.position.GetValue().x}, ${this.position.GetValue().y}  Count: ${this.count}`, 10, 10);
    }
}

export class myGame {
    constructor() {
        this.screen = new Screen("PrimeiraFase", 640, 480);
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
        this.screen.Context.clearRect(0, 0, this.screen.Width, this.screen.Height);
        this.jogador.OnGUI(dt);
    }
}