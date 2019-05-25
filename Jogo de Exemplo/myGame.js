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
        /** **/if (this.input.GetKeyDown("A")) {
            this.position = this.position.AddValue(new Vector2D(-40*deltaTime,0));
        } else if (this.input.GetKeyDown("D")) {
            this.position = this.position.AddValue(new Vector2D(40*deltaTime,0));
        } else if (this.input.GetKeyDown("W")) {
            this.position = this.position.AddValue(new Vector2D(0,-40*deltaTime));
        } else if (this.input.GetKeyDown("S")) {
            this.position = this.position.AddValue(new Vector2D(0,40*deltaTime));
        }
    }

    DrawSelf(deltaTime) {
        this.draw.Color = "Blue";
        this.draw.DrawRect(this.position.GetValue().x, this.position.GetValue().y, 32, 32);
        var red = Math.random() * 255;
        var green = Math.random() * 255;
        var blue = Math.random() * 255;
        this.draw.Color = `rgb(${Math.floor(red)}, ${Math.floor(green)}, ${Math.floor(blue)})`;
        this.draw.DrawRect(200, 50, 32, 32);
    }

    OnGUI(deltaTime) {        
        this.draw.Color = "black";
        this.draw.Font = "Arial";
        this.draw.FontSize = "12px";
        this.draw.DrawText("Drako", this.position.x, this.position.y - 8);
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
        this.screen.Refresh();
        this.jogador.FixedUpdate(dt);
    }

    DrawSelf(dt) {
        this.jogador.DrawSelf(dt);
    }

    OnGUI(dt) {
        this.jogador.OnGUI(dt);
    }
}