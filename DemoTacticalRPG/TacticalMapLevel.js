import { Level } from "../Template/Level.js";
import { Screen } from "../Window/Screen.js";
import { Draw } from "../Graphic/Draw.js";
import { MathExt } from "../Math/MathExt.js";
import { aStar } from "../Pathfinding/AStar.js";
import { ActionManager } from "../Input/ActionManager.js";
import { BATTLE_MODES, BattleState } from "./BattleState.js";
import { GridUnit } from "./GridUnit.js";

const W = 640;
const H = 480;
const COLS = 10;
const ROWS = 7;
const CELL = 60;
const OX = 20;
const OY = 10;
const MOVE_SPEED = 12;

const PHASE = {
    SELECT_UNIT: "SELECT_UNIT",
    MOVE_TARGET: "MOVE_TARGET",
    ACTION_MENU: "ACTION_MENU",
    ACTION_TARGET: "ACTION_TARGET",
    ANIMATING: "ANIMATING",
};

const BLOCKED_TILES = new Set([
    "4,2",
    "4,3",
    "4,4",
    "5,4",
]);

function TileKey(col, row) {
    return `${col},${row}`;
}

function TileToPixel(col, row) {
    return {
        x: OX + col * CELL + CELL / 2,
        y: OY + row * CELL + CELL / 2,
    };
}

function Manhattan(a, b) {
    return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
}

export class TacticalMapLevel extends Level {
    constructor() {
        super();
        this.caption = "Tactical RPG - Tactical Map";
        this.TelaId = "TacticalMap";
    }

    OnStart() {
        this.screen = new Screen("TacticalMap", W, H);
        this.draw = new Draw(this.screen);

        this._ensureBattleState();
        this.player = BattleState.playerUnit;
        this.enemies = BattleState.enemies;

        this._syncPixelPos(this.player);
        this.enemies.forEach(enemy => this._syncPixelPos(enemy));

        this.cursor = { col: this.player.col, row: this.player.row };
        this.phase = PHASE.SELECT_UNIT;
        this.moveArea = [];
        this.actionArea = [];
        this.actionOptions = this._buildActionOptions();
        this.selectedActionIndex = 0;
        this.selectedAction = null;
        this.pathPreview = [];
        this.floatText = { value: 0, col: 0, row: 0, timer: 0, color: "#FFFFFF" };
        this._pathQueue = [];
        this._animUnit = null;
        this._animTarget = null;
        this._animCallback = null;
        this.message = `Modo ${this._battleModeLabel()}. Selecione o Hero com Z.`;

        this._handleBattleReturn();
        super.OnStart();
    }

    OnExit() {
        if (this.screen?.Canvas) this.screen.Canvas.remove();
    }

    _ensureBattleState() {
        if (BattleState.initialized) return;

        const player = new GridUnit(1, 3, {
            name: "Hero",
            color: "#4488FF",
            hp: 30,
            attack: 10,
            defense: 3,
            moveRange: 3,
            attackRange: 1,
        });

        const enemy = new GridUnit(8, 3, {
            name: "Enemy",
            color: "#FF4444",
            hp: 25,
            attack: 8,
            defense: 2,
            moveRange: 2,
            attackRange: 1,
        });

        BattleState.playerUnit = player;
        BattleState.enemyUnit = enemy;
        BattleState.enemies = [enemy];
        BattleState.initialized = true;
    }

    _handleBattleReturn() {
        if (BattleState.result === "PLAYER_WIN") {
            this.message = this._hasLivingEnemies()
                ? "Inimigo derrotado. Selecione o Hero com Z."
                : "Vitoria! Todos os inimigos foram derrotados.";
            BattleState.ClearResult();
        } else if (BattleState.result === "ROUND_END") {
            this.message = "Troca de golpes resolvida. Selecione o Hero com Z.";
            BattleState.ClearResult();
        } else if (BattleState.result === "ENEMY_WIN") {
            BattleState.ResetAll();
            this.player = BattleState.playerUnit;
            this.enemies = BattleState.enemies;
            this._syncPixelPos(this.player);
            this.enemies.forEach(enemy => this._syncPixelPos(enemy));
            this.cursor = { col: this.player.col, row: this.player.row };
            this.message = "Derrota. As unidades foram reiniciadas.";
            BattleState.ClearResult();
        }
    }

