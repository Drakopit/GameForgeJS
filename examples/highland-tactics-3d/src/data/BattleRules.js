export const Facings = Object.freeze([
    { name: 'NORTH', col: 0, row: -1 }, { name: 'EAST', col: 1, row: 0 },
    { name: 'SOUTH', col: 0, row: 1 }, { name: 'WEST', col: -1, row: 0 },
]);
export const Commands = Object.freeze(['MOVE', 'ACT / STRIKE', 'ACT / SPARK', 'WAIT / FACE']);
export const MapScale = Object.freeze({ tile: 1.15, base: 0.45, elevation: 0.55 });
/** Deterministic previews and resolution use exactly the same rules. */
export class BattleRules {
    static Facing(from, to) {
        const dx = to.col - from.col, dz = to.row - from.row;
        return Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 1 : 3) : (dz > 0 ? 2 : 0);
    }
    static Preview(grid, attacker, defender, ability = 'strike') {
        const source = grid.Get(attacker.col, attacker.row), target = grid.Get(defender.col, defender.row);
        const direction = Facings[defender.facing];
        const dx = attacker.col - defender.col, dz = attacker.row - defender.row;
        const length = Math.max(1, Math.hypot(dx, dz));
        const dot = (dx * direction.col + dz * direction.row) / length;
        const side = dot > 0.5 ? 'FRONT' : dot < -0.5 ? 'BACK' : 'SIDE';
        const elevation = Math.max(-2, Math.min(2, source.h - target.h));
        const chance = Math.max(50, Math.min(100, (side === 'BACK' ? 100 : side === 'SIDE' ? 95 : 85) + elevation * 3));
        const damage = Math.max(1, Math.round((attacker.attack - (defender.exposed ? 0 : 3) + elevation * 2 + (ability === 'spark' ? 2 : 0)) * (side === 'BACK' ? 1.35 : side === 'SIDE' ? 1.15 : 1)));
        return { chance, damage, side, elevation };
    }
    static CanAttack(grid, attacker, defender, ability = 'strike') {
        if (attacker.hp <= 0 || defender.hp <= 0 || attacker.team === defender.team)
            return false;
        const distance = Math.abs(attacker.col - defender.col) + Math.abs(attacker.row - defender.row);
        const source = grid.Get(attacker.col, attacker.row), target = grid.Get(defender.col, defender.row);
        if (distance === 0 || !source || !target) return false;
        const height = Math.abs(source.h - target.h);
        return distance <= (ability === 'spark' ? 3 : 1) && height <= (ability === 'spark' ? 3 : 1)
            && (ability !== 'spark' || attacker.energy > 0) && grid.CanSee(attacker, defender);
    }
}
