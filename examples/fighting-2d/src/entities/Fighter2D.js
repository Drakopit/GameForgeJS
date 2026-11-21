import { Vector2D } from 'gameforgejs/core';
import { GameObject, ComboController } from 'gameforgejs/2d';
import { FighterSettings as Settings, CombatSettings as Combat } from '../data/FightingSettings.js';
import { FighterAttacks, AttackChain } from '../data/FighterAttacks.js';
import { FighterMotor } from './FighterMotor.js';
import { FighterVisual } from '../presentation/FighterVisual.js';
import { FighterBoxes } from '../combat/FighterBoxes.js';

export class Fighter2D extends GameObject {
    constructor(config) {
        super();
        Object.assign(this, { id: config.id, name: config.name, tint: config.tint, stats: config.stats,
            input: config.input, controlledByPlayer: config.controlledByPlayer });
        this.velocity = new Vector2D();
        this.size.Set(Settings.hurtWidth, Settings.hurtHeight);
        this.maxHp = Math.round(Settings.maxHp * this.stats.hpMult);
        this.roundWins = 0;
        this.isMoving = true; // The engine Sprite clock runs for idle and non-looping attacks too.
        this.motor = this.AddComponent(new FighterMotor());
        this.visual = this.AddComponent(new FighterVisual(config.screen, this.sprite, config.image));
        this.boxes = new FighterBoxes(this);
        this.combo = new ComboController(this, AttackChain, { inputBufferTime: Combat.inputBufferSeconds });
        this.ResetRound(config.x, config.groundY, config.facingRight);
    }

    ResetRound(x, groundY, facingRight) {
        this.position.Set(x, groundY); this.velocity.Set(0, 0);
        this.groundY = groundY; this.facingRight = facingRight;
        this.hp = this.displayHp = this.maxHp;
        this.meter = Combat.startingMeter;
        this.state = null; this.stateTimer = 0;
        this.currentAttackName = null; this.hitOnce = false; this.projectileFired = false;
        this.invulnerableTimer = this.powerCooldown = this.comboTimer = this.comboCount = 0;
        this.bufferRemaining = this.noticeRemaining = 0;
        this.bufferedAttack = null; this.notice = ''; this.shotsFired = 0;
        this.command = {};
        this.landTimer=0;this.knockedDown=false;this.hitReaction='hurt';
        this.combo.Reset(); this.boxes.ResetHitMemory(); this.motor.Reset();
        this.ChangeState('idle');
    }

    FaceOpponent() {
        if (this.opponent && !this.IsActionLocked()) this.facingRight = this.opponent.position.x >= this.position.x;
    }

    OnUpdate(dt) {
        this.stateTimer = Math.max(0, this.stateTimer - dt);
        this.landTimer=Math.max(0,this.landTimer-dt);
        this.invulnerableTimer = Math.max(0, this.invulnerableTimer - dt);
        this.powerCooldown = Math.max(0, this.powerCooldown - dt);
        this.noticeRemaining = Math.max(0, this.noticeRemaining - dt);
        this.comboTimer = Math.max(0, this.comboTimer - dt);
        if (this.comboTimer === 0) this.comboCount = 0;
        this.bufferRemaining = Math.max(0, this.bufferRemaining - dt);
        if (!this.bufferRemaining) this.bufferedAttack = null;
        this.combo.Update(dt);
        this.meter = Math.min(Combat.maxMeter, this.meter + Combat.passiveMeterPerSecond * dt);
        this.displayHp = Math.max(this.hp, this.displayHp - Combat.healthTrailSpeed * dt);
        const command = this.command;
        const requested = ['super', 'special', 'heavy', 'medium', 'light'].find(name => command[name]);
        if (requested) {
            this.bufferedAttack = requested; this.bufferRemaining = Combat.inputBufferSeconds;
            if (this.currentAttackName === 'light' && requested === 'heavy'
                || this.currentAttackName === 'heavy' && requested === 'special') this.combo.QueueNext();
        }
        if (this.hp > 0) {
            if (this.IsActionLocked()) this.UpdateLockedState(dt);
            if (!this.IsActionLocked()) {
                if (this.bufferedAttack) this.StartAttack(this.bufferedAttack);
                if (!this.IsActionLocked()) this.motor.Control(dt, command);
            }
            const attack = this.GetCurrentAttack();
            if (attack?.projectile && !this.projectileFired && attack.duration - this.stateTimer >= attack.activeStart) {
                this.projectileFired = true;
                if (this.level.combat.Fire(this, attack)) this.shotsFired++;
            }
        }
        super.OnUpdate(dt);
    }

    UpdateLockedState(dt) {
        if (this.state === 'hurt' || this.state === 'guard') this.velocity.x *= Math.pow(0.9, dt * 60);
        if (this.hitOnce && this.CanCancel()) {
            const next = this.combo.ConsumeNextIfReady(this.sprite.index);
            if (next) { this.StartAttack(next, true); return; }
            if (this.bufferedAttack === 'super' && this.CanStartAttack('super')) { this.StartAttack('super'); return; }
        }
        if (this.stateTimer === 0 && this.state !== 'ko') {
            this.currentAttackName = null; this.hitOnce = false;
            this.ChangeState(this.IsGrounded() ? 'idle' : 'jump');
        }
    }

