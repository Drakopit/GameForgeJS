import { GameObject } from "../Root/GameObject.js";
import { Vector2D } from "../Math/Vector2D.js";
import { Input } from "../Input/Input.js";
import { AssetManager } from "../Root/AssetManager.js";
import { Animator } from "../Graphic/Animator.js";
import { Logger } from "../Root/Logger.js";

export class Player extends GameObject {
    constructor(screen) {
        super();
        this.name = "Player";
        this.position = new Vector2D(100, 300);
        this.size = new Vector2D(32, 32);
        this.speed = 200;
        this.screen = screen; // Referência para passar pros tiros

        // Puxa a spritesheet e configura a animação
        this.sprite.sprite = AssetManager.instance.GetImage("hero");
        this.sprite.size = this.size; // Tamanho de cada frame
        this.sprite.screen = screen;
        
        // Inicializa nossa máquina de estados
        this.animator = new Animator(this.sprite);
        
        // Registra as animações: AddAnimation(nome, linha, qtdFrames, velocidade)
        this.animator.AddAnimation("Idle", 0, 4, 15);  // Linha 0 da imagem
        this.animator.AddAnimation("Run", 1, 8, 5);   // Linha 1 da imagem
    }

    OnUpdate(dt) {
        const delta = dt || 0.016;
        let isMoving = false;

        // Movimento Básico
        if (Input.GetKey("KeyD") || Input.GetKey("ArrowRight")) {
            this.position.x += this.speed * delta;
            isMoving = true;
        }
        if (Input.GetKey("KeyA") || Input.GetKey("ArrowLeft")) {
            this.position.x -= this.speed * delta;
            isMoving = true;
        }

        // --- MÁQUINA DE ESTADOS VISUAIS ---
        if (isMoving) {
            this.animator.Play("Run");
        } else {
            this.animator.Play("Idle");
        }

        // Atualiza o frame do sprite interno
        this.sprite.Update();
    }

    OnDrawn() {
        // Usa o método Animation nativo do seu Sprite.js
        this.sprite.Animation(
            this.sprite.sprite.src, 
            this.position, 
            "horizontal", 
            this.sprite.row
        );
    }
}