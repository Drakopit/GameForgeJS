import { Level } from "../Template/Level.js";
import { Draw } from "../Graphic/Draw.js";
import { AssetManager } from "../Root/AssetManager.js";
import { Collide2D } from "../Math/Collide2D.js";
import { Vector2D } from "../Math/Vector2D.js";
import { Engine } from "../Root/Engine.js";
import { Logger } from "../Root/Logger.js";
import { Screen } from "../Window/Screen.js";
import { UIWindow } from "../UI/UIWindow.js";
import { Camera } from "../Root/Camera.js";
import { Player } from "./Player.js";
import { AudioManager } from "../Root/AudioManager.js";
import { LevelBuilder } from "./Levels/LevelBuilder.js";
import { PlayerStatusHUD } from "./UI/PlayerStatusHUD.js";
import { CombatResolver2D } from "../Collision/CombatResolver2D.js";
import { FloatingText } from "../Effects/FloatingText.js";

const STATUS_TEXT_INDEX = {
    defeated: 1,
    state: 2,
};

const PLAYER_STATUS = {
    running: { text: "Running smoothly", color: "#00FF00" },
    attacking: { text: "Attacking!", color: "#FF0000" },
    airborne: { text: "In the air!", color: "#FFD700" },
    damaged: { text: "Recovering!", color: "#FF9F43" },
};

export class AdvancedDemoLevel extends Level {
    constructor() {
        super();
        this.caption = "GameForgeJS - Advanced Demo";
        this.TelaId = "AdvancedDemo";
        this.levelConfig = null;
    }

    OnStart() {
        this.entities = [];
        this.blocks = [];
        this.enemies = [];
        this.damageNumbers = [];
        this.player = null;
        this.playerStatusHUD = null;
        this.dialogWindow = null;
        this.levelConfig = AssetManager.instance.GetJson("advanced_level");

        if (!this.levelConfig) {
            throw new Error("AdvancedDemoLevel: manifest 'advanced_level' nao foi carregado.");
        }

        super.OnStart();

        const width = this.levelConfig.screen.width;
        const height = this.levelConfig.screen.height;
        this.screen = new Screen("AdvancedDemo", width, height);
        this.draw = new Draw(this.screen);

        this.GameWorld = { ...this.levelConfig.world };
        this.camera = new Camera(new Vector2D(0, 0), new Vector2D(width, height));
        this.camera.Init(this.screen, this.GameWorld);

        this.CreatePlayer();
        this.BuildScenario();
        this.CreateDamageTextPool();
        this.CreateUI();
        this.PlayBGM();
    }

    CreatePlayer() {
        this.player = new Player(this.screen, this.levelConfig.player);
        this.AddEntity(this.player);

        this.playerStatusHUD = new PlayerStatusHUD(this.screen, this.player, this.levelConfig.ui?.playerHud);
        this.player.bulletPool.pool.forEach(bullet => this.AddEntity(bullet));
    }

    BuildScenario() {
        new LevelBuilder(this)
            .SetBackground(this.levelConfig.background)
            .AddPlatforms(this.levelConfig.platforms)
            .AddEnemies(this.levelConfig.enemies, this.levelConfig.enemyDefaults)
            .Build();
    }

    CreateDamageTextPool() {
        const textConfig = this.levelConfig.floatingText;
        this.damageNumbers = Array.from(
            { length: textConfig.poolSize },
            () => new FloatingText(this.screen)
        );
        this.damageNumbers.forEach(text => this.AddEntity(text));
    }

    CreateUI() {
        const uiConfig = this.levelConfig.ui?.statusWindow;
        if (!uiConfig) return;

        const uiBaseImage = AssetManager.instance.GetImage("window_base");
        this.dialogWindow = new UIWindow(
            this.screen,
            uiBaseImage,
            uiConfig.x,
            uiConfig.y,
            uiConfig.width,
            uiConfig.height,
            uiConfig.cornerSize
        );

        uiConfig.texts.forEach(text => {
            this.dialogWindow.AddText(
                text.text,
                text.x,
                text.y,
                text.color,
                text.fontSize,
                text.font
            );
        });
    }

