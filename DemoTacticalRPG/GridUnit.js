/**
 * @doc GridUnit
 * @summary Unidade base do RPG Tático. Guarda stats, posição no grid e HP.
 */
export class GridUnit {
    constructor(col, row, config = {}) {
        this.col       = col;
        this.row       = row;
        this.startCol  = col; // Posição inicial para resetar
        this.startRow  = row;
        this.name      = config.name      ?? "Unit";
        this.color     = config.color     ?? "#FFFFFF";
        this.hp        = config.hp        ?? 20;
        this.maxHp     = this.hp;
        this.attack    = config.attack    ?? 8;
        this.defense   = config.defense   ?? 2;
        this.moveRange = config.moveRange ?? 3;
        this.active    = true;
    }

    /**
     * Calcula e aplica o dano de um atacante.
     * @param {GridUnit} attacker
     * @returns {number} dano aplicado
     */
    TakeDamage(attacker) {
        const roll = Math.floor(Math.random() * 4); // ±0~3 de variação
        const dmg  = Math.max(1, attacker.attack - this.defense + roll);
        this.hp    = Math.max(0, this.hp - dmg);
        if (this.hp <= 0) this.active = false;
        return dmg;
    }

    IsAlive() {
        return this.hp > 0;
    }

    /** Restaura HP e posição para o início da partida. */
    Reset() {
        this.hp     = this.maxHp;
        this.active = true;
        this.col    = this.startCol;
        this.row    = this.startRow;
    }
}
