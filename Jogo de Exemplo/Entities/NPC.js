import { Draw } from "../../Scripts/Drawing/Draw.js";
import { GameObject } from "../../Scripts/Root/GameObject.js";
import { Vector2D } from "../../Scripts/Math/Vector2D.js";
import { Sprite } from "../../Scripts/Drawing/Sprite.js";

export class NPC extends GameObject {
    constructor(screen) {
        super();
        this.draw = new Draw(screen);
        this.position = new Vector2D(256, 64);
        this.size = new Vector2D(64, 64);

        // Configuração sprite
        this.spritefileName = "../../Assets/Ruby.png";
        this.sprite = new Sprite(screen, this.spritefileName);
        this.sprite.size = this.size;
        this.sprite.position = this.position;
        this.sprite.frameCount = 2;
        this.sprite.updatesPerFrame = 7;
    }

    DrawnSelf(deltaTime) {
        // this.draw.Color = `blue`;
        // this.draw.DrawRect(this.position.GetValue().x, this.position.GetValue().y, this.size.GetValue().x, this.size.GetValue().x);
        
        this.sprite.Animation(this.spritefileName, this.position, "horizontal", 0);
    }
}