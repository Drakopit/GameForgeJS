import { GameObject } from "../Root/GameObject.js";
import { Vector2D } from "../Math/Vector2D.js";
import { Animator } from "../Graphic/Animator.js";
import { AssetManager } from "../Root/AssetManager.js";
import { Draw } from "../Graphic/Draw.js";
import { EnemyIdleState } from "./States/EnemyStates/EnemyIdleState.js";
import { EnemyHitState } from "./States/EnemyStates/EnemyHitState.js";
import { StateMachine } from "./States/StateMachine.js";

export class Enemy extends GameObject {
    constructor(screen, playerRef, startX, startY) {
        super();
        this.name = "Enemy";
        this.position = new Vector2D(startX, startY);
        this.scale = 1; // inimigo normalmente não escala
        this.size = new Vector2D(64 * this.scale, 64 * this.scale); // Hitbox física do inimigo
        this.speed = 100;
        this.active = true;
        this.vy = 0;
        this.gravity = 900;
        this.isGrounded = false;
        this.isTakingDamage = false;
        this.knockbackSpeed = 0;
        this.player = playerRef;

        // CONFIGURANDO O VISUAL (Sprites)
        this.draw = new Draw(screen);
        this.sprite.screen = screen;

        // Substitua pelos frames corretos das suas imagens do inimigo!
        let imgIdle = AssetManager.instance.GetImage("enemy_idle") || AssetManager.instance.GetImage("heroi_idle"); // Fallback temporário
        let imgRun = AssetManager.instance.GetImage("enemy_run") || AssetManager.instance.GetImage("heroi_run"); // Fallback temporário
        let imgHit = AssetManager.instance.GetImage("enemy_hit") || AssetManager.instance.GetImage("heroi_hurt"); // Fallback temporário

        this.sprite.sprite = imgIdle;
        this.animator = new Animator(this.sprite);
        this.animator.AddAnimation("Idle", imgIdle, 0, 6, 10, 0.5, 1, 5);
        this.animator.AddAnimation("Run", imgRun, 0, 8, 8, 0.5, 1, 5);
        this.animator.AddAnimation("Hit", imgHit, 0, 6, 10, 0.5, 1, 5);
        this.animator.AddAnimation("Attack", imgHit, 0, 5, 5, 0.5, 1, 5);

        this.facingRight = false;

        this.stateMachine = new StateMachine(this);
        this.stateMachine.ChangeState(new EnemyIdleState(this));

        // Enemy Status
        this.hp = 30;
        this.maxHP = this.hp;
        this.attack = 10;
        this.defense = 0;
    }

    TakeDamage(dir) {

        if (!this.active) return;

        this.isTakingDamage = true; // FALTAVA

        this.vy = -350;
        this.knockbackSpeed = 400 * dir;

        // Dano
        this.hp -= this.player.attack;

        if (this.hp <= 0) {
            this.Die();
        }

        this.stateMachine.ChangeState(new EnemyHitState(this))
    }

    Die() {
        this.active = false;
    }

    OnUpdate(dt) {
        if (!this.active) return;
        const delta = dt || 0.016;

        this.vy += this.gravity * delta;
        this.position.y += this.vy * delta;

        this.stateMachine.Update(delta);

        this.sprite.Update();
    }

    // --- NOVO MÉTODO PARA A BARRA DE VIDA ---
    _drawHealthBar() {
        let barWidth = 40; // Largura total da barra
        let barHeight = 6; // Altura da barra

        // Centraliza a barra no eixo X da hitbox e coloca 15px acima do topo (eixo Y)
        let barX = this.position.x + (this.size.x / 2) - (barWidth / 2);
        let barY = this.position.y - 15;

        // Calcula a porcentagem de vida (evita números negativos)
        let hpPercent = Math.max(0, this.hp / this.maxHP);

        // 1. Desenha o fundo da barra (parte vazia/escura)
        this.draw.Style = this.draw.TYPES.FILLED;
        this.draw.Color = "#333333";
        this.draw.DrawRect(barX, barY, barWidth, barHeight);

        // 2. Desenha a vida atual (parte vermelha/verde)
        // Muda para amarelo/vermelho se estiver morrendo
        if (hpPercent > 0.5) this.draw.Color = "#00FF00"; // Verde
        else if (hpPercent > 0.25) this.draw.Color = "#FFFF00"; // Amarelo
        else this.draw.Color = "#FF0000"; // Vermelho

        this.draw.DrawRect(barX, barY, barWidth * hpPercent, barHeight);

        // 3. Desenha a borda da barra (contorno)
        this.draw.Style = this.draw.TYPES.STROKED;
        this.draw.Color = "#000000";
        this.draw.DrawRect(barX, barY, barWidth, barHeight);

        // Reseta o estilo para não bugar outros desenhos
        this.draw.Style = this.draw.TYPES.FILLED;
    }

    OnDrawn() {
        if (!this.active) return;

        if (typeof this._debugRect === "function") {
            this._debugRect(this.position.x, this.position.y, this.size.x, this.size.y, "#00FF00");
        }
        
        let anim = this.animator.currentAnimation;

        let frameW = this.sprite.size.x * this.scale;
        let frameH = this.sprite.size.y * this.scale;

        let pivotX = frameW * anim.pivotX;
        let pivotY = frameH * anim.pivotY;

        let drawX = this.position.x + (this.size.x / 2) - pivotX + (22 * (this.facingRight == true ? 1 : -1)); // A expressão "+ (22 * (this.facingRight == true ? 1 : -1))" corrige a falta. todavia, é uma péssima prática.
        let drawY = this.position.y + this.size.y - pivotY + (anim.groundOffset || 0);

        let renderPos = new Vector2D(drawX, drawY);

        // efeito de dano piscando
        if (this.isTakingDamage) {
            this.sprite.screen.Context.globalAlpha = 0.5;
        }

        this.sprite.Animation(
            undefined,
            renderPos,
            "horizontal",
            this.sprite.row,
            this.facingRight,
            this.scale
        );

        this.sprite.screen.Context.globalAlpha = 1;

        // CHAMA A BARRA DE VIDA POR ÚLTIMO PARA FICAR POR CIMA DO SPRITE
        this._drawHealthBar();
    }
}