/**
 * @doc TacticalMapLevel
 * @summary Mapa tático de grade com movimento suave usando MathExt.LerpSnap.
 *          Cada unidade tem posição lógica (col/row) e posição visual (pixelX/Y).
 *          O input só é aceito quando a animação de movimento terminar.
 *
 * Controles:
 *   Setas     → mover cursor
 *   Z / Space → confirmar seleção / destino
 *   X / Esc   → cancelar
 */
import { Level } from "../Template/Level.js";
import { Screen } from "../Window/Screen.js";
import { Draw } from "../Graphic/Draw.js";
import { MathExt } from "../Math/MathExt.js";
import { GridUnit } from "./GridUnit.js";
import { BattleState } from "./BattleState.js";
import { ActionManager } from "../Input/ActionManager.js";

const W = 640, H = 480;
const COLS = 10, ROWS = 7, CELL = 60;
const OX = 20, OY = 10;
const MOVE_SPEED = 12;

const PHASE = {
    PLAYER_SELECT: "PLAYER_SELECT",
    PLAYER_MOVE: "PLAYER_MOVE",
    ANIMATING: "ANIMATING",
    ENEMY_WAIT: "ENEMY_WAIT",
};

function tileToPixel(col, row) {
    return { x: OX + col * CELL + CELL / 2, y: OY + row * CELL + CELL / 2 };
}

export class TacticalMapLevel extends Level {
    constructor() {
        super();
        this.caption = "FFT Demo - Mapa Tático";
        this.TelaId = "TacticalMap";
    }

    OnStart() {
        this.screen = new Screen("TacticalMap", W, H);
        this.draw = new Draw(this.screen); // Usando a nossa API de Desenho!

        if (!BattleState.initialized) {
            BattleState.playerUnit = new GridUnit(1, 3, {
                name: "Herói", color: "#4488FF", hp: 30, attack: 10, defense: 3, moveRange: 3
            });
            BattleState.enemyUnit = new GridUnit(8, 3, {
                name: "Inimigo", color: "#FF4444", hp: 25, attack: 8, defense: 2, moveRange: 2
            });
            BattleState.initialized = true;
        }

        this.player = BattleState.playerUnit;
        this.enemy = BattleState.enemyUnit;

        this._syncPixelPos(this.player);
        this._syncPixelPos(this.enemy);

        this.message = "Selecione o Herói (Z)";

        if (BattleState.result === "PLAYER_WIN") {
            this.message = "Vitória! Inimigo derrotado!";
            BattleState.result = null;
        } else if (BattleState.result === "ENEMY_WIN") {
            this.player.Reset();
            this.enemy.Reset();
            this._syncPixelPos(this.player);
            this._syncPixelPos(this.enemy);
            this.message = "Derrota... Recomeçando!";
            BattleState.result = null;
        }

        this.cursor = { col: this.player.col, row: this.player.row };
        this.phase = PHASE.PLAYER_SELECT;
        this.reachable = [];
        this.enemyTimer = 0;
        this._animUnit = null;
        this._animCallback = null;

        super.OnStart();
    }

    OnExit() {
        if (this.screen?.Canvas) this.screen.Canvas.remove();
    }

    _syncPixelPos(unit) {
        const p = tileToPixel(unit.col, unit.row);
        unit.pixelX = p.x;
        unit.pixelY = p.y;
    }

    _startMove(unit, targetCol, targetRow, onComplete) {
        unit.col = targetCol;
        unit.row = targetRow;
        this._animUnit = unit;
        this._animTarget = tileToPixel(targetCol, targetRow);
        this._animCallback = onComplete;
        this.phase = PHASE.ANIMATING;
    }

    _updateAnimation(dt) {
        if (!this._animUnit) return;
        const t = MOVE_SPEED * dt;
        this._animUnit.pixelX = MathExt.LerpSnap(this._animUnit.pixelX, this._animTarget.x, t);
        this._animUnit.pixelY = MathExt.LerpSnap(this._animUnit.pixelY, this._animTarget.y, t);

        if (this._animUnit.pixelX === this._animTarget.x && this._animUnit.pixelY === this._animTarget.y) {
            const cb = this._animCallback;
            this._animUnit = null;
            this._animCallback = null;
            if (cb) cb();
        }
    }

