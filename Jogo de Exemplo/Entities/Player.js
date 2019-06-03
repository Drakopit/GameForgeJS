"use strict"
import { Draw } from "../../Scripts/Drawing/Draw.js";
import { Input } from "../../Scripts/Inputs/Input.js";
import { Sprite } from "../../Scripts/Drawing/Sprite.js";
import { Vector2D } from "../../Scripts/Math/Vector2D.js";
import { GameObject } from "../../Scripts/Root/GameObject.js";

export class Player extends GameObject {
    constructor(screen) {
        super();
        this.id;
        this.hspeed = 64;
        this.vspeed = 64;
        this.solid = true;
        this.position = new Vector2D(64, 64);
        this.previousPosition = this.position;
        this.startPosition = this.position;
        this.size = new Vector2D(32, 32);
        this.direction;
        this.friction;
        this.gravity;
        this.gravityDirection;
        this.deth;
        this.danping = 0.3;
        this.mass;

        // Mecânica de jogo 
        this.ObjectType = "Entity";
        this.name = "Drako";
        this.type = "Ally";
                
        // Classes necessárias
        this.draw = new Draw(screen);
        this.input = new Input();
        // Configuração sprite
        this.spritefileName = "../../Assets/Esqueleto.png";
        this.sprite = new Sprite(screen, this.spritefileName);
        this.sprite.size = new Vector2D(64, 64);
        this.sprite.position = this.position;
        this.sprite.frameCount = 7;
        this.sprite.updatesPerFrame = 3;

        this.row = 2;

        this.updateFPS = 0;
        this.updateFPSPerFrame = 10;
        this.FPS = 60;
    }

    Start() {}

    Update() {}

    FixedUpdate(deltaTime) {
        this.Translate(deltaTime);
    }

    DrawSelf(deltaTime) {
        this.draw.Color = "Blue";
        // this.draw.DrawRect(this.position.GetValue().x, this.position.GetValue().y, 32, 32);
        
         /** **/this.TranslateAnimation();
    }

    OnGUI(deltaTime) {
        this.draw.Color = "black";
        this.draw.Font = "Arial";
        this.draw.FontSize = "12px";
        this.draw.DrawText(`${this.name}`, this.position.x + 16, this.position.y + this.size.GetValue().y - 16);
		
		if (this.updateFPS > this.updateFPSPerFrame) {
            this.updateFPS = 0;
			this.FPS = Math.floor(1 / deltaTime);
		}
        this.updateFPS++;
        this.draw.DrawText(`FPS: ${this.FPS}`, 500, 10);
    }
}

// Movimentação do Player
Player.prototype.Translate = function(deltaTime) {
    /* */if (this.input.GetKeyDown("A"))
        this.position = this.position.AddValue(new Vector2D(-this.hspeed*deltaTime,0));            
    else if (this.input.GetKeyDown("D"))
        this.position = this.position.AddValue(new Vector2D(this.hspeed*deltaTime,0));
    else if (this.input.GetKeyDown("W"))
        this.position = this.position.AddValue(new Vector2D(0,-this.vspeed*deltaTime));
    else if (this.input.GetKeyDown("S"))
        this.position = this.position.AddValue(new Vector2D(0,this.vspeed*deltaTime));
}

// Animação de movimentação do Player
Player.prototype.TranslateAnimation = function() {
    /* */if (this.input.GetKeyDown("A")) this.row = 1;
    else if (this.input.GetKeyDown("D")) this.row = 3;
    else if (this.input.GetKeyDown("W")) this.row = 0;
    else if (this.input.GetKeyDown("S")) this.row = 2;
    this.sprite.Animation(this.spritefileName, this.position, "horizontal", this.row);
}