    _buildActionOptions() {
        return [
            {
                id: "attack",
                label: "Atacar",
                range: this.player?.attackRange ?? 1,
                color: "rgba(255, 72, 72, 0.42)",
                verb: "ataca",
                bonus: 0,
            },
            {
                id: "magic",
                label: "Magia",
                range: 3,
                color: "rgba(142, 96, 255, 0.38)",
                verb: "conjura",
                bonus: 5,
            },
            {
                id: "wait",
                label: "Esperar",
            },
        ];
    }

    _isFftMode() {
        return BattleState.battleMode === BATTLE_MODES.FINAL_FANTASY_TACTICS;
    }

    _battleModeLabel() {
        return this._isFftMode() ? "Final Fantasy Tactics" : "Fire Emblem";
    }

    _syncPixelPos(unit) {
        const p = TileToPixel(unit.col, unit.row);
        unit.pixelX = p.x;
        unit.pixelY = p.y;
    }

    _isInside(col, row) {
        return col >= 0 && row >= 0 && col < COLS && row < ROWS;
    }

    _isBlocked(col, row) {
        return BLOCKED_TILES.has(TileKey(col, row));
    }

    _hasLivingEnemies() {
        return this.enemies.some(enemy => enemy.IsAlive());
    }

    _findLivingEnemyAt(col, row) {
        return this.enemies.find(enemy => enemy.IsAlive() && enemy.IsAt(col, row)) ?? null;
    }

    _readCursorInput() {
        let dc = 0;
        let dr = 0;

        if (ActionManager.IsActionDown("UP")) dr = -1;
        else if (ActionManager.IsActionDown("DOWN")) dr = 1;
        else if (ActionManager.IsActionDown("LEFT")) dc = -1;
        else if (ActionManager.IsActionDown("RIGHT")) dc = 1;

        if (dc === 0 && dr === 0) return;

        this.cursor.col = Math.max(0, Math.min(COLS - 1, this.cursor.col + dc));
        this.cursor.row = Math.max(0, Math.min(ROWS - 1, this.cursor.row + dr));
        this._refreshPathPreview();
    }

    _buildPathGrid({ includeEnemies = true } = {}) {
        const grid = Array.from({ length: COLS }, () => Array.from({ length: ROWS }, () => 0));

        for (const key of BLOCKED_TILES) {
            const [col, row] = key.split(",").map(Number);
            grid[col][row] = 1;
        }

        if (includeEnemies) {
            for (const enemy of this.enemies) {
                if (enemy.IsAlive()) {
                    grid[enemy.col][enemy.row] = 1;
                }
            }
        }

        grid[this.player.col][this.player.row] = 0;
        return grid;
    }

    _findPathTo(targetCol, targetRow) {
        if (!this._isInside(targetCol, targetRow) || this._isBlocked(targetCol, targetRow)) {
            return null;
        }

        const enemyOnTarget = this._findLivingEnemyAt(targetCol, targetRow);
        if (enemyOnTarget) return null;

        return aStar(
            this._buildPathGrid(),
            { x: this.player.col, y: this.player.row },
            { x: targetCol, y: targetRow }
        );
    }

    _computeMoveArea(unit) {
        const area = [{ col: unit.col, row: unit.row, cost: 0 }];

        for (let col = 0; col < COLS; col++) {
            for (let row = 0; row < ROWS; row++) {
                if (col === unit.col && row === unit.row) continue;

                const path = this._findPathTo(col, row);
                if (!path) continue;

                const cost = path.length - 1;
                if (cost <= unit.moveRange) {
                    area.push({ col, row, cost });
                }
            }
        }

        return area;
    }

    _computeActionArea(unit, range = unit.attackRange ?? 1) {
        const area = [];

        for (let col = 0; col < COLS; col++) {
            for (let row = 0; row < ROWS; row++) {
                const distance = Manhattan(unit, { col, row });
                if (distance > 0 && distance <= range) {
                    area.push({ col, row });
                }
            }
        }

        return area;
    }

    _isInArea(area, col, row) {
        return area.some(tile => tile.col === col && tile.row === row);
    }

    _selectPlayer() {
        this.moveArea = this._computeMoveArea(this.player);
        this.actionArea = [];
        this.selectedAction = null;
        this.pathPreview = [];
        this.phase = PHASE.MOVE_TARGET;
        this.message = "Area azul: movimento. Escolha destino com Z. X cancela.";
        this._refreshPathPreview();
    }

    _confirmMoveTarget() {
        const { col, row } = this.cursor;
        if (!this._isInArea(this.moveArea, col, row)) {
            this.message = "Destino fora da area de movimento.";
            return;
        }

        const path = this._findPathTo(col, row);
        if (!path || path.length < 1 || path.length - 1 > this.player.moveRange) {
            this.message = "Caminho invalido.";
            return;
        }

        this.moveArea = [];
        this.pathPreview = path.slice(1);
        this._startPathMove(this.player, path, () => {
            this.pathPreview = [];
            this._openPostMoveAction();
        });
    }

