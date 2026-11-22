/**
 * Stateless hitbox-versus-hurtbox resolver for data-driven 2D combat.
 */
export class CombatResolver2D {
    /**
     * Finds new attack contacts and emits optional game-owned hit handling.
     * @param {BoxController2D} attackerBoxes - Attacking entity boxes.
     * @param {BoxController2D|BoxController2D[]} defenderBoxesList - Potential defenders.
     * @param {Object} [options={}] - Default hit values and `onHit` callback.
     * @returns {Object[]} Resolved hit records.
     */
    static Resolve(attackerBoxes: BoxController2D, defenderBoxesList: BoxController2D | BoxController2D[], options?: any): any[];
    static Intersects(boxA: any, boxB: any): boolean;
    static IntersectsAny(boxesA: any, boxesB: any): any;
    static GetImpactPoint(boxA: any, boxB: any): {
        x: number;
        y: number;
    };
}
