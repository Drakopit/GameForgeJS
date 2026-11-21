import { ObjectPool, Engine, Vector2D } from 'gameforgejs/core';
import { CombatResolver2D } from 'gameforgejs/2d';
import { EnergyProjectile } from '../entities/EnergyProjectile.js';
import { CombatSettings as Settings, FighterSettings } from '../data/FightingSettings.js';

export class FightingCombat {
    constructor(level) {
        this.level = level;
        this.projectiles = new ObjectPool(() => level.AddEntity(new EnergyProjectile(level.screen)), Settings.projectilePoolSize);
    }
    CanFire(owner) {
        const active = this.projectiles.pool.filter(shot => shot.active);
        return active.length < Settings.maxProjectiles && !active.some(shot => shot.owner === owner);
    }
    Fire(owner, attack) {
        if (!this.CanFire(owner)) return false;
        this.projectiles.Get().Fire(owner, attack);
        this.level.sound?.Play('shot');
        return true;
    }
    Clear() { for (const shot of this.projectiles.pool) shot.active = false; }
    Resolve() {
        const fighters = this.level.fighters;
        // Collect both contacts before applying damage so simultaneous active hits can trade.
        const hits = fighters.flatMap(attacker => CombatResolver2D.Resolve(attacker.boxes, attacker.opponent.boxes)
            .map(hit => ({ attacker, defender: attacker.opponent, attack: hit.hitbox, position: hit.position })));
        for (const hit of hits) this.ApplyHit(hit.attacker, hit.defender, hit.attack, hit.position);
        const active = this.projectiles.pool.filter(shot => shot.active);
        for (const shot of active) {
            if (!shot.active) continue;
            const rival = active.find(other => other.active && other.owner !== shot.owner
                && CombatResolver2D.Intersects(shot.GetSweepBox(), other.GetSweepBox()));
            if (rival) {
                if (shot.attack.rank <= rival.attack.rank) shot.active = false;
                if (rival.attack.rank <= shot.attack.rank) rival.active = false;
                this.level.effects.Impact(shot.position, '#bdfbff', true);
                if (!shot.active) continue;
            }
            const defender = shot.owner.opponent;
            if (defender.IsInvulnerable()) continue;
            const hurt = defender.GetHurtBox();
            const hurtBox = { position: new Vector2D(hurt.x, hurt.y), size: new Vector2D(hurt.width, hurt.height) };
            if (CombatResolver2D.Intersects(shot.GetSweepBox(), hurtBox)) {
                this.ApplyHit(shot.owner, defender, shot.attack, shot.position, shot.direction);
                shot.active = false;
            }
        }
    }
    ApplyHit(attacker, defender, attack, position, direction = attacker.facingRight ? 1 : -1) {
        const blocked = defender.IsBlocking({ position: { x: defender.position.x - direction } },attack);
        const damage = Math.ceil(attack.damage * attacker.stats.damageMult * (blocked ? Settings.chipRatio : 1));
        defender.TakeHit({ damage, direction, blocked, knockback: attack.knockback * (blocked ? Settings.blockPush : 1),
            hitStun: blocked ? Settings.blockStun : attack.hitStun,knockdown:attack.knockdown });
        attacker.OnHit(attack.meterGain, blocked);
        this.level.sound?.Play(blocked ? 'select' : 'hit');
        this.level.effects.Impact(position, blocked ? '#75d7ff' : attacker.tint, blocked);
        this.level.effects.Shake(blocked ? 2 : attack.shake);
        Engine.HitStop(blocked ? Settings.blockHitStop : attack.hitStop);
    }
    ResolvePush() {
        const [one, two] = this.level.fighters;
        if (Math.abs(one.position.y - two.position.y) > FighterSettings.crossupHeight) return;
        const distance = two.position.x - one.position.x;
        const overlap = FighterSettings.pushRadius * 2 - Math.abs(distance);
        if (overlap <= 0) return;
        const direction = distance >= 0 ? 1 : -1;
        one.position.x -= direction * overlap / 2; two.position.x += direction * overlap / 2;
        for (const fighter of [one, two]) fighter.position.x = Math.max(this.level.arena.left + FighterSettings.pushRadius,
            Math.min(this.level.arena.right - FighterSettings.pushRadius, fighter.position.x));
    }
}
