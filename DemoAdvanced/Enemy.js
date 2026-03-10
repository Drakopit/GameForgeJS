import { GameObject } from "../Root/GameObject.js";
import { Vector2D } from "../Math/Vector2D.js";
import { Animator } from "../Graphic/Animator.js";
import { AssetManager } from "../Root/AssetManager.js";
import { Draw } from "../Graphic/Draw.js";
import { EnemyIdleState } from "./States/EnemyStates/EnemyIdleState.js";
import { EnemyRunState } from "./States/EnemyStates/EnemyRunState.js";
import { EnemyHitState } from "./States/EnemyStates/EnemyHitState.js";
import { StateMachine } from "./States/StateMachine.js";
import { DEBUG } from "../Root/Engine.js";

export class Enemy extends GameObject {
    constructor(screen, playerRef, startX, startY) {
        super();
        this.name = "Enemy";
        this.position = new Vector2D(startX, startY);
        this.size = new Vector2D(32, 32); // Hitbox física do inimigo
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
        this.animator.AddAnimation("Hit", imgHit, 0, 5, 5, 0.5, 1, 5);

        this.facingRight = false;

        // INICIA A MÁQUINA DE ESTADOS DA IA
        // this.currentState = null;
        // this.ChangeState(new EnemyIdleState(this));

        this.stateMachine = new StateMachine(this);
        this.stateMachine.ChangeState(new EnemyIdleState(this));
    }

    TakeDamage(dir) {

        if (!this.active) return;

        this.isTakingDamage = true; // FALTAVA

        this.vy = -350;
        this.knockbackSpeed = 400 * dir;

        this.stateMachine.ChangeState(
            new EnemyHitState(this)
        );
    }

    OnUpdate(dt) {
        if (!this.active) return;
        const delta = dt || 0.016;

        this.vy += this.gravity * delta;
        this.position.y += this.vy * delta;

        this.stateMachine.Update(delta);

        this.sprite.Update();
    }

    OnDrawn() {
        if (!this.active) return;

        if (DEBUG()) {
            this.draw.Style = this.draw.TYPES.STROKED;
            this.draw.Color = "#00FF00";
            this.draw.DrawRect(this.position.x, this.position.y, this.size.x, this.size.y);
            this.draw.Color = "#FFFFFF";
            this.draw.Style = this.draw.TYPES.FILLED;
        }

        let anim = this.animator.currentAnimation;

        let scale = 1; // inimigo normalmente não escala
        let frameW = this.sprite.size.x * scale;
        let frameH = this.sprite.size.y * scale;

        let pivotX = frameW * anim.pivotX;
        let pivotY = frameH * anim.pivotY;

        let drawX = this.position.x + (this.size.x / 2) - pivotX;
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
            scale
        );

        this.sprite.screen.Context.globalAlpha = 1;
    }
}