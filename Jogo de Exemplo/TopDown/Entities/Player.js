import { Draw } from "../../../Scripts/Drawing/Draw.js";
import { Input } from "../../../Scripts/Inputs/Input.js";
import { Sprite } from "../../../Scripts/Drawing/Sprite.js";
import { Vector2D } from "../../../Scripts/Math/Vector2D.js";
import { GameObject } from "../../../Scripts/Root/GameObject.js";
import { Collide2D } from "../../../Scripts/Math/Collide2D.js";
import { Game } from "../../../Scripts/Root/Game.js";
import { MathExt } from "../../../Scripts/Math/MathExt.js";

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
        this.position = new Vector2D(128, 64);
        this.previousPosition = this.position;
        this.startPosition = this.position;
        this.size = new Vector2D(64, 64);

        // Mecânica de jogo 
        this.type = "Ally";
                
        // Classes necessárias
        this.draw = new Draw(screen);
        this.input = new Input();
        // Configuração sprite
        this.spritefileName = "../../Assets/Sprites/Esqueleto.png";
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
        this.Hp = 2000;
        this.MaxHp = this.Hp;
        this.Mp = 100;
        this.MaxMp = this.Mp;

		this.danoTeste = 10;

		this.barSize = 300;
		this.maxBar = 4;
		this.currentBar = this.maxBar;
		this.minBar = 1;
		this.colorMap = ['lightgrey', 'red', 'orange', 'green', 'olive', 'lime', 'navy', 'blue', 'aqua', 'purple', 'violet'];

        this.Coin = 0;
    }

    FixedUpdate(deltaTime) {
		if (this.Intersect(Game.FindObject('coin'))) {
            this.Coin += Game.FindObject('coin').Value;
            // Deletar moeda
		}
		this.LimiteHp();
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
        this.ShowVectorDistance();
    }
}

// Movimentação do Player
Player.prototype.Translate = function(deltaTime) {
    let char = new Player(this.screen);

    /* */if (this.input.GetKeyDown("A")) {
        let x = Math.floor(-this.hspeed*deltaTime);
        char.position = new Vector2D(this.position.GetValue().x + x, this.position.GetValue().y);

        if (!char.Intersect(Game.FindObject('npc')))
            this.position = this.position.AddValue(new Vector2D(x,0));

        this.row = DIRECOES.ESQUERDA;
    } else if (this.input.GetKeyDown("D")) {
        let x = Math.floor(this.hspeed*deltaTime);
        char.position = new Vector2D(this.position.GetValue().x + x, this.position.GetValue().y);
        
        if (!char.Intersect(Game.FindObject('npc')))
            this.position = this.position.AddValue(new Vector2D(x,0));

        this.row = DIRECOES.DIREITA;
    } else if (this.input.GetKeyDown("W")) {
        let y = Math.floor(-this.vspeed*deltaTime);
        char.position = new Vector2D(this.position.GetValue().x, this.position.GetValue().y + y);
        
        if (!char.Intersect(Game.FindObject('npc')))
            this.position = this.position.AddValue(new Vector2D(0,y));

        this.row = DIRECOES.CIMA;
    } else if (this.input.GetKeyDown("S")) {
        let y = Math.floor(this.vspeed*deltaTime);
        char.position = new Vector2D(this.position.GetValue().x, this.position.GetValue().y + y);
        
        if (!char.Intersect(Game.FindObject('npc')))
            this.position = this.position.AddValue(new Vector2D(0,y));

        this.row = DIRECOES.BAIXO;
    }

    if (this.input.GetKeyDown("Space")) {
		if (this.Hp >= this.danoTeste) {
			this.Hp -= this.danoTeste;
		}
    }
};

Player.prototype.Distance = function(position) {
    return MathExt.Module(MathExt.Distance(this, position) - this.size.GetValue().x);
}

Player.prototype.VectorDistance = function(other) {
    let v = MathExt.DistanceVector(this, other);
    let x = MathExt.Module(v.GetValue().x - this.size.GetValue().x);
    let y = MathExt.Module(v.GetValue().y - this.size.GetValue().y);
    return new Vector2D(x, y);
}

Player.prototype.Intersect = function(other) {
    if (other != undefined && Collide2D.isCollidingAABB(this, other)) return true;
    else return false;
};

Player.prototype.LimiteHp = function() {
    if (this.Hp < 0)
        this.Hp = 0;
}

Player.prototype.ShowDistance = function() {
    this.draw.DrawText(`Distância: ${JSON.stringify(this.Distance(Game.FindObject('npc')))}`, 250, 10);
}

Player.prototype.ShowVectorDistance = function() {
    this.draw.DrawText(`Distância Vetorial: ${JSON.stringify(this.VectorDistance(Game.FindObject('npc')))}`, 350, 30);
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

	if (this.Hp < ((this.currentBar-1)/this.maxBar)*this.MaxHp) {
		if (this.currentBar > this.minBar) {
			this.currentBar--;
			console.log(`Barra Atual: ${this.currentBar}`);
		}
	}

	// Hp
	let x = 10, y = 20, h = 15; 
	let value = (this.Hp - ((this.currentBar-1)/this.maxBar)*this.MaxHp)/(this.MaxHp/this.maxBar);
		
	this.draw.Color = this.colorMap[this.currentBar-1];
	this.draw.DrawRect(x, y, this.barSize, h);
	
	this.draw.Color = this.colorMap[this.currentBar];;
	this.draw.DrawRect(x, y, value*this.barSize, h);
	// Valor
	this.HpText(this.barSize/2,30,Math.ceil(value*(this.MaxHp/this.maxBar)),Math.ceil(this.MaxHp/this.maxBar));

    
    // Mp Label
    this.draw.Color = "white";
    this.draw.DrawText('Pontos de Mana', 10, 50);

    // Mp
	this.MpBar(10,58,100,16,(this.Mp/this.MaxMp));
	
	// Valor
    this.MpText(50,70,this.Mp,this.MaxMp);
    
    // Dinheiro
    this.draw.DrawText(`Gold: ${this.Coin}`, 400, 10);
}

Player.prototype.HpBar = function(x, y, w, h, value) {
	this.draw.Color = "lightgray";
	this.draw.DrawRect(x, y, w, h);
	this.draw.Color = "Red";
	this.draw.DrawRect(x, y, value*w, h);
}

Player.prototype.HpText = function(x, y, hp, MaxHp) {
    this.draw.SetTextAlign('center');
    this.draw.Color = "whitesmoke";
    this.draw.DrawText(`${hp}/${MaxHp}`, x, y)
    this.draw.SetTextAlign('start')
}

Player.prototype.MpBar = function(x, y, w, h, value) {
    this.draw.Color = "lightgray";
    this.draw.DrawRect(x, y, w, h);
    this.draw.Color = "aqua";
    this.draw.DrawRect(x, y, value*w, h);
}

Player.prototype.MpText = function(x, y, mp, MaxMp) {
    this.draw.SetTextAlign('center')
    this.draw.Color = "whitesmoke";
    this.draw.DrawText(`${mp}/${MaxMp}`, x, y);
    this.draw.SetTextAlign('start')
}