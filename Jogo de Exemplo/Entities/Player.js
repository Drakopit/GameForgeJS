"use strict";
import { Draw } from "../../Scripts/Drawing/Draw.js";
import { Input } from "../../Scripts/Inputs/Input.js";
import { Sprite } from "../../Scripts/Drawing/Sprite.js";
import { Vector2D } from "../../Scripts/Math/Vector2D.js";
import { GameObject } from "../../Scripts/Root/GameObject.js";
import { Collide2D } from "../../Scripts/Math/Collide2D.js";
import { Game } from "../../Scripts/Root/Game.js";
import { MathExt } from "../../Scripts/Math/MathExt.js";

// Constante
const DIRECOES = Object.freeze({
    ESQUERDA: 1,
    DIREITA: 3,
    CIMA: 0,
    BAIXO: 2
});

export class Player extends GameObject {
    constructor(screen) {
        super();
        this.speed = 256;
        this.hspeed = this.speed;
        this.vspeed = this.speed;
        this.position = new Vector2D(192, 64);
        this.previousPosition = this.position;
        this.startPosition = this.position;
        this.size = new Vector2D(64, 64);

        // Mecânica de jogo 
        this.type = "Ally";
                
        // Classes necessárias
        this.draw = new Draw(screen);
        this.input = new Input();
        // Configuração sprite
        this.spritefileName = "../../Assets/Esqueleto.png";
        this.sprite = new Sprite(screen, this.spritefileName);
        this.sprite.size = this.size;
        this.sprite.position = this.position;
        this.sprite.frameCount = 7;
        this.sprite.updatesPerFrame = 3;

        this.row = DIRECOES.BAIXO;

        this.updateFPS = 0;
        this.updateFPSPerFrame = 10;
        this.FPS = 60;

		// Status RPG
        this.Hp = 500;
        this.MaxHp = this.Hp;
        this.Mp = 100;
        this.MaxMp = this.Mp;
    }

    FixedUpdate(deltaTime) {
        // Diminui o Hp do personagem, para mostrar um exemplo de HUD
        if (this.Hp > 0) {
            this.Hp--;
        }

        // if (!this.Intersect(Game.FindObject('npc'))) {
        //     this.Translate(deltaTime);
        // } else {
        //     let v = Math.floor(-this.hspeed*deltaTime);
        //     this.position = this.position.AddValue(new Vector2D(v,0));
        // }
        this.Translate(deltaTime);
    }

    DrawnSelf() {
        // Nick do Personagem
        this.draw.SetTextAlign('center')
        this.draw.DrawText('Drako', this.position.GetValue().x + (this.size.GetValue().x / 2), this.position.GetValue().y + 8);
        this.draw.SetTextAlign('start')

        // Animação
        this.sprite.Animation(this.spritefileName, this.position, "horizontal", this.row);
        
        // Caixa de colisão
        this.draw.Style = 1;
        this.draw.DrawRect(this.position.GetValue().x, this.position.GetValue().y, this.size.GetValue().x, this.size.GetValue().y);
        this.draw.Style = 0;
    }

    OnGUI(deltaTime) {
        this.draw.Style = 0;
        this.draw.Color = "white";

        this.HUD();
        this.ShowFPS(deltaTime);
        this.ShowDistance();
    }
}

// Movimentação do Player
Player.prototype.Translate = function(deltaTime) {
    let Distance = MathExt.DistanceVector(this, Game.FindObject('npc'));
    console.log(`${JSON.stringify(Distance)}`);
    let distX = MathExt.Module(Distance.GetValue().x - this.size.GetValue().x);
    let distY = MathExt.Module(Distance.GetValue().y - this.size.GetValue().y);

    /* */if (this.input.GetKeyDown("A")) {
        let x = Math.floor(-this.hspeed*deltaTime);
        if (distX > MathExt.Module(x)) {
            this.position = this.position.AddValue(new Vector2D(x,0));
        } else {
            this.position = this.position.AddValue(new Vector2D(-distX,0));
        }
        this.row = DIRECOES.ESQUERDA;
    } else if (this.input.GetKeyDown("D")) {
        let x = Math.floor(this.hspeed*deltaTime);
        if (distX > x) {
            this.position = this.position.AddValue(new Vector2D(x,0));
        } else {
            this.position = this.position.AddValue(new Vector2D(distX,0));
        }
        this.row = DIRECOES.DIREITA;
    } else if (this.input.GetKeyDown("W")) {
        let y = Math.floor(-this.vspeed*deltaTime);
        if (distY > MathExt.Module(y)) {
            this.position = this.position.AddValue(new Vector2D(0,y));
        } else {
            this.position = this.position.AddValue(new Vector2D(0,-distY));
        }
        this.row = DIRECOES.CIMA;
    } else if (this.input.GetKeyDown("S")) {
        let y = Math.floor(this.vspeed*deltaTime);
        if (distY > y) {
            this.position = this.position.AddValue(new Vector2D(0,y));
        } else {
            this.position = this.position.AddValue(new Vector2D(0,distY));
        }
        this.row = DIRECOES.BAIXO;
    }
};

Player.prototype.Distance = function(position) {
    return MathExt.Module(MathExt.Distance(this, position) - this.size.GetValue().x);
}

Player.prototype.Intersect = function(other) {
    if (other != undefined && Collide2D.isCollidingAABB(this, other)) return true;
    else return false;
};

Player.prototype.ShowDistance = function() {
    this.draw.DrawText(`Distancia: ${JSON.stringify(this.Distance(Game.FindObject('npc')))}`, 200, 200);
}

Player.prototype.ShowFPS = function(deltaTime) {
    if (this.updateFPS > this.updateFPSPerFrame) {
        this.updateFPS = 0;
        this.FPS = Math.floor(1 / deltaTime);
    }
    this.updateFPS++;

    this.draw.DrawText(`FPS: ${this.FPS}`, 500, 10);
}

Player.prototype.HUD = function() {        
    // Hp Label
    this.draw.DrawText('Pontos de Vida', 10, 12);

    // Hp
    this.draw.Color = "lightgray";
    this.draw.DrawRect(10, 20, 200, 15);
    this.draw.Color = "Red";
    this.draw.DrawRect(10, 20, (this.Hp/this.MaxHp)*200, 15);
    
    // Valor
    this.draw.SetTextAlign('center');
    this.draw.Color = "whitesmoke";
    this.draw.DrawText(`${this.Hp}/${this.MaxHp}`, 100, 30)
    this.draw.SetTextAlign('start')

    // Mp Label
    this.draw.Color = "white";
    this.draw.DrawText('Pontos de Mana', 10, 50);

    // Mp
    this.draw.Color = "lightgray";
    this.draw.DrawRect(10, 58, 100, 15);
    this.draw.Color = "aqua";
    this.draw.DrawRect(10, 58, (this.Mp/this.MaxMp)*100, 15);
    
    // Valor
    this.draw.SetTextAlign('center')
    this.draw.Color = "whitesmoke";
    this.draw.DrawText(`${this.Mp}/${this.MaxMp}`, 50, 70);
    this.draw.SetTextAlign('start')
}