    _openPostMoveAction() {
        this.actionOptions = this._buildActionOptions();

        if (this._isFftMode()) {
            this.selectedActionIndex = 0;
            this.selectedAction = null;
            this.actionArea = [];
            this.phase = PHASE.ACTION_MENU;
            this.message = "Escolha acao no mapa. Atacar e Magia resolvem sem trocar de tela.";
            return;
        }

        this._openActionTarget(this.actionOptions[0]);
        this.message = "Area vermelha: escolha alvo. Z abre arena Fire Emblem. X encerra.";
    }

    _openActionTarget(action) {
        this.selectedAction = action;
        this.actionArea = this._computeActionArea(this.player, action.range ?? this.player.attackRange ?? 1);
        this.phase = PHASE.ACTION_TARGET;
        this.message = action.id === "magic"
            ? "Area roxa: escolha alvo para magia. X volta ao menu."
            : "Area vermelha: escolha alvo para ataque. X volta.";
    }

    _confirmActionMenu() {
        const action = this.actionOptions[this.selectedActionIndex];

        if (action.id === "wait") {
            this._endTurn("Turno encerrado. Selecione o Hero com Z.");
            return;
        }

        this._openActionTarget(action);
    }

    _confirmActionTarget() {
        const { col, row } = this.cursor;
        const enemy = this._findLivingEnemyAt(col, row);

        if (!this._isInArea(this.actionArea, col, row)) {
            this.message = "Alvo fora da area de acao.";
            return;
        }

        if (!enemy) {
            this.message = "Nenhum inimigo nesse tile.";
            return;
        }

        if (this._isFftMode()) {
            this._resolveMapAction(enemy);
            return;
        }

        if (BattleState.StartEncounter(this.player, enemy)) {
            this.Next = true;
        }
    }

    _resolveMapAction(enemy) {
        const action = this.selectedAction ?? this.actionOptions[0];
        const attacker = action.id === "magic"
            ? { attack: this.player.attack + (action.bonus ?? 0) }
            : this.player;
        const dmg = enemy.TakeDamage(attacker);

        this.floatText = {
            value: dmg,
            col: enemy.col,
            row: enemy.row,
            timer: 1.1,
            color: action.id === "magic" ? "#B694FF" : "#FFEE66",
        };

        this.message = enemy.IsAlive()
            ? `${this.player.name} ${action.verb} ${enemy.name}. ${dmg} de dano.`
            : `${enemy.name} derrotado por ${action.label.toLowerCase()}.`;

        this._endTurn(this.message);
    }

    _endTurn(message) {
        this.moveArea = [];
        this.actionArea = [];
        this.pathPreview = [];
        this.selectedAction = null;
        this.cursor = { col: this.player.col, row: this.player.row };
        this.phase = PHASE.SELECT_UNIT;
        this.message = message;
    }

    _cancelCurrentPhase() {
        if (this.phase === PHASE.MOVE_TARGET) {
            this.moveArea = [];
            this.pathPreview = [];
            this.cursor = { col: this.player.col, row: this.player.row };
            this._endTurn("Selecione o Hero com Z.");
            return;
        }

        if (this.phase === PHASE.ACTION_TARGET) {
            this.actionArea = [];
            if (this._isFftMode()) {
                this.phase = PHASE.ACTION_MENU;
                this.message = "Escolha uma acao ou Esperar.";
                return;
            }

            this._endTurn("Turno encerrado. Selecione o Hero com Z.");
        }
    }

    _updateActionMenu() {
        if (ActionManager.IsActionDown("CANCEL")) {
            this._endTurn("Acao cancelada. Selecione o Hero com Z.");
            return;
        }

        if (ActionManager.IsActionDown("UP")) {
            this.selectedActionIndex = (this.selectedActionIndex - 1 + this.actionOptions.length) % this.actionOptions.length;
        }

        if (ActionManager.IsActionDown("DOWN")) {
            this.selectedActionIndex = (this.selectedActionIndex + 1) % this.actionOptions.length;
        }

        if (ActionManager.IsActionDown("ATTACK")) {
            this._confirmActionMenu();
        }
    }

