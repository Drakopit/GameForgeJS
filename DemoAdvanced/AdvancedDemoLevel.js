import { Level } from "../Template/Level.js";
import { Draw } from "../Graphic/Draw.js";
import { AssetManager } from "../Root/AssetManager.js";
import { ObjectPool } from "../Root/ObjectPool.js";
import { Input } from "../Input/Input.js";
import { Player } from "./Player.js";
import { Enemy } from "./Enemy.js";
import { Collide2D } from "../Math/Collide2D.js";
import { Bullet } from "./Bullet.js";

export class AdvancedDemoLevel extends Level {
    constructor(screen) {
        super(screen);
        this.TelaId = "AdvancedDemo";
        this.draw = new Draw(screen);

        // Pega o fundo carregado
        this.bgImage = AssetManager.instance.GetImage("background");
    }

    OnStart() {
        super.OnStart();

        this.player = new Player(this.screen);
        this.enemy = new Enemy(this.screen, this.player);

        this.AddEntity(this.player);
        this.AddEntity(this.enemy);

        // Inicializa o Pool de Tiros (Cria 10 tiros na memória de antemão)
        this.bulletPool = new ObjectPool(() => new Bullet(this.screen), 10);

        // Adiciona os tiros gerados pelo pool na lista de entidades para serem processados
        this.bulletPool.pool.forEach(bullet => this.AddEntity(bullet));
    }

    OnUpdate(dt) {
        super.OnUpdate(dt);

        // 3. Checa a Colisão (Inimigo pega o Jogador)
        if (Collide2D.isCollidingAABB(this.player, this.enemy)) {
            console.log("GAME OVER! O Inimigo te pegou!");

            // Teleporta o jogador de volta para o começo para "resetar"
            this.player.position.SetValue(100, 300);
            // Teleporta o inimigo para longe
            this.enemy.position.SetValue(700, 50);
        }

        // Lógica de Atirar
        // Se a tecla Space for pressionada NESTE FRAME (GetKeyDown para não atirar metralhadora)
        if (Input.GetKeyDown("Space")) {
            this.Shoot();
        }
    }

    Shoot() {
        // Pede um tiro livre do pool em vez de dar `new Bullet()`
        let bullet = this.bulletPool.Get();

        // Posiciona o tiro no meio do player
        let fireX = this.player.position.x + (this.player.size.x / 2);
        let fireY = this.player.position.y + (this.player.size.y / 2) - 2;

        bullet.Fire(fireX, fireY);
    }

    OnDrawn() {
        // 1. Limpa a tela apenas UMA vez
        if (this.screen) {
            this.screen.Refresh();
        }

        // 2. Desenha o fundo estático por baixo de tudo
        if (this.bgImage) {
            this.draw.DrawSprite(this.bgImage, 0, 0);
        }

        // 3. Desenha todas as entidades diretamente (Ignora o super)
        this.entities.forEach(entity => {
            if (typeof entity.OnDrawn === "function") {
                entity.OnDrawn();
            }
        });
    }
}