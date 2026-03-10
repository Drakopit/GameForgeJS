import { GameObject } from "../Root/GameObject.js";
import { Vector2D } from "../Math/Vector2D.js";
import { AssetManager } from "../Root/AssetManager.js";
import { Animator } from "../Graphic/Animator.js";
import { AudioManager } from "../Root/AudioManager.js";
import { DEBUG } from "../Root/Engine.js";
import { Draw } from "../Graphic/Draw.js";
import { HitBox } from "./Attacks/HitBox.js";
import { IdleState } from "./States/PlayerStates/PlayerIdleState.js";
import { ObjectPool } from "../Root/ObjectPool.js";
import { Bullet } from "./Bullet.js";
import { ActionManager } from "../Input/ActionManager.js";
import { StateMachine } from "./States/StateMachine.js";

export class Player extends GameObject {
    constructor(screen) {
        super();
        this.name = "Player";
        this.position = new Vector2D(100, 300);
        this.scale = 1.7; // Multiplicador visual
        this.size = new Vector2D(26 * this.scale, 37 * this.scale);
        this.speed = 200;
        this.screen = screen;
        this.draw = new Draw(screen);

        this.vy = 0;
        this.gravity = 900;
        this.jumpStrength = -450;
        this.isGrounded = false;
        this.isAttacking = false;

        var Idle = AssetManager.instance.GetImage("heroi_idle");
        var Run = AssetManager.instance.GetImage("heroi_run");
        var Walk = AssetManager.instance.GetImage("heroi_walk");
        var Attack_1 = AssetManager.instance.GetImage("heroi_attack_01");
        var Attack_2 = AssetManager.instance.GetImage("heroi_attack_02");
        var Attack_3 = AssetManager.instance.GetImage("heroi_attack_03");
        var Jump = AssetManager.instance.GetImage("heroi_jump");
        var Death = AssetManager.instance.GetImage("heroi_death");
        var Hurt = AssetManager.instance.GetImage("heroi_hurt");
        var Defend = AssetManager.instance.GetImage("heroi_defend");

        this.sprite.sprite = Idle;
        this.sprite.screen = screen;

        this.animator = new Animator(this.sprite);

        // =======================================================
        // AGORA OS OFFSETS (X, Y) SÃO APENAS AJUSTES FINOS.
        // Como implementamos Auto-Ancoragem, a maioria começa no ZERO (0, 0)!
        // =======================================================
        this.animator.AddAnimation("Idle", Idle, 0, 7, 8, 0.5, 1, 37);
        this.animator.AddAnimation("Run", Run, 0, 8, 5, 0.5, 1, 37);
        this.animator.AddAnimation("Walk", Walk, 0, 8, 8, 0.5, 1, 37);
        this.animator.AddAnimation("Jump", Jump, 0, 5, 8, 0.5, 1, 37);

        // Ataques geralmente têm a espada "esticando" a imagem para a direita.
        // Por isso, puxamos o corpo um pouco para trás (ex: -15) para ele não deslizar.
        // Se a espada for MUITO grande, aumente o número negativo (-20, -30).
        this.animator.AddAnimation("Attack_1", Attack_1, 0, 6, 5, 0.5, 1, 37,
            {
                2: "HitStart",
                4: "HitEnd"
            });
        this.animator.AddAnimation("Attack_2", Attack_2, 0, 5, 5, 0.5, 1, 37);
        this.animator.AddAnimation("Attack_3", Attack_3, 0, 6, 5, 0.5, 1, 37);

        this.animator.AddAnimation("Hurt", Hurt, 0, 4, 10, 0.5, 1);
        this.animator.AddAnimation("Death", Death, 0, 12, 10, 0.5, 1);
        this.animator.AddAnimation("Defend", Defend, 0, 6, 10, 0.5, 1);

        this.facingRight = true;

        // HITBOX DE DANO: Coloquei para nascer 10px na frente do corpo, largura 60px para cobrir a espada.
        this.attackHitBox = new HitBox(this, 10, 0, 60, 50);

        this.bulletPool = new ObjectPool(() => new Bullet(this.screen), 10);

        this.animator.onEvent = (event) => {
            if (event === "HitStart") {
                this.attackHitBox.active = true;
                this.attackHitBox.Update();
            }

            if (event === "HitEnd") {
                this.attackHitBox.active = false;
            }
        };

        this.stateMachine = new StateMachine(this);
        this.stateMachine.ChangeState(new IdleState(this));
    }

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

    Shoot() {
        let bullet = this.bulletPool.Get();
        if (bullet) {
            let dir = this.facingRight ? 1 : -1;
            let fireX = this.position.x + (this.size.x / 2);
            let fireY = this.position.y + (this.size.y / 2) - 2;
            bullet.Fire(fireX, fireY, dir);
        }
    }

    OnUpdate(dt) {
        const delta = dt || 0.016;
        this.vy += this.gravity * delta;
        this.position.y += this.vy * delta;

        this.stateMachine.Update(delta);

        this.sprite.Update();
        this.sprite.Update();
        this.animator.Update(delta);
    }

    OnDrawn() {
        if (DEBUG()) {
            this.draw.Style = this.draw.TYPES.STROKED;
            this.draw.Color = "#00FF00";
            this.draw.DrawRect(this.position.x, this.position.y, this.size.x, this.size.y);
            this.draw.Color = "#FFFFFF";
            this.draw.Style = this.draw.TYPES.FILLED;
        }

        if (DEBUG() && this.attackHitBox.active) {
            this.draw.Style = this.draw.TYPES.STROKED;
            this.draw.Color = "#FF0000";
            this.draw.DrawRect(
                this.attackHitBox.position.x,
                this.attackHitBox.position.y,
                this.attackHitBox.size.x,
                this.attackHitBox.size.y
            );
            this.draw.Color = "#FFFFFF";
            this.draw.Style = this.draw.TYPES.FILLED;
        }

        let anim = this.animator.currentAnimation;

        let frameW = this.sprite.size.x * this.scale;
        let frameH = this.sprite.size.y * this.scale;

        let pivotX = frameW * anim.pivotX;
        let pivotY = frameH * anim.pivotY;

        let drawX = this.position.x + (this.size.x / 2) - pivotX;
        let drawY = this.position.y + this.size.y - pivotY + anim.groundOffset;

        let renderPos = new Vector2D(drawX, drawY);

        this.sprite.Animation(
            undefined,
            renderPos,
            "horizontal",
            this.sprite.row,
            this.facingRight,
            this.scale
        );
    }
}