    _refreshPathPreview() {
        if (this.phase !== PHASE.MOVE_TARGET) return;

        const { col, row } = this.cursor;
        if (!this._isInArea(this.moveArea, col, row)) {
            this.pathPreview = [];
            return;
        }

        const path = this._findPathTo(col, row);
        this.pathPreview = path ? path.slice(1) : [];
    }

    _startPathMove(unit, path, onComplete) {
        this._pathQueue = path.slice(1);
        this._animUnit = unit;
        this._animCallback = onComplete;
        this.phase = PHASE.ANIMATING;
        this._advancePathStep();
    }

    _advancePathStep() {
        const next = this._pathQueue.shift();

        if (!next) {
            const callback = this._animCallback;
            this._animUnit = null;
            this._animTarget = null;
            this._animCallback = null;
            if (callback) callback();
            return;
        }

        this._animUnit.MoveTo(next.x, next.y);
        this._animTarget = TileToPixel(next.x, next.y);
    }

    _updateAnimation(dt) {
        if (!this._animUnit || !this._animTarget) return;

        const t = MOVE_SPEED * dt;
        this._animUnit.pixelX = MathExt.LerpSnap(this._animUnit.pixelX, this._animTarget.x, t);
        this._animUnit.pixelY = MathExt.LerpSnap(this._animUnit.pixelY, this._animTarget.y, t);

        if (this._animUnit.pixelX === this._animTarget.x && this._animUnit.pixelY === this._animTarget.y) {
            this._advancePathStep();
        }
    }

    OnUpdate(dt) {
        super.OnUpdate(dt);

        if (this.phase === PHASE.ANIMATING) {
            this._updateAnimation(dt);
            return;
        }

        if (this.floatText.timer > 0) {
            this.floatText.timer = Math.max(0, this.floatText.timer - dt);
        }

        if (!this._hasLivingEnemies()) {
            this.moveArea = [];
            this.actionArea = [];
            this.pathPreview = [];
            this.message = "Vitoria! Todos os inimigos foram derrotados.";
            return;
        }

        if (this.phase === PHASE.ACTION_MENU) {
            this._updateActionMenu();
            return;
        }

        this._readCursorInput();

        if (ActionManager.IsActionDown("CANCEL")) {
            this._cancelCurrentPhase();
            return;
        }

        if (!ActionManager.IsActionDown("ATTACK")) return;

        if (this.phase === PHASE.SELECT_UNIT) {
            if (this.player.IsAt(this.cursor.col, this.cursor.row)) {
                this._selectPlayer();
            } else {
                this.message = "Mova o cursor ate o Hero e pressione Z.";
            }
            return;
        }

        if (this.phase === PHASE.MOVE_TARGET) {
            this._confirmMoveTarget();
            return;
        }

        if (this.phase === PHASE.ACTION_TARGET) {
            this._confirmActionTarget();
        }
    }

    OnDrawn() {
        this.screen.Refresh();
        this._drawGrid();
        this._drawArea(this.moveArea, "rgba(62, 145, 255, 0.42)");
        this._drawArea(this.actionArea, this.selectedAction?.color ?? "rgba(255, 72, 72, 0.42)");
        this._drawPathPreview();
        this._drawUnit(this.player);
        this.enemies.filter(enemy => enemy.IsAlive()).forEach(enemy => this._drawUnit(enemy));
        this._drawMapDamageText();
        this._drawCursor();
    }

