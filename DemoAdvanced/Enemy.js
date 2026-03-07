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
        
        this.active = true; // Se for false, ele "morre"

        // FÍSICA
        this.vy = 0; 
        this.gravity = 900; 
        this.isGrounded = false;

        this.draw = new Draw(screen);
        this.player = playerRef; 
    }

    OnUpdate(dt) {
        if (!this.active) return; 

        const delta = dt || 0.016;

        // --- APLICANDO GRAVIDADE ---
        this.vy += this.gravity * delta;
        this.position.y += this.vy * delta;

        // Lógica de perseguição de plataforma (só no eixo X e no chão)
        if (this.player && this.isGrounded) {
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
        this.draw.Color = "#FF0000";
        this.draw.DrawRect(this.position.x, this.position.y, this.size.x, this.size.y);
    }
}