import { GameObject } from "../Root/GameObject.js";
import { Vector2D } from "../Math/Vector2D.js";
import { Input } from "../Input/Input.js";
import { AssetManager } from "../Root/AssetManager.js";
import { Animator } from "../Graphic/Animator.js";

export class Player extends GameObject {
    constructor(screen) {
        super();
        this.name = "Player";
        this.position = new Vector2D(100, 300);
        this.size = new Vector2D(32, 32);
        this.speed = 200;
        this.screen = screen; 

        // FÍSICA DE PLATAFORMA
        this.vy = 0; 
        this.gravity = 900; 
        this.jumpStrength = -450; 
        this.isGrounded = false; 

        this.sprite.sprite = AssetManager.instance.GetImage("hero");
        this.sprite.size = this.size; 
        this.sprite.screen = screen;

        this.animator = new Animator(this.sprite);
        this.animator.AddAnimation("Idle", 0, 4, 15);  
        this.animator.AddAnimation("Run", 1, 8, 5);   

        this.facingRight = true; 
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

        // --- APLICANDO GRAVIDADE E PULO ---
        this.vy += this.gravity * delta; 
        this.position.y += this.vy * delta; 

        if ((Input.GetKeyDown("KeyW") || Input.GetKeyDown("ArrowUp")) && this.isGrounded) {
            this.vy = this.jumpStrength; 
            this.isGrounded = false; 
        }

        // --- MÁQUINA DE ESTADOS VISUAIS ---
        if (isMoving) {
            this.animator.Play("Run");
        } else {
            this.animator.Play("Idle");
        }

        this.sprite.Update();
    }

    OnDrawn() {
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