    _drawGrid() {
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const x = OX + col * CELL;
                const y = OY + row * CELL;
                const blocked = this._isBlocked(col, row);

                this.draw.Style = this.draw.TYPES.FILLED;
                this.draw.Color = blocked
                    ? "#20242C"
                    : (row + col) % 2 === 0 ? "#2C4A2C" : "#1E361E";
                this.draw.DrawRect(x, y, CELL, CELL);

                this.draw.Style = this.draw.TYPES.STROKED;
                this.draw.Color = "#0B130B";
                this.draw.DrawRect(x, y, CELL, CELL);
            }
        }
    }

    _drawArea(area, color) {
        if (!area.length) return;

        this.draw.Style = this.draw.TYPES.FILLED;
        this.draw.Color = color;
        for (const tile of area) {
            this.draw.DrawRect(OX + tile.col * CELL + 5, OY + tile.row * CELL + 5, CELL - 10, CELL - 10);
        }
    }

    _drawPathPreview() {
        if (!this.pathPreview.length) return;

        this.draw.Style = this.draw.TYPES.FILLED;
        this.draw.Color = "rgba(255, 226, 74, 0.75)";
        for (const step of this.pathPreview) {
            this.draw.DrawRect(OX + step.x * CELL + 18, OY + step.y * CELL + 18, CELL - 36, CELL - 36);
        }
    }

    _drawCursor() {
        const x = OX + this.cursor.col * CELL;
        const y = OY + this.cursor.row * CELL;

        this.draw.Style = this.draw.TYPES.STROKED;
        this.draw.Color = "#FFD84A";
        this.draw.DrawRect(x + 2, y + 2, CELL - 4, CELL - 4);
        this.draw.DrawRect(x + 5, y + 5, CELL - 10, CELL - 10);
        this.draw.Style = this.draw.TYPES.FILLED;
    }

    _drawUnit(unit) {
        const half = CELL / 2 - 8;
        const x = unit.pixelX - half;
        const y = unit.pixelY - half;
        const size = half * 2;

        this.draw.Style = this.draw.TYPES.FILLED;
        this.draw.Color = unit.color;
        this.draw.DrawRect(x, y, size, size);

        this.draw.Color = "rgba(255,255,255,0.2)";
        this.draw.DrawRect(x + 2, y + 2, size / 3, size - 4);

        this.draw.Color = "#FFFFFF";
        this.draw.FontSize = "10px";
        this.draw.Font = "monospace";
        this.draw.SetTextAlign("center");
        this.draw.DrawText(unit.name, unit.pixelX, unit.pixelY + 4);

        const barX = unit.pixelX - half;
        const barY = unit.pixelY + half - 6;
        const pct = Math.max(0, unit.hp / unit.maxHp);

        this.draw.Color = "#111111";
        this.draw.DrawRect(barX, barY, size, 5);

        this.draw.Color = pct > 0.5 ? "#44FF44" : pct > 0.25 ? "#FFAA00" : "#FF3333";
        this.draw.DrawRect(barX, barY, size * pct, 5);
    }

    _drawMapDamageText() {
        if (this.floatText.timer <= 0) return;

        const p = TileToPixel(this.floatText.col, this.floatText.row);
        const elapsed = 1.1 - this.floatText.timer;
        const y = p.y - 30 - elapsed * 28;
        const alpha = Math.min(1, this.floatText.timer);

        this.screen.Context.globalAlpha = alpha;
        this.draw.Color = this.floatText.color;
        this.draw.FontSize = "20px";
        this.draw.Font = "monospace";
        this.draw.SetTextAlign("center");
        this.draw.DrawText(`-${this.floatText.value}`, p.x, y);
        this.screen.Context.globalAlpha = 1;
    }

    OnGUI() {
        const barY = OY + ROWS * CELL + 4;

        this.draw.Style = this.draw.TYPES.FILLED;
        this.draw.Color = "rgba(0,0,0,0.85)";
        this.draw.DrawRect(0, barY, W, H - barY);

        this.draw.Color = "#FFFFFF";
        this.draw.FontSize = "14px";
        this.draw.Font = "monospace";
        this.draw.SetTextAlign("left");
        this.draw.DrawText(this.message, 10, barY + 22);

        this.draw.Color = "#888888";
        this.draw.FontSize = "11px";
        this.draw.DrawText(`Modo: ${this._battleModeLabel()} | Setas: cursor | Z/A: confirmar | X/B: cancelar`, 10, barY + 42);

        this.draw.Color = "#AAAAAA";
        this.draw.SetTextAlign("right");
        this.draw.DrawText(`FPS: ${this.FPS}`, W - 10, barY + 22);

        if (this.phase === PHASE.ACTION_MENU) {
            this._drawActionMenu();
        }
    }

    _drawActionMenu() {
        const mx = W - 178;
        const my = 76;
        const mw = 150;
        const mh = this.actionOptions.length * 30 + 18;

        this.draw.Style = this.draw.TYPES.FILLED;
        this.draw.Color = "rgba(0,0,0,0.86)";
        this.draw.DrawRect(mx, my, mw, mh);

        this.draw.Style = this.draw.TYPES.STROKED;
        this.draw.Color = "#D8D8D8";
        this.draw.DrawRect(mx, my, mw, mh);

        this.draw.Style = this.draw.TYPES.FILLED;
        this.draw.SetTextAlign("left");
        this.draw.Font = "monospace";

        for (let i = 0; i < this.actionOptions.length; i++) {
            const selected = i === this.selectedActionIndex;
            this.draw.Color = selected ? "#FFD84A" : "#E8E8E8";
            this.draw.FontSize = "14px";
            this.draw.DrawText(`${selected ? "> " : "  "}${this.actionOptions[i].label}`, mx + 12, my + 28 + i * 30);
        }
    }
}
