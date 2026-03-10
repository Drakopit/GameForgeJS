import { GameObject } from "../Root/GameObject.js";
import { Vector2D } from "../Math/Vector2D.js";
import { Draw } from "../Graphic/Draw.js";

export class Enemy extends GameObject {
    constructor(screen, playerRef, startX, startY) {
        super();
        this.name = "Enemy";
        this.position = new Vector2D(startX, startY); 
        this.size = new Vector2D(32, 32);
        this.speed = 100; 
        
        this.active = true; 

        // FÍSICA E ESTADOS
        this.vy = 0; 
        this.gravity = 900; 
        this.isGrounded = false;
        
        // ESTADOS DE COMBATE
        this.isTakingDamage = false;
        this.knockbackSpeed = 0;

        this.draw = new Draw(screen);
        this.player = playerRef; 
    }

    // Função chamada pela HitBox do Player
    TakeDamage(dir) {
        if (!this.active || this.isTakingDamage) return;
        
        this.isTakingDamage = true;
        
        // Dá um solavanco para cima (pulo de dano)
        this.vy = -350; 
        // Define a velocidade de empurrão para trás (direção do ataque * força)
        this.knockbackSpeed = 400 * dir; 
    }

    OnUpdate(dt) {
        if (!this.active) return; 

        const delta = dt || 0.016;

        // --- APLICANDO GRAVIDADE SEMPRE ---
        this.vy += this.gravity * delta;
        this.position.y += this.vy * delta;

        // --- MÁQUINA DE ESTADOS DO INIMIGO ---
        if (this.isTakingDamage) {
            // Se está a sofrer dano, voa para trás sem controlo
            this.position.x += this.knockbackSpeed * delta;
            
            // Se já não está a subir e bateu no chão, morre de vez!
            if (this.isGrounded && this.vy >= 0) {
                this.active = false; 
            }
        } 
        else if (this.player && this.isGrounded && Math.abs(this.position.x - this.player.position.x) < 200) {
            // Inteligência normal de perseguição (só acontece se NÃO estiver a sofrer dano)
            if (Math.abs(this.position.x - this.player.position.x) > 5) {
                if (this.position.x < this.player.position.x) {
                    this.position.x += this.speed * delta;
                } else if (this.position.x > this.player.position.x) {
                    this.position.x -= this.speed * delta;
                }
            }
        }
    }

    OnDrawn() {
        if (!this.active) return;
        
        // Fica branco/amarelo quando está a sofrer dano para dar feedback visual
        if (this.isTakingDamage) {
            this.draw.Color = "#FFFFFF"; 
        } else {
            this.draw.Color = "#FF0000";
        }
        
        this.draw.DrawRect(this.position.x, this.position.y, this.size.x, this.size.y);
    }
}