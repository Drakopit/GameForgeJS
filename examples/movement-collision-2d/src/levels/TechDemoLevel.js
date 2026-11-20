import { InputHelpPanel, Draw as ControlGuideDraw } from 'gameforgejs/2d';
import { ActionManager as ControlGuideActions } from 'gameforgejs/core';
import { Level } from "gameforgejs/core";
import { Player } from "../entities/Player.js";
import { Coin } from "../entities/Coin.js";
import { Draw } from "gameforgejs/2d";
import { Collide2D } from "gameforgejs/2d";
import { Screen } from "gameforgejs/2d";

export class TechDemoLevel extends Level {
    constructor() {
        super();
        this.TelaId = "DemoLevel";
        this.caption = "GameForgeJS - Movement & Collision 2D";
        this.score = 0;
    }

    OnStart() {
        super.OnStart(); // Configura título da página e chama OnStart das entidades

        const width = 640;
        const height = 480;
        this.screen = new Screen("gameCanvas", width, height, { config: this.context?.config });
        this.controlsHelp=new InputHelpPanel(new ControlGuideDraw(this.screen),{title:'Controls'}); // Acessa a tela criada pela Engine
        this.draw = new Draw(this.screen);

        // Instancia os objetos
        this.player = new Player(this.screen);
        this.coin = new Coin(this.screen);

        // Adiciona na lista de entidades para a engine atualizá-los e desenhá-los automaticamente
        this.AddEntity(this.player);
        this.AddEntity(this.coin);
    }

    OnUpdate(dt) {
        if(ControlGuideActions.IsActionDown('HELP'))this.controlsHelp?.Toggle();

        super.OnUpdate(dt); // Atualiza todas as entidades filhas

        // Checagem de Colisão (Player x Coin)
        if (Collide2D.isCollidingAABB(this.player, this.coin)) {
            this.score += 10;
            this.coin.Respawn(); // Muda a moeda de lugar
        }
    }

    OnGUI() {
        super.OnGUI(); // Deixa as entidades desenharem suas GUIs (se tiverem)

        // Desenha a Interface (Placar e Instruções)
        this.draw.Color = "#FFFFFF";
        this.draw.Font = "Arial";
        this.draw.FontSize = "24px";
        this.draw.DrawText(`Score: ${this.score}`, 20, 40);

        this.draw.FontSize = "16px";
        this.draw.DrawText(`FPS: ${this.FPS}`, this.screen.width - 110, 30);

        this.draw.FontSize = "14px";
        this.draw.DrawText(`Use W, A, S, D para mover e coletar!`, 20, this.screen.height - 20);

        this.controlsHelp?.OnDrawn();
}

    OnExit() {this.controlsHelp?.Dispose();super.OnExit();}
}