import { Vector2D } from 'gameforgejs/core';

// Adapter for CombatResolver2D: keep foot-anchored fighting bounds in the demo.
export class FighterBoxes {
    constructor(fighter) { this.fighter = fighter; this.targets = new Set(); }
    ResetHitMemory() { this.targets.clear(); }
    GetHitBoxes() {
        const fighter = this.fighter;
        const attack = fighter.GetCurrentAttack();
        if (!fighter.CanHit() || attack.projectile) return [];
        return [{ ...this.Rectangle(fighter.GetAttackBox()), ...attack }];
    }
    GetHurtBoxes() { return this.fighter.IsInvulnerable() ? [] : [this.Rectangle(this.fighter.GetHurtBox())]; }
    HasHit(_hit, target) { return this.targets.has(target); }
    MarkHit(_hit, target) { this.targets.add(target); }
    Rectangle(box) { return { position: new Vector2D(box.x, box.y), size: new Vector2D(box.width, box.height) }; }
}
