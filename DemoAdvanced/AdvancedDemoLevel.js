import { Level } from "../Template/Level.js";
import { Draw } from "../Graphic/Draw.js";
import { AssetManager } from "../Root/AssetManager.js";
import { ObjectPool } from "../Root/ObjectPool.js";
import { Input } from "../Input/Input.js";
import { Collide2D } from "../Math/Collide2D.js";
import { Vector2D } from "../Math/Vector2D.js";
import { Logger } from "../Root/Logger.js";
import { Screen } from "../Window/Screen.js";
import { UIWindow } from "../UI/UIWindow.js";
import { Camera } from "../Root/Camera.js";
import { Block } from "./Block.js";
import { Player } from "./Player.js";
import { Enemy } from "./Enemy.js";
import { Bullet } from "./Bullet.js";
import { AudioManager } from "../Root/AudioManager.js";

export class AdvancedDemoLevel extends Level {
	constructor() {
		super();
		this.TelaId = "AdvancedDemo";
	}

	OnStart() {
		super.OnStart();
		const width = this.screen ? this.screen.width : 640;
		const height = this.screen ? this.screen.height : 480;
		this.screen = new Screen("AdvancedDemo", width, height);
		this.draw = new Draw(this.screen);

		this.GameWorld = { width: 2000, height: 600 };
		this.camera = new Camera(new Vector2D(0, 0), new Vector2D(width, height));
		this.camera.Init(this.screen, this.GameWorld);
		this.bgImage = AssetManager.instance.GetImage("background");

		this.player = new Player(this.screen);
		this.AddEntity(this.player);

		// LEVEL DESIGN: Blocos e Buracos
		this.blocks = [];
		this.blocks.push(new Block(this.screen, 0, 500, 600, 100));
		this.blocks.push(new Block(this.screen, 750, 500, 500, 100));
		this.blocks.push(new Block(this.screen, 1400, 500, 600, 100));

		this.blocks.push(new Block(this.screen, 400, 380, 150, 20));
		this.blocks.push(new Block(this.screen, 900, 350, 150, 20));
		this.blocks.forEach(b => this.AddEntity(b));

		// INIMIGOS
		this.enemies = [];
		this.enemies.push(new Enemy(this.screen, this.player, 500, 100));
		this.enemies.push(new Enemy(this.screen, this.player, 1000, 100));
		this.enemies.push(new Enemy(this.screen, this.player, 1600, 100));
		this.enemies.forEach(e => this.AddEntity(e));

		this.bulletPool = new ObjectPool(() => new Bullet(this.screen), 10);
		this.bulletPool.pool.forEach(bullet => this.AddEntity(bullet));

		// Window de HUD
		const uiBaseImage = AssetManager.instance.GetImage("window_base");
		this.dialogWindow = new UIWindow(this.screen, uiBaseImage, 10, 480, 400, 150, 32);

		// Adicionamos os textos e eles ficam salvos internamente no array this.dialogWindow.children
		// [0] = Título, [1] = Inimigos, [2] = Status
		this.dialogWindow.AddText("Advanced Demo Level", 20, 40, "#FFD700", "24px", "monospace");
		this.dialogWindow.AddText("Enemies Defeated: 0", 20, 80, "#FFFFFF", "18px", "sans-serif");
		this.dialogWindow.AddText("Status: Running smoothly", 20, 110, "#00FF00", "16px", "sans-serif");

		let bgm = AssetManager.instance.GetAudio("bgm_fase1");
		AudioManager.instance.PlayBGM(bgm, 0.4); // Volume em 40%
	}

	ApplyBlockCollision(entity) {
		entity.isGrounded = false;
		for (let block of this.blocks) {
			if (Collide2D.isCollidingAABB(entity, block)) {
				if (entity.vy > 0) { // Resolve apenas caindo no chão
					entity.position.y = block.position.y - entity.size.y;
					entity.vy = 0;
					entity.isGrounded = true;
				}
			}
		}
	}

	ResetLevel() {
		Logger.log("GAME OVER! Reiniciando...");
		this.player.position = new Vector2D(100, 300);
		this.player.vy = 0;

		this.enemies[0].position = new Vector2D(500, 100);
		this.enemies[1].position = new Vector2D(1000, 100);
		this.enemies[2].position = new Vector2D(1600, 100);

		// Revive todo mundo e reseta o TakingDamage
		this.enemies.forEach(e => {
			e.active = true;
			e.isTakingDamage = false;
		});
	}