    PlayBGM() {
        const audioConfig = this.levelConfig.audio;
        if (!audioConfig?.bgm) return;

        let bgm = AssetManager.instance.GetAudio(audioConfig.bgm);
        AudioManager.instance.PlayBGM(bgm, audioConfig.bgmVolume);
    }

    ApplyBlockCollision(entity) {
        entity.isGrounded = false;
        const floorSnapTolerance = this.levelConfig.collision.floorSnapTolerance;

        for (let block of this.blocks) {
            if (!Collide2D.isCollidingAABB(entity, block) || entity.vy < 0) {
                continue;
            }

            const previousY = entity.previousPosition?.y ?? entity.position.y;
            const previousBottom = previousY + entity.size.y;
            const blockTop = block.position.y;
            const entityLeft = entity.position.x;
            const entityRight = entity.position.x + entity.size.x;
            const blockLeft = block.position.x;
            const blockRight = block.position.x + block.size.x;
            const overlapsHorizontally = entityRight > blockLeft && entityLeft < blockRight;
            const cameFromAbove = previousBottom <= blockTop + floorSnapTolerance;

            if (overlapsHorizontally && cameFromAbove) {
                entity.position.y = blockTop - entity.size.y;
                entity.vy = 0;
                entity.isGrounded = true;
            }
        }
    }

    ResetLevel(reason = "defeat") {
        const message = reason === "victory"
            ? "Fase concluida. Reiniciando demo..."
            : "GAME OVER! Reiniciando...";
        Logger.log("info", message);
        this.player.Reset(this.levelConfig.player.spawn);

        this.enemies.forEach((enemy, index) => {
            enemy.Reset(this.levelConfig.enemies[index] ?? enemy.spawn);
        });

        this.damageNumbers?.forEach(text => {
            text.active = false;
        });
    }

    SpawnDamageNumber(amount, x, y) {
        const textConfig = this.levelConfig.floatingText;
        const text = this.damageNumbers.find(item => !item.active) ?? this.damageNumbers[0];
        const isStrongHit = amount >= textConfig.strongDamageThreshold;

        text.Spawn(`-${amount}`, x, y + textConfig.spawnOffsetY, {
            color: isStrongHit ? textConfig.strongColor : textConfig.normalColor,
            fontSize: isStrongHit ? textConfig.strongFontSize : textConfig.normalFontSize,
            velocityX: isStrongHit ? textConfig.strongVelocityX : textConfig.normalVelocityX,
            velocityY: textConfig.velocityY,
            lifeTime: isStrongHit ? textConfig.strongLifeTime : textConfig.normalLifeTime,
        });
    }

    ApplyDamageFeedback(hit) {
        const damage = hit.damage ?? hit.hitbox?.damage ?? this.player.attack;
        const position = hit.position ?? {
            x: hit.defender?.owner?.position?.x ?? this.player.position.x,
            y: hit.defender?.owner?.position?.y ?? this.player.position.y,
        };
        const fallbackHitStop = this.levelConfig.player.combat.defaultHitStop;

        this.SpawnDamageNumber(damage, position.x, position.y);
        Engine.HitStop(hit.hitStop ?? hit.hitbox?.hitStop ?? fallbackHitStop);
    }

    HandlePlayerEnemyContact() {
        const contactHit = this.levelConfig.player.combat.contactDamage;

        for (const enemy of this.enemies) {
            if (!enemy.active || enemy.isTakingDamage) continue;
            if (!Collide2D.isCollidingAABB(this.player, enemy)) continue;

            const direction = this.player.position.x < enemy.position.x ? -1 : 1;
            const hitApplied = this.player.TakeDamage(direction, contactHit);

            if (!hitApplied) return;

            this.SpawnDamageNumber(contactHit.damage, this.player.position.x + (this.player.size.x / 2), this.player.position.y);
            Engine.HitStop(contactHit.hitStop);

            if (this.player.hp <= 0) {
                this.ResetLevel("defeat");
            }

            return;
        }
    }