    _getReachable(unit) {
        const visited = new Set([`${unit.col},${unit.row}`]);
        const queue = [{ col: unit.col, row: unit.row, steps: 0 }];
        const result = [];

        while (queue.length > 0) {
            const { col, row, steps } = queue.shift();
            if (steps > 0) result.push({ col, row });
            if (steps >= unit.moveRange) continue;

            for (const [dc, dr] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
                const nc = col + dc, nr = row + dr;
                const key = `${nc},${nr}`;
                if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && !visited.has(key)) {
                    visited.add(key);
                    queue.push({ col: nc, row: nr, steps: steps + 1 });
                }
            }
        }
        return result;
    }

    _isReachable(col, row) {
        return this.reachable.some(t => t.col === col && t.row === row);
    }

    OnUpdate(dt) {
        super.OnUpdate(dt);

        if (this.phase === PHASE.ANIMATING) {
            this._updateAnimation(dt);
            return;
        }

        if (this.phase === PHASE.ENEMY_WAIT) {
            this.enemyTimer -= dt;
            if (this.enemyTimer <= 0) this._doEnemyTurn();
            return;
        }

        // ADAPTAÇÃO: Usar IsActionDown para o cursor não correr rápido demais!
        if (ActionManager.IsActionDown("UP")) this.cursor.row = Math.max(0, this.cursor.row - 1);
        if (ActionManager.IsActionDown("DOWN")) this.cursor.row = Math.min(ROWS - 1, this.cursor.row + 1);
        if (ActionManager.IsActionDown("LEFT")) this.cursor.col = Math.max(0, this.cursor.col - 1);
        if (ActionManager.IsActionDown("RIGHT")) this.cursor.col = Math.min(COLS - 1, this.cursor.col + 1);

        const confirm = ActionManager.IsActionDown("ATTACK"); // Assumindo ATTACK como "Confirmar"
        const cancel = ActionManager.IsActionDown("JUMP");    // Assumindo JUMP como "Cancelar/Voltar"

        if (this.phase === PHASE.PLAYER_SELECT) {
            if (confirm && this.cursor.col === this.player.col && this.cursor.row === this.player.row) {
                this.reachable = this._getReachable(this.player);
                this.phase = PHASE.PLAYER_MOVE;
                this.message = "Escolha o destino (Z: mover | X: cancelar)";
            }
        }
        else if (this.phase === PHASE.PLAYER_MOVE) {
            if (cancel) {
                this.reachable = [];
                this.phase = PHASE.PLAYER_SELECT;
                this.message = "Selecione o Herói (Z)";
            }

            if (confirm) {
                const { col, row } = this.cursor;

                if (col === this.enemy.col && row === this.enemy.row && this.enemy.IsAlive() && this._isReachable(col, row)) {
                    this.reachable = [];
                    const adjCol = this.player.col + Math.sign(col - this.player.col);
                    const adjRow = this.player.row + Math.sign(row - this.player.row);
                    this._startMove(this.player, adjCol, adjRow, () => this._triggerBattle());
                    return;
                }

                if (this._isReachable(col, row)) {
                    this.reachable = [];
                    this._startMove(this.player, col, row, () => {
                        this.phase = PHASE.ENEMY_WAIT;
                        this.enemyTimer = 0.6;
                        this.message = "Turno do inimigo...";
                    });
                }
            }
        }
    }

    _doEnemyTurn() {
        const dx = Math.sign(this.player.col - this.enemy.col);
        const dy = Math.sign(this.player.row - this.enemy.row);

        for (const [dc, dr] of (dx !== 0 ? [[dx, 0], [0, dy]] : [[0, dy], [dx, 0]])) {
            if (dc === 0 && dr === 0) continue;
            const nc = this.enemy.col + dc;
            const nr = this.enemy.row + dr;
            if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;

            if (nc === this.player.col && nr === this.player.row) {
                this._startMove(this.enemy, nc, nr, () => this._triggerBattle());
                return;
            }

            this._startMove(this.enemy, nc, nr, () => {
                this.phase = PHASE.PLAYER_SELECT;
                this.message = "Selecione o Herói (Z)";
            });
            return;
        }
        this.phase = PHASE.PLAYER_SELECT;
        this.message = "Selecione o Herói (Z)";
    }

    _triggerBattle() {
        BattleState.playerUnit = this.player;
        BattleState.enemyUnit = this.enemy;
        this.Next = true;
    }

    OnDrawn() {
        this.screen.Refresh();

        // Desenhando a Grade usando This.Draw
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const x = OX + c * CELL;
                const y = OY + r * CELL;
                const isReachable = this._isReachable(c, r);
                const isEnemyTile = this.enemy.IsAlive() && c === this.enemy.col && r === this.enemy.row;
                const isCursor = this.cursor.col === c && this.cursor.row === r;

                // Fundo da célula
                this.draw.Style = this.draw.TYPES.FILLED;
                if (isReachable && isEnemyTile) this.draw.Color = "#5A1A1A";
                else if (isReachable) this.draw.Color = "#1A3A5C";
                else this.draw.Color = (r + c) % 2 === 0 ? "#2C4A2C" : "#1E361E";
                this.draw.DrawRect(x, y, CELL, CELL);

                // Borda da célula
                this.draw.Style = this.draw.TYPES.STROKED;
                this.draw.Color = "#000000";
                this.draw.DrawRect(x, y, CELL, CELL);

                // Cursor Tático
                if (isCursor) {
                    this.draw.Color = "#FFFF00";
                    this.draw.DrawRect(x + 2, y + 2, CELL - 4, CELL - 4);
                }
            }
        }

        this._drawMapUnit(this.player);
        if (this.enemy.IsAlive()) this._drawMapUnit(this.enemy);
    }

    _drawMapUnit(unit) {
        const half = CELL / 2 - 8;
        const x = unit.pixelX - half;
        const y = unit.pixelY - half;
        const size = half * 2;

        this.draw.Style = this.draw.TYPES.FILLED;

        // Corpo da Unidade
        this.draw.Color = unit.color;
        this.draw.DrawRect(x, y, size, size);

        // Detalhe de iluminação
        this.draw.Color = "rgba(255,255,255,0.2)";
        this.draw.DrawRect(x + 2, y + 2, size / 3, size - 4);

        // Nome
        this.draw.Color = "#FFFFFF";
        this.draw.Font = "bold 10px monospace";
        this.draw.SetTextAlign("center");
        this.draw.DrawText(unit.name, unit.pixelX, unit.pixelY + 4);

        // Barra de Vida
        const bx = unit.pixelX - half;
        const by = unit.pixelY + half - 6;
        const pct = unit.hp / unit.maxHp;

        this.draw.Color = "#111111";
        this.draw.DrawRect(bx, by, size, 5);

        this.draw.Color = pct > 0.5 ? "#44FF44" : pct > 0.25 ? "#FFAA00" : "#FF3333";
        this.draw.DrawRect(bx, by, size * pct, 5);
    }

    OnGUI() {
        const barY = OY + ROWS * CELL + 4;

        this.draw.Style = this.draw.TYPES.FILLED;
        this.draw.Color = "rgba(0,0,0,0.85)";
        this.draw.DrawRect(0, barY, W, H - barY);

        this.draw.Color = "#FFFFFF";
        this.draw.Font = "14px monospace";
        this.draw.SetTextAlign("left");
        this.draw.DrawText(this.message, 10, barY + 22);

        this.draw.Color = "#888888";
        this.draw.Font = "11px monospace";
        this.draw.DrawText("Setas: cursor | Z: confirmar | X: cancelar", 10, barY + 42);

        this.draw.Color = "#AAAAAA";
        this.draw.SetTextAlign("right");
        this.draw.DrawText(`FPS: ${this.FPS}`, W - 10, barY + 22);

        if (this.phase === PHASE.PLAYER_MOVE) {
            this.draw.SetTextAlign("left");
            this.draw.Color = "#1A3A5C";
            this.draw.DrawRect(W - 180, barY + 8, 14, 14);

            this.draw.Color = "#CCCCCC";
            this.draw.DrawText("Alcançável", W - 160, barY + 20);

            this.draw.Color = "#5A1A1A";
            this.draw.DrawRect(W - 180, barY + 26, 14, 14);

            this.draw.Color = "#CCCCCC";
            this.draw.DrawText("Atacar", W - 160, barY + 38);
        }
    }
}