/**
 * @doc BattleState
 * @summary Estado compartilhado entre o mapa tático e a batalha.
 *          Funciona como uma "cola" entre os dois níveis do LevelHandler.
 */
export const BattleState = {
    initialized: false,   // Garante que as unidades só são criadas uma vez
    playerUnit:  null,    // Referência viva da unidade do player
    enemyUnit:   null,    // Referência viva da unidade do inimigo
    result:      null,    // "PLAYER_WIN" | "ENEMY_WIN" | null
};
