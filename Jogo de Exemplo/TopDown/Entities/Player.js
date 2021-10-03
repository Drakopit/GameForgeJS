import { Draw } from "../../../Scripts/Drawing/Draw.js";
import { KeyCode } from "../../../Scripts/Inputs/Input.js";
import { Sprite } from "../../../Scripts/Drawing/Sprite.js";
import { Vector2D } from "../../../Scripts/Math/Vector2D.js";
import { GameObject } from "../../../Scripts/Root/GameObject.js";
import { Collide2D } from "../../../Scripts/Math/Collide2D.js";
import { MathExt } from "../../../Scripts/Math/MathExt.js";
import { KeyResponse } from "../../../Scripts/Inputs/KeyBoard.js";

// Constante de Direções
export const DIRECOES = Object.freeze({
    ESQUERDA: 1,
    DIREITA: 3,
    CIMA: 0,
    BAIXO: 2
});

export class Player extends GameObject {
    constructor(screen) {
        super();

        // Acessa os objetos da fase
        this.parent;

        //#region Configurações do Player
        this.speed = 8;
        this.hspeed = this.speed;
        this.vspeed = this.speed;
        this.position = new Vector2D(128, 64);
        this.previousPosition = this.position;
        this.startPosition = this.position;
        this.size = new Vector2D(64, 64);
        //#endregion

        // Mecânica de jogo 
        this.type = "Ally";
                
        // Classe que permite desenhar na tela
        this.draw = new Draw(screen);

        //#region Configuração sprite
        this.spritefileName = "../../Assets/Sprites/Esqueleto.png";
        this.sprite = new Sprite(screen, this.spritefileName);
        this.sprite.size = this.size;
        this.sprite.position = this.position;
        this.sprite.frameCount = 7;
        this.sprite.updatesPerFrame = 3;
        //#endregion

        // Setando direção da spritesheet
        this.row = DIRECOES.BAIXO;

        //#region Configurações para cálculo do FPS
        this.updateFPS = 0;
        this.updateFPSPerFrame = 10;
        this.FPS = 60;
        //#endregion

		//#region Status RPG
        this.Hp = 2000;
        this.MaxHp = this.Hp;
        this.Mp = 100;
        this.MaxMp = this.Mp;
        
        // Dinheiro
        this.Coin = 0;
        //#endregion

        // DEBUG dano
		this.danoTeste = 10;

        //#region Configuração da Barra de Sangue
		this.barSize = 300;
		this.maxBar = 4;
		this.currentBar = this.maxBar;
		this.minBar = 1;
		this.colorMap = ['lightgrey', 'red', 'orange', 'green', 'olive', 'lime', 'navy', 'blue', 'aqua', 'purple', 'violet'];
        //#endregion
    }

    OnFixedUpdate(deltaTime) {
        // Se bater na moeda
        if (this.Intersect(this.parent["Coin"])) {
            if (this.parent["Coin"]) {
                this.Coin += this.parent["Coin"].Value;
            //    if (this.parent["Entities"]) {
            //        this.parent["Entities"].pop();
            //    }
            }
        }

        // Executa a função que limita o Hp do Player
		this.LimiteHp();
        
        // Executa a função que move o player  
        this.Translate(deltaTime);
    }

    OnDrawn() {
        //#region Nick do Personagem 
        this.draw.SetTextAlign('center');
        this.draw.DrawText('Drako', this.position.GetValue().x + (this.size.GetValue().x / 2), this.position.GetValue().y + 8);
        this.draw.SetTextAlign('start');
        //#endregion

        // Animação
        this.sprite.Animation(this.spritefileName, this.position, "horizontal", this.row);
        
        //#region Caixa de colisão
        this.draw.Style = 1;
        this.draw.DrawRect(this.position.GetValue().x, this.position.GetValue().y, this.size.GetValue().x, this.size.GetValue().y);
        this.draw.Style = 0;
        //#endregion
    }

    OnGUI(deltaTime) {
        //#region Reseta as configurações de drawn
        this.draw.Style = 0;
        this.draw.Color = "white";
        //#endregion

        this.HUD();
        this.ShowFPS(deltaTime);
        this.ShowDistance();
        this.ShowVectorDistance();
    }
}

