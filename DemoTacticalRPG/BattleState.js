export const BattleState = {
    initialized: false,
    playerUnit: null,
    enemyUnit: null,
    enemies: [],
    encounterActive: false,
    result: null,

    StartEncounter(playerUnit, enemyUnit) {
        if (!playerUnit?.IsAlive?.() || !enemyUnit?.IsAlive?.()) {
            this.encounterActive = false;
            return false;
        }

        this.playerUnit = playerUnit;
        this.enemyUnit = enemyUnit;
        this.result = null;
        this.encounterActive = true;
        return true;
    },

    FinishEncounter(result) {
        this.result = result;
        this.encounterActive = false;
    },

    CanStartBattle() {
        return this.encounterActive &&
            this.playerUnit?.IsAlive?.() &&
            this.enemyUnit?.IsAlive?.();
    },

    ClearResult() {
        this.result = null;
    },

    ResetAll() {
        this.playerUnit?.Reset?.();
        this.enemies.forEach(enemy => enemy.Reset?.());
        this.enemyUnit = this.enemies[0] ?? null;
        this.result = null;
        this.encounterActive = false;
    },
};
