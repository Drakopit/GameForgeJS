import { CpuSettings as Settings } from '../data/FightingSettings.js';

export class FightingCPU {
    constructor(random = Math.random) { this.random = random; this.Reset(); }
    Reset() { this.remaining = 0; this.plan = {}; }
    Read(fighter, dt, projectiles) {
        this.remaining -= dt;
        if (this.remaining > 0) return { left: this.plan.left, right: this.plan.right, down: this.plan.down };
        this.remaining = Settings.reactionMin + this.random() * Settings.reactionSpread;
        this.plan = this.Decide(fighter, projectiles);
        return this.plan;
    }
    Decide(fighter, projectiles) {
        const opponent = fighter.opponent;
        const distance = opponent.position.x - fighter.position.x;
        const gap = Math.abs(distance);
        const roll = this.random();
        const incoming = projectiles.some(shot => shot.active && shot.owner !== fighter
            && Math.abs(shot.position.x - fighter.position.x) < Settings.projectileDanger
            && Math.sign(fighter.position.x - shot.position.x) === shot.direction);
        if (incoming) return roll < Settings.jumpChance ? { up: true } : { down: true };
        if (fighter.hitOnce && fighter.currentAttackName === 'light') return { heavy: true };
        if (fighter.hitOnce && fighter.currentAttackName === 'heavy') return { special: true };
        if (gap < Settings.guardDistance && opponent.GetCurrentAttack() && !opponent.CanCancel() && roll < Settings.blockChance) return { down: true };
        if (fighter.CanStartAttack('super') && gap > Settings.punishDistance && gap < Settings.powerMaxDistance && roll < Settings.superChance) return { super: true };
        if (gap > Settings.powerMinDistance && gap < Settings.powerMaxDistance && fighter.CanStartAttack('special') && roll < Settings.powerChance) return { special: true };
        if (gap > Settings.meleeDistance) return { left: distance < 0, right: distance > 0 };
        if (opponent.state === 'hurt' || opponent.CanCancel()) return { heavy: true };
        if (roll < Settings.closeGuardChance) return { down: true };
        return roll < Settings.lightChance ? { light: true } : { heavy: true };
    }
}