    ResolvePlayerAttacks() {
        const enemyHurtboxes = this.enemies
            .filter(enemy => enemy.active)
            .map(enemy => enemy.boxes);

        CombatResolver2D.Resolve(this.player.boxes, enemyHurtboxes, {
            onHit: (hit) => {
                const { defender } = hit;
                const dir = this.player.facingRight ? 1 : -1;
                defender.owner.TakeDamage(dir, hit);
                this.ApplyDamageFeedback(hit);
            }
        });
    }

    HandleBulletCollisions() {
        const bulletHit = this.levelConfig.player.combat.bulletHit;

        this.player.bulletPool.pool.forEach(bullet => {
            if (!bullet.active) return;

            this.enemies.forEach(enemy => {
                if (!enemy.active || enemy.isTakingDamage) return;
                if (!Collide2D.isCollidingAABB(bullet, enemy)) return;

                const hit = {
                    damage: this.player.attack,
                    knockback: bulletHit.knockback,
                    hitStop: bulletHit.hitStop,
                    position: {
                        x: bullet.position.x + (bullet.size.x / 2),
                        y: bullet.position.y,
                    },
                };

                enemy.TakeDamage(bullet.direction, hit);
                this.ApplyDamageFeedback(hit);
                bullet.active = false;
            });
        });
    }

    UpdateStatusWindow() {
        if (!this.dialogWindow || this.dialogWindow.children.length === 0) return;

        const defeatedText = this.dialogWindow.children[STATUS_TEXT_INDEX.defeated];
        const stateText = this.dialogWindow.children[STATUS_TEXT_INDEX.state];
        const defeatedCount = this.enemies.filter(e => !e.active).length;

        if (defeatedText) {
            defeatedText.text = `Enemies Defeated: ${defeatedCount} / ${this.enemies.length}`;
        }

        if (!stateText) return;

        let status = PLAYER_STATUS.running;
        if (this.player.isTakingDamage) status = PLAYER_STATUS.damaged;
        else if (this.player.isAttacking) status = PLAYER_STATUS.attacking;
        else if (!this.player.isGrounded) status = PLAYER_STATUS.airborne;

        stateText.text = `Status: ${status.text}`;
        stateText.color = status.color;
    }

    OnUpdate(dt) {
        super.OnUpdate(dt);

        this.ApplyBlockCollision(this.player);
        this.enemies.forEach(enemy => {
            if (enemy.active) this.ApplyBlockCollision(enemy);
        });

        if (this.player.position.y > this.GameWorld.height) {
            this.ResetLevel("fall");
        }

        this.ResolvePlayerAttacks();
        this.HandlePlayerEnemyContact();
        this.HandleBulletCollisions();

        if (this.player.position.x > this.levelConfig.victory.x) {
            this.CompleteLevel();
        }

        this.UpdateStatusWindow();
        this.playerStatusHUD?.OnUpdate(dt);
        this.camera.Update(this.player);
    }

    OnDrawn() {
        if (this.screen) this.screen.Refresh();

        this.camera.Begin();

        if (this.bgImage) {
            let bgWidth = this.bgImage.width || this.levelConfig.screen.width;
            for (let i = 0; i < this.GameWorld.width; i += bgWidth) {
                this.draw.DrawSprite(this.bgImage, i, 0);
            }
        }

        this.entities.forEach(entity => {
            if (typeof entity.OnDrawn === "function") entity.OnDrawn();
        });

        this.camera.End();

        this.playerStatusHUD?.OnDrawn();

        if (this.dialogWindow) {
            this.dialogWindow.OnDrawn();
        }
    }

    CompleteLevel() {
        Logger.log("info", "PARABENS! Fase concluida.");

        if ((this.LEVEL_HANDLER?.levels?.length ?? 0) > 1) {
            this.Next = true;
            return;
        }

        this.ResetLevel("victory");
    }

    OnExit() {
        super.OnExit();
        this.entities = [];
        this.blocks = [];
        this.enemies = [];
        this.damageNumbers = [];
        this.player = null;
        this.playerStatusHUD = null;
        this.dialogWindow = null;
        this.screen = null;
        this.levelConfig = null;
    }
}
