import { GameObject } from "../Root/GameObject.js";
import { Vector2D } from "../Math/Vector2D.js";
import { Draw } from "../Graphic/Draw.js";
import { Input } from "../Input/Input.js";

export class Player extends GameObject {
	constructor(screen) {
		super();
		this.name = "Player";
		this.position = new Vector2D(400, 300);
		this.size = new Vector2D(32, 32);
		this.speed = 300; // Pixels por segundo
		this.draw = new Draw(screen);
	}

	OnUpdate(dt) {
		let moveX = 0;
		let moveY = 0;

		// Captura de Input usando a sua classe Input (W, A, S, D ou Setas)
		if (Input.GetKey("KeyW") || Input.GetKey("ArrowUp")) moveY -= 1;
		if (Input.GetKey("KeyS") || Input.GetKey("ArrowDown")) moveY += 1;
		if (Input.GetKey("KeyA") || Input.GetKey("ArrowLeft")) moveX -= 1;
		if (Input.GetKey("KeyD") || Input.GetKey("ArrowRight")) moveX += 1;

		// Atualiza a posição (multiplicando por dt para ser independente do FPS)
		// Se a sua engine ainda não passar 'dt' no OnUpdate, usamos 0.016 como fallback fixo
		const delta = dt || 0.016;
		this.position.x += moveX * this.speed * delta;
		this.position.y += moveY * this.speed * delta;

		// Limita o jogador dentro da tela (Assumindo 800x600)
		if (this.position.x < 0) this.position.x = 0;
		if (this.position.y < 0) this.position.y = 0;
		if (this.position.x > 800 - this.size.x) this.position.x = 800 - this.size.x;
		if (this.position.y > 600 - this.size.y) this.position.y = 600 - this.size.y;
	}

	OnDrawn() {
		// Desenha o Player como um quadrado azul
		this.draw.Color = "#428BCA";
		this.draw.DrawRect(this.position.x, this.position.y, this.size.x, this.size.y);
	}
}