import { GameObject } from "../Root/GameObject.js";
import { Vector2D } from "../Math/Vector2D.js";
import { Animator } from "../Graphic/Animator.js";
import { AssetManager } from "../Root/AssetManager.js";
import { Draw } from "../Graphic/Draw.js";
import { EnemyIdleState, EnemyHitState } from "./States/EnemyState.js";

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
        
        this.sprite.sprite = imgIdle;
        this.animator = new Animator(this.sprite);
        this.animator.AddAnimation("Idle", imgIdle, 0, 6, 10);
        this.animator.AddAnimation("Run", AssetManager.instance.GetImage("enemy_run") || imgIdle, 0, 8, 8);
        this.animator.AddAnimation("Hit", AssetManager.instance.GetImage("enemy_hit") || imgIdle, 0, 5, 5);

        this.facingRight = false;

        // INICIA A MÁQUINA DE ESTADOS DA IA
        this.currentState = null;
        this.ChangeState(new EnemyIdleState(this));
    }

    ChangeState(newState) {
        if (this.currentState) this.currentState.Exit();
        this.currentState = newState;
        this.currentState.Enter();
    }

    TakeDamage(dir) {
        if (!this.active || this.isTakingDamage) return;
        this.vy = -350; 
        this.knockbackSpeed = 400 * dir; 
        
        // Força a entrada no estado de dano!
        this.ChangeState(new EnemyHitState(this));
    }

    OnUpdate(dt) {
        if (!this.active) return; 
        const delta = dt || 0.016;

        this.vy += this.gravity * delta;
        this.position.y += this.vy * delta;

        // A IA toma as decisões de movimento aqui!
        if (this.currentState) {
            this.currentState.Update(delta);
        }

        this.sprite.Update();
    }

    OnDrawn() {
        if (!this.active) return;
        
        // Offset de centralização igual ao do Player!
        let frameW = this.sprite.size.x || 32; 
        let frameH = this.sprite.size.y || 32; 
        let renderPos = new Vector2D(
            this.position.x + (this.size.x - frameW) / 2,
            this.position.y + this.size.y - frameH
        );

        // Se estiver sofrendo dano, pinta de vermelho piscando!
        if (this.isTakingDamage) {
            // Um truque nativo de Canvas para "pintar" a sprite
            this.sprite.screen.Context.globalCompositeOperation = "source-atop";
            this.draw.Color = "rgba(255, 0, 0, 0.5)";
            this.draw.DrawRect(renderPos.x, renderPos.y, frameW, frameH);
            this.sprite.screen.Context.globalCompositeOperation = "source-over";
        }

        this.sprite.Animation(this.sprite.sprite.src, renderPos, "horizontal", this.sprite.row, this.facingRight);
    }
}