//#region Mecânica
// Movimentação do Player
Player.prototype.Translate = function(deltaTime) {
    let char = new Player(this.screen);

    /* */if (KeyResponse.getKeyDown == KeyCode["A"]) {
        KeyResponse.getKeyDown = 0;
        // let x = Math.floor(-this.hspeed*deltaTime);
        let x = -this.hspeed;
        char.position = new Vector2D(this.position.GetValue().x + x, this.position.GetValue().y);

        if (!char.Intersect(this.parent["Npc"]))
            this.position = this.position.AddValue(new Vector2D(x, 0));

        this.row = DIRECOES.ESQUERDA;
    } else if (KeyResponse.getKeyDown == KeyCode["D"]) {
        KeyResponse.getKeyDown = 0;
        // let x = Math.floor(this.hspeed*deltaTime);
        let x = this.hspeed;
        char.position = new Vector2D(this.position.GetValue().x + x, this.position.GetValue().y);

        if (!char.Intersect(this.parent["Npc"]))
            this.position = this.position.AddValue(new Vector2D(x, 0));

        this.row = DIRECOES.DIREITA;
    } else if (KeyResponse.getKeyDown == KeyCode["W"]) {
        KeyResponse.getKeyDown = 0;
        // let y = Math.floor(-this.vspeed*deltaTime);
        let y = -this.vspeed
        char.position = new Vector2D(this.position.GetValue().x, this.position.GetValue().y + y);

        if (!char.Intersect(this.parent["Npc"]))
            this.position = this.position.AddValue(new Vector2D(0, y));

        this.row = DIRECOES.CIMA;
    } else if (KeyResponse.getKeyDown == KeyCode["S"]) {
        KeyResponse.getKeyDown = 0;
        // let y = Math.floor(this.vspeed*deltaTime);
        let y = this.vspeed
        char.position = new Vector2D(this.position.GetValue().x, this.position.GetValue().y + y);

        if (!char.Intersect(this.parent["Npc"]))
            this.position = this.position.AddValue(new Vector2D(0, y));

        this.row = DIRECOES.BAIXO;
    }

    if (KeyResponse.getKeyDown == KeyCode["Space"]) {
		KeyResponse.getKeyDown = 0;
        if (this.Hp >= this.danoTeste) {
			this.Hp -= this.danoTeste;
		}
    }
};

// Cálcula a distência entre dois objetos
Player.prototype.Distance = function(position) {
    return MathExt.Module(MathExt.Distance(this, position) - this.size.GetValue().x);
};

// Cálcula a distência vetorial entre dois pontos
Player.prototype.VectorDistance = function(other) {
    let v = MathExt.DistanceVector(this, other);
    let x = MathExt.Module(v.GetValue().x - this.size.GetValue().x);
    let y = MathExt.Module(v.GetValue().y - this.size.GetValue().y);
    return new Vector2D(x, y);
};

// Verifica a interseção de dois objetos
Player.prototype.Intersect = function(other) {
    if (other != undefined && Collide2D.isCollidingAABB(this, other)) return true;
    else return false;
};

// Limita os níveis do Hp 
Player.prototype.LimiteHp = function() {
    if (this.Hp < 0)
        this.Hp = 0;
    else if (this.Hp > this.MaxHp)
        this.Hp = this.MaxHp;
};
//#endregion

//#region Funções do Drawn
// Mostrar a distência entre dois objetos
Player.prototype.ShowDistance = function() {
    this.draw.DrawText(`Distância: ${JSON.stringify(this.Distance(this.parent["Npc"]))}`, 250, 10);
};

// Mostrar a distância vetorial entre dois objetos
Player.prototype.ShowVectorDistance = function() {
    this.draw.DrawText(`Distância Vetorial: ${JSON.stringify(this.VectorDistance(this.parent["Npc"]))}`, 350, 30);
};

// Mostrar o FPS na tela
Player.prototype.ShowFPS = function(deltaTime) {
    if (this.updateFPS > this.updateFPSPerFrame) {
        this.updateFPS = 0;
        this.FPS = Math.floor(1 / deltaTime);
    }
    this.updateFPS++;

    this.draw.DrawText(`FPS: ${this.FPS}`, 500, 10);
};

// Desenha a HUD do jogo
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
	
	this.draw.Color = this.colorMap[this.currentBar];
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
};

// Desenha a barra de Hp
Player.prototype.HpBar = function(x, y, w, h, value) {
	this.draw.Color = "lightgray";
	this.draw.DrawRect(x, y, w, h);
	this.draw.Color = "Red";
	this.draw.DrawRect(x, y, value*w, h);
};

// Desenha o valor do Hp
Player.prototype.HpText = function(x, y, hp, MaxHp) {
    this.draw.SetTextAlign('center');
    this.draw.Color = "whitesmoke";
    this.draw.DrawText(`${hp}/${MaxHp}`, x, y);
    this.draw.SetTextAlign('start');
};

// Desenha a barra de Mp
Player.prototype.MpBar = function(x, y, w, h, value) {
    this.draw.Color = "lightgray";
    this.draw.DrawRect(x, y, w, h);
    this.draw.Color = "aqua";
    this.draw.DrawRect(x, y, value*w, h);
};

// Desenha o valor do Mp
Player.prototype.MpText = function(x, y, mp, MaxMp) {
    this.draw.SetTextAlign('center');
    this.draw.Color = "whitesmoke";
    this.draw.DrawText(`${mp}/${MaxMp}`, x, y);
    this.draw.SetTextAlign('start');
};
//#endregion