	OnUpdate(dt) {
		super.OnUpdate(dt);

		this.ApplyBlockCollision(this.player);
		this.enemies.forEach(enemy => {
			if (enemy.active) this.ApplyBlockCollision(enemy);
		});

		// 1. Morte por queda
		if (this.player.position.y > this.GameWorld.height) {
			this.ResetLevel();
		}

		// 2. Morte do Player por encostar no inimigo
		// NOTA: O jogador só sofre dano se o inimigo NÃO estiver no estado de "TakingDamage"
		this.enemies.forEach(enemy => {
			if (enemy.active && !enemy.isTakingDamage && Collide2D.isCollidingAABB(this.player, enemy)) {
				this.ResetLevel();
			}
		});

		// 3. COMBATE CORPO A CORPO (Ataque da Espada/Soco)
		// Verifica se o Player criou a HitBox vermelha neste exato frame
		if (this.player.attackHitBox && this.player.attackHitBox.active) {
			this.enemies.forEach(enemy => {
				// Só acerta inimigos vivos que ainda não estejam a voar
				if (enemy.active && !enemy.isTakingDamage) {
					if (Collide2D.isCollidingAABB(this.player.attackHitBox, enemy)) {
						// Descobre para que lado o jogador está virado (1 = Direita, -1 = Esquerda)
						let dir = this.player.facingRight ? 1 : -1;

						// Aplica o golpe épico!
						enemy.TakeDamage(dir);

						// Opcional: Adicionar um som de impacto aqui
						// let hitSound = AssetManager.instance.GetAudio("sfx_hit");
						// AudioManager.instance.PlaySFX(hitSound, 0.7);
					}
				}
			});
		}

		// 3. Vitória
		if (this.player.position.x > 1900) {
			Logger.log("PARABÉNS! Fase Concluída!");
			this.Next = true;
			// this.player.position.x = 100; 
		}

		// Checa Colisões: Tiro vs Inimigo (Tiro à distância)
		this.bulletPool.pool.forEach(bullet => {
			if (bullet.active) {
				this.enemies.forEach(enemy => {
					// O laser também pode aplicar o efeito de Knockback em vez de matar na hora!
					if (enemy.active && !enemy.isTakingDamage && Collide2D.isCollidingAABB(bullet, enemy)) {
						let dir = bullet.direction; // O tiro já tem a direção guardada
						enemy.TakeDamage(dir);
						bullet.active = false;
					}
				});
			}
		});

		if (Input.GetKeyDown("Space")) {
			this.Shoot();
		}

		// --- ATUALIZAÇÃO DOS DADOS DA INTERFACE (UI) ---
		if (this.dialogWindow && this.dialogWindow.children.length > 0) {
			// Conta quantos inimigos estão "mortos" (active == false)
			let defeatedCount = this.enemies.filter(e => !e.active).length;

			// Atualiza o texto 1 (Enemies Defeated)
			this.dialogWindow.children[1].text = `Enemies Defeated: ${defeatedCount} / ${this.enemies.length}`;

			// Descobre qual o estado do Player para atualizar o texto 2 (Status)
			let statusText = "Running smoothly";
			let statusColor = "#00FF00"; // Verde

			if (this.player.isAttacking) {
				statusText = "Attacking!";
				statusColor = "#FF0000"; // Vermelho
			} else if (!this.player.isGrounded) {
				statusText = "In the air!";
				statusColor = "#FFD700"; // Amarelo
			}

			this.dialogWindow.children[2].text = `Status: ${statusText}`;
			this.dialogWindow.children[2].color = statusColor; // Muda a cor dinamicamente também!
		}

		this.camera.Update(this.player);
	}

	Shoot() {
		let bullet = this.bulletPool.Get();
		if (bullet) {
			let dir = this.player.facingRight ? 1 : -1;
			let fireX = this.player.position.x + (this.player.size.x / 2);
			let fireY = this.player.position.y + (this.player.size.y / 2) - 2;

			bullet.Fire(fireX, fireY, dir);

			let laserSound = AssetManager.instance.GetAudio("sfx_laser");
			AudioManager.instance.PlaySFX(laserSound, 0.6);
		}
	}

	OnDrawn() {
		if (this.screen) this.screen.Refresh();

		this.camera.Begin();

		// Fundo repetido por toda a fase
		if (this.bgImage) {
			let bgWidth = this.bgImage.width || 640;
			for (let i = 0; i < this.GameWorld.width; i += bgWidth) {
				this.draw.DrawSprite(this.bgImage, i, 0);
			}
		}

		this.entities.forEach(entity => {
			if (typeof entity.OnDrawn === "function") entity.OnDrawn();
		});

		this.camera.End();

		// --- UI RENDERING (Static on screen) ---
		// We draw the UI OUTSIDE of the camera block!
		if (this.dialogWindow) {
			this.dialogWindow.OnDrawn();
		}
	}
}