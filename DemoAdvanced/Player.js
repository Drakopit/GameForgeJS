import { GameObject } from "../Root/GameObject.js";
import { Vector2D } from "../Math/Vector2D.js";
import { Input } from "../Input/Input.js";
import { AssetManager } from "../Root/AssetManager.js";
import { Animator } from "../Graphic/Animator.js";
import { AudioManager } from "../Root/AudioManager.js";
import { DEBUG } from "../Root/Engine.js";
import { Draw } from "../Graphic/Draw.js";
import { HitBox } from "./Attacks/HitBox.js";
import { IdleState } from "./States/PlayerState.js";
import { ObjectPool } from "../Root/ObjectPool.js";
import { Bullet } from "./Bullet.js";
import { ActionManager } from "../Input/ActionManager.js";

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
        this.isAttacking = false;

        var Idle = AssetManager.instance.GetImage("heroi_idle");
        var Run = AssetManager.instance.GetImage("heroi_run");
        var Attack = AssetManager.instance.GetImage("heroi_attack_01");
        var JumpStart = AssetManager.instance.GetImage("heroi_jump_start");
        var JumpEnd = AssetManager.instance.GetImage("heroi_jump_end");

        this.sprite.sprite = Idle;
        // this.sprite.size = new Vector2D(80, 80);
        this.sprite.screen = screen;

        this.animator = new Animator(this.sprite);
        this.animator.AddAnimation("Idle", Idle, 0, 4, 15);
        this.animator.AddAnimation("Run", Run, 0, 8, 5);
        this.animator.AddAnimation("Attack", Attack, 0, 8, 5);
        this.animator.AddAnimation("JumpStart", JumpStart, 0, 4, 10); // 4 frames
        this.animator.AddAnimation("JumpEnd", JumpEnd, 0, 3, 10);     // 3 frames

        this.facingRight = true;
        this.attackHitBox = new HitBox(this, 20, -5, 40, 40);

        // O PLAYER AGORA É DONO DA SUA PRÓPRIA MUNIÇÃO
        this.bulletPool = new ObjectPool(() => new Bullet(this.screen), 10);

        // INICIANDO A MÁQUINA DE ESTADOS
        this.currentState = null;
        this.ChangeState(new IdleState(this)); // Começa parado!
    }

    // Método principal da Máquina de Estados
    ChangeState(newState) {
        if (this.currentState) {
            this.currentState.Exit(); // Limpa o estado atual
        }
        this.currentState = newState;
        this.currentState.Enter(); // Configura o novo estado
    }

    // Métodos Auxiliares para os Estados usarem (Deixa o código limpo)
    IsMovingInput() {
        return ActionManager.IsAction("RIGHT") || ActionManager.IsAction("LEFT");
    }

    IsJumpInput() {
        return (ActionManager.IsActionDown("JUMP")) && this.isGrounded;
    }

    ApplyMovement(dt) {
        if (ActionManager.IsAction("RIGHT")) {
            this.position.x += this.speed * dt;
            this.facingRight = true;
        }
        if (ActionManager.IsAction("LEFT")) {
            this.position.x -= this.speed * dt;
            this.facingRight = false;
        }
    }

    DoJump() {
        this.vy = this.jumpStrength;
        this.isGrounded = false;
        let jumpSound = AssetManager.instance.GetAudio("sfx_jump");
        AudioManager.instance.PlaySFX(jumpSound, 0.8);
    }

    // O MÉTODO SHOOT AGORA PERTENCE AO PLAYER
    // TODO: Futuramente, você pode querer passar parâmetros para o Shoot() para diferentes tipos de ataque, direção, etc.
    Shoot() {
        let bullet = this.bulletPool.Get();
        if (bullet) {
            let dir = this.facingRight ? 1 : -1;

            // O cálculo agora é muito mais limpo, pois estamos dentro do próprio Player
            let fireX = this.position.x + (this.size.x / 2);
            let fireY = this.position.y + (this.size.y / 2) - 2;

            bullet.Fire(fireX, fireY, dir);

            let laserSound = AssetManager.instance.GetAudio("sfx_laser");
            AudioManager.instance.PlaySFX(laserSound, 0.6);
        }
    }

    OnUpdate(dt) {
        const delta = dt || 0.016;

        // VERIFICAÇÃO DE INPUT DE TIRO DIRETO NO PLAYER
        // (Isso também poderia ir para os Estados de Idle e Run futuramente)
        // if (ActionManager.IsActionDown("ATTACK")) {
        //     this.Shoot();
        // }

        // 1. A física básica (gravidade) roda independentemente do estado
        this.vy += this.gravity * delta;
        this.position.y += this.vy * delta;

        // 2. DELEGAÇÃO: O Estado atual toma todas as decisões de movimento, input e animação!
        if (this.currentState) {
            this.currentState.Update(delta);
        }

        // 3. Atualiza os frames da sprite selecionada
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
            this.draw.Color = "#FFFFFF"; // Reseta a cor para branco
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