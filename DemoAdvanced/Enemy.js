import { GameObject } from "../Root/GameObject.js";
import { Vector2D } from "../Math/Vector2D.js";
import { Animator } from "../Graphic/Animator.js";
import { AssetManager } from "../Root/AssetManager.js";
import { Draw } from "../Graphic/Draw.js";
import { EnemyIdleState } from "./States/EnemyStates/EnemyIdleState.js";
import { EnemyHitState } from "./States/EnemyStates/EnemyHitState.js";
import { StateMachine } from "./States/StateMachine.js";
import { BoxController2D } from "../Collision/BoxController2D.js";

const DEFAULT_ENEMY_CONFIG = {
    scale: 1,
    bodySize: { width: 64, height: 64 },
    movement: {
        speed: 100,
        gravity: 900,
    },
    ai: {
        aggroRange: 200,
        stopDistance: 5,
    },
    stats: {
        hp: 30,
        attack: 10,
        defense: 0,
    },
    combat: {
        hitStunFallback: 0.14,
        knockbackDrag: 0.9,
        staggerKnockback: { x: 400, y: -350 },
    },
    render: {
        drawOffsetX: 22,
    },
    healthBar: {
        width: 40,
        height: 6,
        offsetY: -15,
        highHpColor: "#00FF00",
        midHpColor: "#FFFF00",
        lowHpColor: "#FF0000",
        emptyColor: "#333333",
        borderColor: "#000000",
        highHpThreshold: 0.5,
        midHpThreshold: 0.25,
    },
};

const ENEMY_ANIMATIONS = [
    { name: "Idle", asset: "enemy_idle", fallback: "heroi_idle", row: 0, frames: 6, speed: 10, pivotX: 0.5, pivotY: 1, groundOffset: 5 },
    { name: "Run", asset: "enemy_run", fallback: "heroi_run", row: 0, frames: 8, speed: 8, pivotX: 0.5, pivotY: 1, groundOffset: 5 },
    { name: "Hit", asset: "enemy_hit", fallback: "heroi_hurt", row: 0, frames: 6, speed: 10, pivotX: 0.5, pivotY: 1, groundOffset: 5, loop: false },
    { name: "Attack", asset: "enemy_attack", fallback: "enemy_hit", row: 0, frames: 5, speed: 5, pivotX: 0.5, pivotY: 1, groundOffset: 5, loop: false },
];

function mergeEnemyConfig(config = {}) {
    return {
        ...DEFAULT_ENEMY_CONFIG,
        ...config,
        bodySize: { ...DEFAULT_ENEMY_CONFIG.bodySize, ...config.bodySize },
        movement: { ...DEFAULT_ENEMY_CONFIG.movement, ...config.movement },
        ai: { ...DEFAULT_ENEMY_CONFIG.ai, ...config.ai },
        stats: { ...DEFAULT_ENEMY_CONFIG.stats, ...config.stats },
        combat: {
            ...DEFAULT_ENEMY_CONFIG.combat,
            ...config.combat,
            staggerKnockback: {
                ...DEFAULT_ENEMY_CONFIG.combat.staggerKnockback,
                ...config.combat?.staggerKnockback,
            },
        },
        render: { ...DEFAULT_ENEMY_CONFIG.render, ...config.render },
        healthBar: { ...DEFAULT_ENEMY_CONFIG.healthBar, ...config.healthBar },
    };
}

export class Enemy extends GameObject {
    constructor(screen, playerRef, spawn, config = {}) {
        super();

        this.config = mergeEnemyConfig(config);
        this.name = "Enemy";
        this.spawn = new Vector2D(spawn.x, spawn.y);
        this.position = new Vector2D(this.spawn.x, this.spawn.y);
        this.previousPosition = new Vector2D(this.spawn.x, this.spawn.y);
        this.scale = this.config.scale;
        this.size = new Vector2D(
            this.config.bodySize.width * this.scale,
            this.config.bodySize.height * this.scale
        );
        this.speed = this.config.movement.speed;
        this.active = true;
        this.vy = 0;
        this.gravity = this.config.movement.gravity;
        this.isGrounded = false;
        this.isTakingDamage = false;
        this.hitStunRemaining = 0;
        this.knockbackSpeed = 0;
        this.knockbackDrag = this.config.combat.knockbackDrag;
        this.aggroRange = this.config.ai.aggroRange;
        this.stopDistance = this.config.ai.stopDistance;
        this.player = playerRef;

        this.draw = new Draw(screen);
        this.sprite.screen = screen;

        this.sprite.sprite = this.ResolveImage("enemy_idle", "heroi_idle");
        this.animator = new Animator(this.sprite);
        this.RegisterAnimations();
        this.boxes = new BoxController2D(this, AssetManager.instance.GetJson("enemy_boxes"));

        this.facingRight = false;

        this.stateMachine = new StateMachine(this);
        this.stateMachine.ChangeState(new EnemyIdleState(this));

        this.maxHP = this.config.stats.hp;
        this.hp = this.maxHP;
        this.attack = this.config.stats.attack;
        this.defense = this.config.stats.defense;
    }

    ResolveImage(assetName, fallbackName) {
        if (AssetManager.instance.HasImage(assetName)) {
            return AssetManager.instance.GetImage(assetName);
        }

        return AssetManager.instance.GetImage(fallbackName);
    }

    RegisterAnimations() {
        ENEMY_ANIMATIONS.forEach(animation => {
            const image = this.ResolveImage(animation.asset, animation.fallback);
            this.animator.AddAnimation(
                animation.name,
                image,
                animation.row,
                animation.frames,
                animation.speed,
                animation.pivotX,
                animation.pivotY,
                animation.groundOffset,
                null,
                { loop: animation.loop ?? true }
            );
        });
    }