    CanStartAttack(name) {
        const attack = FighterAttacks[name];
        if (!attack || this.hp <= 0 || (attack.meterCost ?? 0) > this.meter) return false;
        if (attack.projectile && (!this.IsGrounded() || this.powerCooldown > 0 || !this.level.combat.CanFire(this))) return false;
        return true;
    }

    StartAttack(name, chained = false) {
        if(!chained){
            if(!this.IsGrounded()&&['light','medium','heavy'].includes(name))name=name==='light'?'aerialLight':'aerialHeavy';
            else if(this.command.crouch)name=({light:'crouchLight',medium:'sweep',heavy:'crouchHeavy',special:'weaponSpecial'})[name]??name;
            else if(name==='heavy'&&this.motor.dashRemaining>0)name='dashStrike';
        }
        if (!this.CanStartAttack(name)) {
            this.notice = (FighterAttacks[name]?.meterCost ?? 0) > this.meter ? 'SUPER: precisa de 50 EN'
                : !this.IsGrounded() ? 'Poder: aterrise para lançar' : 'Poder recarregando';
            this.noticeRemaining = Combat.noticeSeconds; this.bufferedAttack = null;
            return false;
        }
        const attack = FighterAttacks[name];
        this.currentAttackName = name; this.hitOnce = false; this.projectileFired = false;
        this.stateTimer = attack.duration; this.bufferedAttack = null;
        this.boxes.ResetHitMemory();
        if (!chained) {
            this.combo.Reset();
            if (attack.chainIndex !== undefined) { this.combo.Start(); this.combo.index = attack.chainIndex; }
        }
        this.velocity.x = (this.facingRight ? 1 : -1) * (attack.lunge ?? 0);
        this.meter -= attack.meterCost ?? 0;
        if (attack.projectile) this.powerCooldown = Combat.specialCooldown;
        this.motor.dashRemaining = 0;
        this.ChangeState(name);
        return true;
    }

    TakeHit(hit) {
        if (this.IsInvulnerable()) return;
        this.hp = Math.max(0, this.hp - hit.damage);
        this.meter = Math.min(Combat.maxMeter, this.meter + (hit.blocked ? Combat.blockedMeter : Combat.hurtMeter));
        this.velocity.x = hit.direction * hit.knockback;
        this.invulnerableTimer = Combat.invulnerabilitySeconds;
        this.currentAttackName = null; this.hitOnce = false;
        this.knockedDown=Boolean(hit.knockdown&&!hit.blocked&&this.hp>0);
        this.hitReaction=hit.knockback>=200?'knockback':'hurt';
        this.bufferedAttack = null; this.combo.Reset();
        this.ChangeState(this.hp === 0 ? 'ko' : hit.blocked ? 'guard' : 'hurt');
        this.stateTimer = hit.hitStun+(this.knockedDown?0.5:0);
    }

    OnHit(meterGain = 0, blocked = false) {
        this.hitOnce = true;
        this.meter = Math.min(Combat.maxMeter, this.meter + meterGain);
        if (!blocked) { this.comboCount++; this.comboTimer = Combat.comboSeconds; }
    }
    ChangeState(state) {
        if (state === this.state) return;
        this.state = state; this.visual.Play(state);
    }
    UpdateAnimation(dt) { super.OnUpdate(dt); }
    PlayVictory() { this.currentAttackName = null; this.ChangeState('victory'); }
    PlayDefeat() { this.currentAttackName = null; this.ChangeState('ko'); }
    IsGrounded() { return this.position.y >= this.groundY - Settings.footTolerance && this.velocity.y >= 0; }
    IsActionLocked() { return Boolean(FighterAttacks[this.state]) || this.state === 'hurt' || this.state === 'ko' || this.state === 'guard' && this.stateTimer > 0; }
    IsInvulnerable() { return this.invulnerableTimer > 0 || this.hp <= 0 || this.state==='hurt'&&this.knockedDown; }
    IsBlocking(source,attack={}) {
        const correctHeight=Boolean(attack.level==='low'?this.command.crouch:attack.level==='high'?!this.command.crouch:true);
        return this.state === 'guard' && correctHeight && this.IsGrounded() && (source.position.x > this.position.x ? this.facingRight : !this.facingRight);
    }
    CanHit() {
        const attack = this.GetCurrentAttack();
        const elapsed = attack ? attack.duration - this.stateTimer : 0;
        return Boolean(attack && !this.hitOnce && elapsed >= attack.activeStart && elapsed <= attack.activeEnd);
    }
    CanCancel() {
        const attack = this.GetCurrentAttack();
        return Boolean(attack && attack.duration - this.stateTimer >= attack.activeEnd);
    }
    GetCurrentAttack() { return FighterAttacks[this.currentAttackName] ?? null; }
    GetAttackBox() {
        const attack = this.GetCurrentAttack();
        return { x: this.position.x + (this.facingRight ? 18 : -18 - attack.range),
            y: this.position.y + attack.yOffset, width: attack.range, height: attack.height };
    }
    GetHurtBox() { const height=this.command.crouch&&this.IsGrounded()?this.size.y*0.65:this.size.y;return { x: this.position.x - this.size.x / 2, y: this.position.y - height, width: this.size.x, height }; }
}
