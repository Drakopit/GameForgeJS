import { GameObject } from "../Root/GameObject.js";
import { Vector2D } from "../Math/Vector2D.js";
import { Input } from "../Input/Input.js";
import { AssetManager } from "../Root/AssetManager.js";
import { Animator } from "../Graphic/Animator.js";
import { AudioManager } from "../Root/AudioManager.js";
import { DEBUG } from "../Root/Engine.js";
import { Draw } from "../Graphic/Draw.js";
import { HitBox } from "./Attacks/HitBox.js";

export class Player extends GameObject {
    constructor(screen) {
        super();
        this.name = "Player";
        this.position = new Vector2D(100, 300);
        this.size = new Vector2D(64, 64);
        this.speed = 200;
        this.screen = screen;
        this.draw = new Draw(screen);

        // FÍSICA DE PLATAFORMA
        this.vy = 0;
        this.gravity = 900;
        this.jumpStrength = -450;
        this.isGrounded = false;
        this.isAttacking = false; // <--- NOVA VARIÁVEL AQUI

        var Idle = AssetManager.instance.GetImage("heroi_idle");
        var Run = AssetManager.instance.GetImage("heroi_run");
        var Attack = AssetManager.instance.GetImage("heroi_attack_01");
        // var Jump = AssetManager.instance.GetImage("heroi_jump"); // Puxa do AssetManager

        this.sprite.sprite = Idle;
        // this.sprite.size = new Vector2D(80, 80);
        this.sprite.screen = screen;

        this.animator = new Animator(this.sprite);
        this.animator.AddAnimation("Idle", Idle, 0, 4, 15);
        this.animator.AddAnimation("Run", Run, 0, 8, 5);
        this.animator.AddAnimation("Attack", Attack, 0, 8, 7);
        // this.animator.AddAnimation("Jump", Jump, 0, 1, 10); // Registra a animação! (Ajuste os frames)

        this.facingRight = true;
        this.attackHitBox = new HitBox(this, 20, -5, 40, 40);
    }

    OnUpdate(dt) {
        const delta = dt || 0.016;
        let isMoving = false;

        // Movimento Básico e Direção
        if (Input.GetKey("KeyD") || Input.GetKey("ArrowRight")) {
            this.position.x += this.speed * delta;
            this.facingRight = true;
            isMoving = true;
        }
        if (Input.GetKey("KeyA") || Input.GetKey("ArrowLeft")) {
            this.position.x -= this.speed * delta;
            this.facingRight = false;
            isMoving = true;
        }

        if (Input.GetKeyDown("KeyE") && !this.isAttacking) {
            this.isAttacking = true;
        }

        // --- APLICANDO GRAVIDADE E PULO ---
        this.vy += this.gravity * delta;
        this.position.y += this.vy * delta;

        if ((Input.GetKeyDown("KeyW") || Input.GetKeyDown("ArrowUp")) && this.isGrounded) {
            this.vy = this.jumpStrength;
            this.isGrounded = false;

            let jumpSound = AssetManager.instance.GetAudio("sfx_jump");
            AudioManager.instance.PlaySFX(jumpSound, 0.8); // 80% do volume
        }

        // --- MÁQUINA DE ESTADOS VISUAIS E HITBOX ---
        if (this.isAttacking) {
            this.animator.Play("Attack");

            // MÁGICA DOS JOGOS DE LUTA: Frame Data!
            // Digamos que a sua animação de ataque tenha 8 frames.
            // O golpe só é perigoso entre o frame 3 e o 5.
            if (this.sprite.index >= 3 && this.sprite.index <= 5) {
                this.attackHitBox.active = true;
                this.attackHitBox.Update(); // Atualiza a posição grudada no player
            } else {
                this.attackHitBox.active = false;
            }

            // Fim da animação
            if (this.sprite.index >= this.sprite.frameCount - 1) {
                this.isAttacking = false;
                this.attackHitBox.active = false; // Desliga no fim
            }
        }
        else if (isMoving) {
            this.attackHitBox.active = false; // Garante que desliga
            this.animator.Play("Run");
        }
        else {
            this.attackHitBox.active = false; // Garante que desliga
            this.animator.Play("Idle");
        }

        this.sprite.Update();
    }

    OnDrawn() {
        if (DEBUG) {
            // Desenha o hitbox para debug (caixa física real)
            this.draw.Style = this.draw.TYPES.STROKED;
            this.draw.Color = "#00FF00"; // Verde para ver melhor
            this.draw.DrawRect(this.position.x, this.position.y, this.size.x, this.size.y);
            this.draw.Color = "#FFFFFF"; // Reseta a cor para branco
            this.draw.Style = this.draw.TYPES.FILLED;
        }

        // Vamos desenhar a HitBox de ataque em VERMELHO para você regular os valores!
        if (DEBUG && this.attackHitBox.active) {
            this.draw.Style = this.draw.TYPES.STROKED;
            this.draw.Color = "#FF0000"; // Vermelho = Dano
            this.draw.DrawRect(
                this.attackHitBox.position.x,
                this.attackHitBox.position.y,
                this.attackHitBox.size.x,
                this.attackHitBox.size.y
            );
            this.draw.Style = this.draw.TYPES.FILLED;
        }

        // Envia a direção (facingRight) para o seu método de animação atualizado
        this.sprite.Animation(
            this.sprite.sprite.src,
            this.position,
            "horizontal",
            this.sprite.row,
            this.facingRight
        );
    }
}