    Reset(spawn = this.spawn) {
        this.spawn = new Vector2D(spawn.x, spawn.y);
        this.position = new Vector2D(this.spawn.x, this.spawn.y);
        this.previousPosition = new Vector2D(this.spawn.x, this.spawn.y);
        this.active = true;
        this.isTakingDamage = false;
        this.hp = this.maxHP;
        this.vy = 0;
        this.knockbackSpeed = 0;
        this.hitStunRemaining = 0;
        this.isGrounded = false;
        this.stateMachine.currentState = null;
        this.stateMachine.ChangeState(new EnemyIdleState(this));
    }

    TakeDamage(dir, hit = null) {
        if (!this.active) return;

        const hitbox = hit?.hitbox ?? hit ?? {};
        const shouldStagger = hit?.stagger ?? hitbox.stagger ?? true;
        const rawDamage = hit?.damage ?? hitbox.damage ?? this.player.attack;
        const damage = Math.max(0, rawDamage - this.defense);

        this.hp -= damage;

        if (this.hp <= 0) {
            this.Die();
            return;
        }

        if (!shouldStagger) {
            this.ApplyHitStun(hit, hitbox);
            return;
        }

        this.isTakingDamage = true;
        this.hitStunRemaining = 0;
        this.vy = hit?.knockback?.y ?? hitbox.knockback?.y ?? this.config.combat.staggerKnockback.y;
        this.knockbackSpeed = (hit?.knockback?.x ?? hitbox.knockback?.x ?? this.config.combat.staggerKnockback.x) * dir;
        this.InterruptLockedState();
        this.stateMachine.ChangeState(new EnemyHitState(this));
    }

    ApplyHitStun(hit, hitbox) {
        this.isTakingDamage = true;
        this.hitStunRemaining = Math.max(
            this.hitStunRemaining,
            hit?.hitStun ?? hitbox.hitStun ?? this.config.combat.hitStunFallback
        );
        this.knockbackSpeed = 0;
        this.InterruptLockedState();
        this.animator.Play("Hit");
    }

    InterruptLockedState() {
        const currentState = this.stateMachine.currentState;
        if (!currentState?.locked) return;

        currentState.locked = false;
        currentState.Exit();
        this.stateMachine.currentState = null;
    }

    ReturnToIdle() {
        const currentState = this.stateMachine.currentState;
        if (currentState) {
            currentState.locked = false;
            currentState.Exit();
        }

        this.stateMachine.currentState = null;
        this.stateMachine.ChangeState(new EnemyIdleState(this));
    }

    Die() {
        this.active = false;
    }

    OnUpdate(dt) {
        if (!this.active) return;

        const delta = dt || 0.016;
        this.previousPosition = new Vector2D(this.position.x, this.position.y);

        this.vy += this.gravity * delta;
        this.position.y += this.vy * delta;

        if (this.hitStunRemaining > 0) {
            this.hitStunRemaining = Math.max(0, this.hitStunRemaining - delta);
            if (this.hitStunRemaining === 0) {
                this.isTakingDamage = false;
                this.ReturnToIdle();
            }
            this.sprite.Update();
            this.animator.Update(delta);
            return;
        }

        this.stateMachine.Update(delta);

        this.sprite.Update();
        this.animator.Update(delta);
    }

    _drawHealthBar() {
        const bar = this.config.healthBar;
        const barX = this.position.x + (this.size.x / 2) - (bar.width / 2);
        const barY = this.position.y + bar.offsetY;
        const hpPercent = Math.max(0, this.hp / this.maxHP);

        this.draw.Style = this.draw.TYPES.FILLED;
        this.draw.Color = bar.emptyColor;
        this.draw.DrawRect(barX, barY, bar.width, bar.height);

        if (hpPercent > bar.highHpThreshold) this.draw.Color = bar.highHpColor;
        else if (hpPercent > bar.midHpThreshold) this.draw.Color = bar.midHpColor;
        else this.draw.Color = bar.lowHpColor;

        this.draw.DrawRect(barX, barY, bar.width * hpPercent, bar.height);

        this.draw.Style = this.draw.TYPES.STROKED;
        this.draw.Color = bar.borderColor;
        this.draw.DrawRect(barX, barY, bar.width, bar.height);
        this.draw.Style = this.draw.TYPES.FILLED;
    }

    OnDrawn() {
        if (!this.active) return;

        this.boxes.DrawDebug(this.draw, { hit: false });

        let anim = this.animator.currentAnimation;
        let frameW = this.sprite.size.x * this.scale;
        let frameH = this.sprite.size.y * this.scale;

        let pivotX = frameW * anim.pivotX;
        let pivotY = frameH * anim.pivotY;
        const facingOffset = this.facingRight ? 1 : -1;

        let drawX = this.position.x + (this.size.x / 2) - pivotX + (this.config.render.drawOffsetX * facingOffset);
        let drawY = this.position.y + this.size.y - pivotY + (anim.groundOffset || 0);
        let renderPos = new Vector2D(drawX, drawY);
        const ctx = this.sprite.screen.Context;

        ctx.save();
        if (this.isTakingDamage) {
            ctx.globalAlpha = 0.5;
        }

        this.sprite.Animation(
            undefined,
            renderPos,
            "horizontal",
            this.sprite.row,
            this.facingRight,
            this.scale
        );

        ctx.restore();
        this._drawHealthBar();
    }
}
