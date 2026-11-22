import { expedition } from '../state/Expedition.js';
import { ActionManager, Input } from "gameforgejs/core";
import { MathExt } from "gameforgejs/core";
import { TacticalFromScene } from "./TacticalScene.js";
import { BATTLE_MODES, BattleState } from "../state/BattleState.js";
import { TACTICAL_AREA_SHAPES, TacticalArea } from "./TacticalArea.js";
import { TacticalGrid } from "./TacticalGrid.js";
import { TacticalMapRenderer } from "./TacticalMapRenderer.js";
import { TacticalUnit } from "./TacticalUnit.js";

const MOVE_SPEED = 12;

const PHASE = Object.freeze({
    SELECT_UNIT: "SELECT_UNIT",
    MOVE_TARGET: "MOVE_TARGET",
    ACTION_MENU: "ACTION_MENU",
    ACTION_TARGET: "ACTION_TARGET",
    ENEMY_TURN: "ENEMY_TURN",
    ANIMATING: "ANIMATING",
});

export class TacticalBattleManager {
    constructor({ level, assets, sound }) {
        this.level = level;
        this.assets = assets;
        this.sound = sound;
        // scenes/tactical-map.gfscene.json holds the map, the player and the enemies.
        const documents = TacticalFromScene(assets.jsons.tactical_scene);
        this.stage = documents.stage;
        if (expedition.stage?.blocked) {
            this.stage = { ...this.stage, objects: [], tilemap: { ...this.stage.tilemap, terrainRows: null, terrain: null, blockedTiles: expedition.stage.blocked } };
        }
        this.playerDoc = documents.player;
        this.enemyDoc = documents.enemies;
        this.grid = new TacticalGrid(this.stage);
        this.renderer = new TacticalMapRenderer({
            level,
            grid: this.grid,
            stage: this.stage,
            assets,
        });

        this._ensureBattleState();
        this.player = BattleState.playerUnit;
        this.enemies = BattleState.enemies;
        this.party = BattleState.party ?? [this.player];
        this.units = [...this.party, ...this.enemies];
        this.units.forEach(unit => unit.SetRuntimeContext?.({ level, grid: this.grid, assets }));

        this.cursor = { col: this.player.col, row: this.player.row };
        this.phase = PHASE.SELECT_UNIT;
        this.moveArea = [];
        this.actionArea = [];
        this.actionOptions = this._buildActionOptions();
        this.selectedActionIndex = 0;
        this.selectedAction = null;
        this.pathPreview = [];
        this.floatTexts = [];
        this.pathQueue = [];
        this.animUnit = null;
        this.animTarget = null;
        this.animCallback = null;
        this.enemyQueue = [];
        this.aiDelay = 0;
        this.aiCallback = null;
        this.message = `Modo ${this.BattleModeLabel()}. Selecione o Hero com Z.`;
        this._handleBattleReturn();
    }

    get Entities() {
        return this.units;
    }

    _ensureBattleState() {
        if (BattleState.initialized && BattleState.playerUnit?.SetRuntimeContext) {
            // Scene exit destroys ECS components. Persist domain values, never
            // re-enter the map with destroyed runtime entities from the arena.
            if (BattleState.playerUnit._destroyed) {
                const previousEnemy = BattleState.enemyUnit;
                BattleState.playerUnit = BattleState.playerUnit.Recreate(this.grid, this.assets);
                BattleState.party = [BattleState.playerUnit];
                BattleState.enemies = BattleState.enemies.map(unit => unit.Recreate(this.grid, this.assets));
                BattleState.enemyUnit = BattleState.enemies.find(unit => unit.id === previousEnemy?.id) ?? null;
                if(BattleState.pendingReset)BattleState.ResetAll();
            }
            return;
        }

        const hero = this.playerDoc.player ?? {};
        const chosen = expedition.classes[0];
        const playerRoot = chosen ? { ...hero, ...chosen } : hero;
        const spawn = playerRoot.spawn ?? {};
        const player = this._createUnit(spawn.col ?? 1, spawn.row ?? 3, playerRoot, {
            id: "hero",
            team: "ally",
            name: "Hero",
            color: "#4488FF",
            stats: {
                hp: 30,
                attack: 10,
                defense: 3,
                moveRange: 3,
                attackRange: 1,
            },
        });

        const enemyDefaults = this.enemyDoc.enemyDefaults ?? {};
        const enemyDocs = this.enemyDoc.enemies?.length
            ? this.enemyDoc.enemies
            : [{
                id: "enemy",
                name: "Enemy",
                color: "#FF4444",
                col: 8,
                row: 3,
                stats: {
                    hp: 25,
                    attack: 8,
                    defense: 2,
                    moveRange: 2,
                    attackRange: 1,
                },
            }];

        const enemies = enemyDocs.map(enemy => this._createUnit(
            enemy.col ?? enemyDefaults.col ?? 8,
            enemy.row ?? enemyDefaults.row ?? 3,
            enemy,
            { team: "enemy", ...enemyDefaults }
        ));

        BattleState.party = [player];
        if (expedition.seats === 2) {
            const chosen = expedition.classes[1];
            BattleState.party.push(this._createUnit(1, 4,
                { ...hero, ...chosen, id: 'partner' }, { team: 'ally' }));
        }
        BattleState.playerUnit = player;
        BattleState.enemyUnit = enemies[0] ?? null;
        BattleState.enemies = enemies;
        BattleState.initialized = true;
    }

    _createUnit(col, row, config, defaults) {
        return new TacticalUnit({
            col,
            row,
            grid: this.grid,
            assets: this.assets,
            config,
            defaults,
        });
    }

    _handleBattleReturn() {
        if (BattleState.result === "PLAYER_WIN") {
            this.message = this.HasLivingEnemies()
                ? "Inimigo derrotado. Selecione o Hero com Z."
                : "Vitoria! Todos os inimigos foram derrotados.";
            BattleState.ClearResult();
            return;
        }

        if (BattleState.result === "ROUND_END") {
            this.message = "Troca de golpes resolvida. Selecione o Hero com Z.";
            BattleState.ClearResult();
            return;
        }

        if (BattleState.result === "ENEMY_WIN") {
            BattleState.ResetAll();
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
                shape: TACTICAL_AREA_SHAPES.DIAMOND,
                color: "rgba(255, 72, 72, 0.42)",
                verb: "ataca",
                bonus: 0,
            },
            {
                id: "magic",
                label: "Magia",
                range: 3,
                shape: TACTICAL_AREA_SHAPES.CROSS,
                color: "rgba(142, 96, 255, 0.38)",
                verb: "conjura",
                bonus: 5,
            },
            {
                id: "cleave",
                label: "Corte lateral",
                range: 1,
                shape: TACTICAL_AREA_SHAPES.CUSTOM,
                pattern: [
                    { col: -1, row: 0 },
                    { col: 1, row: 0 },
                    { col: 0, row: -1 },
                ],
                color: "rgba(255, 170, 74, 0.38)",
                verb: "varre",
                bonus: 2,
            },
            {
                id: "wait",
                label: "Esperar",
            },
        ].filter(action => !this.player?.skill || ['attack', 'wait', this.player.skill].includes(action.id));
    }

    IsFftMode() {
        return BattleState.battleMode === BATTLE_MODES.FINAL_FANTASY_TACTICS;
    }

    BattleModeLabel() {
        return this.IsFftMode() ? "Final Fantasy Tactics" : "Fire Emblem";
    }

    Pressed(action) {
        const keys = { UP: 'KeyI', LEFT: 'KeyJ', DOWN: 'KeyK', RIGHT: 'KeyL', ATTACK: 'KeyF', CANCEL: 'KeyG' };
        const second = this.party.indexOf(this.player) === 1 && this.HasLivingEnemies();
        if (!second) return ActionManager.IsActionDown(action);
        const pad = Input.GetConnectedGamepadIndices()[1];
        const buttons = { UP: 'DPAD_UP', LEFT: 'DPAD_LEFT', DOWN: 'DPAD_DOWN', RIGHT: 'DPAD_RIGHT', ATTACK: 'A', CANCEL: 'B' };
        return Input.GetKeyDown(keys[action]) || (pad !== undefined && Input.GetGamepadButtonDown(pad, buttons[action]));
    }

    HasLivingEnemies() {
        return this.enemies.some(enemy => enemy.IsAlive());
    }

    FindLivingEnemyAt(col, row) {
        return this.enemies.find(enemy => enemy.IsAlive() && enemy.IsAt(col, row)) ?? null;
    }

    Update(dt) {
        this._updateFloatTexts(dt);

        if (this.phase === PHASE.ANIMATING) {
            this._updateAnimation(dt);
            return null;
        }

        if (this.phase === PHASE.ENEMY_TURN) {
            this._updateEnemyTurn(dt);
            return null;
        }

        if (!this.HasLivingEnemies()) {
            this.moveArea = [];
            this.actionArea = [];
            this.pathPreview = [];
            this.message = "Vitoria! Confirme para jogar novamente.";
            if (this.Pressed("CANCEL")) return { back: true };
            if (this.Pressed("ATTACK")) {
                BattleState.ResetAll();
                this.player = this.party[0];
                this._endPlayerReady("Selecione o Hero para comecar.");
            }
            return null;
        }

        if (this.phase === PHASE.ACTION_MENU) {
            this._updateActionMenu();
            return null;
        }

        this._readCursorInput();

        if (this.Pressed("CANCEL")) {
            if (this.phase === PHASE.SELECT_UNIT) return { back: true };
            this._cancelCurrentPhase();
            return null;
        }

        if (!this.Pressed("ATTACK")) return null;

        if (this.phase === PHASE.SELECT_UNIT) {
            if (this.player.IsAt(this.cursor.col, this.cursor.row)) this._selectPlayer();
            else this.message = "Mova o cursor ate o Hero e pressione Z.";
            return null;
        }

        if (this.phase === PHASE.MOVE_TARGET) {
            this._confirmMoveTarget();
            return null;
        }

        if (this.phase === PHASE.ACTION_TARGET) {
            return this._confirmActionTarget();
        }

        return null;
    }

    Draw() {
        this.renderer.DrawMap();
        this.renderer.DrawAreas(this.moveArea, this.actionArea, this.selectedAction?.color);
        this.renderer.DrawPath(this.pathPreview);
        this.renderer.DrawActors(this.units);
        this.renderer.DrawFloatTexts(this.floatTexts);
        this.renderer.DrawCursor(this.cursor);
        if (this.phase === PHASE.ACTION_MENU) {
            this.renderer.DrawActionMenu(this.actionOptions, this.selectedActionIndex);
        }
    }

    DrawHud() {
        this.renderer.DrawHud({
            message: this.message,
            battleModeLabel: (expedition.stage?.name ?? this.BattleModeLabel())
                + " / P" + (this.party.indexOf(this.player) + 1) + " " + this.player.name,
        });
    }

    _readCursorInput() {
        let dc = 0;
        let dr = 0;

        if (this.Pressed("UP")) dr = -1;
        else if (this.Pressed("DOWN")) dr = 1;
        else if (this.Pressed("LEFT")) dc = -1;
        else if (this.Pressed("RIGHT")) dc = 1;

        if (dc === 0 && dr === 0) return;

        this.cursor.col = Math.max(0, Math.min(this.grid.world.cols - 1, this.cursor.col + dc));
        this.cursor.row = Math.max(0, Math.min(this.grid.world.rows - 1, this.cursor.row + dr));
        this._refreshPathPreview();
    }

    _selectPlayer() {
        this.moveArea = TacticalArea.MoveArea(this.player, this.grid, this.units);
        this.actionArea = [];
        this.selectedAction = null;
        this.pathPreview = [];
        this.phase = PHASE.MOVE_TARGET;
        this.message = "Area azul: movimento. Escolha destino com Z. X cancela.";
        this._refreshPathPreview();
    }

    _confirmMoveTarget() {
        const { col, row } = this.cursor;
        if (!TacticalArea.Contains(this.moveArea, col, row)) {
            this.message = "Destino fora da area de movimento.";
            return;
        }

        const path = this._findPathTo(this.player, col, row);
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

        if (this.IsFftMode()) {
            this.selectedActionIndex = 0;
            this.selectedAction = null;
            this.actionArea = [];
            this.phase = PHASE.ACTION_MENU;
            this.message = "Escolha acao no mapa. As areas podem usar diamante, cruz ou desenho custom.";
            return;
        }

        this._openActionTarget(this.actionOptions[0]);
        this.message = "Area vermelha: escolha alvo. Z abre arena Fire Emblem. X encerra.";
    }

    _updateActionMenu() {
        if (this.Pressed("CANCEL")) {
            this._startEnemyTurn("Acao cancelada. Turno inimigo.");
            return;
        }

        if (this.Pressed("UP")) {
            this.selectedActionIndex = (this.selectedActionIndex - 1 + this.actionOptions.length) % this.actionOptions.length;
        }

        if (this.Pressed("DOWN")) {
            this.selectedActionIndex = (this.selectedActionIndex + 1) % this.actionOptions.length;
        }

        if (this.Pressed("ATTACK")) this._confirmActionMenu();
    }

    _confirmActionMenu() {
        const action = this.actionOptions[this.selectedActionIndex];
        if (action.id === "wait") {
            this._startEnemyTurn("Hero espera. Turno inimigo.");
            return;
        }

        this._openActionTarget(action);
    }

    _openActionTarget(action) {
        this.selectedAction = action;
        this.actionArea = TacticalArea.Tiles(this.player, {
            range: action.range ?? this.player.attackRange ?? 1,
            shape: action.shape ?? TACTICAL_AREA_SHAPES.DIAMOND,
            pattern: action.pattern,
            grid: this.grid,
        }).filter(tile => !this.grid.IsBlocked(tile.col, tile.row));
        this.phase = PHASE.ACTION_TARGET;
        this.message = action.id === "magic"
            ? "Area roxa em cruz: escolha alvo para magia. X volta ao menu."
            : "Area da acao: escolha alvo. X volta.";
    }

    _confirmActionTarget() {
        const { col, row } = this.cursor;
        const enemy = this.FindLivingEnemyAt(col, row);

        if (!TacticalArea.Contains(this.actionArea, col, row)) {
            this.message = "Alvo fora da area de acao.";
            return null;
        }

        if (!enemy) {
            this.message = "Nenhum inimigo nesse tile.";
            return null;
        }

        if (this.IsFftMode()) {
            this._resolveMapAction(this.player, enemy, this.selectedAction ?? this.actionOptions[0], () => {
                if (this.HasLivingEnemies()) this._startEnemyTurn(this.message);
                else this._endPlayerReady('Vitoria! Todos os inimigos foram derrotados.');
            });
            return null;
        }

        this.player.Face(enemy.col, enemy.row);
        if (BattleState.StartEncounter(this.player, enemy)) return { next: true };
        return null;
    }

    _resolveMapAction(attacker, target, action, afterAction = null) {
        const side = target.ImpactSide(attacker);
        const bonus = side === 'back' ? 3 : side === 'side' ? 1 : 0;
        attacker.Face(target.col, target.row);
        const dmg = target.TakeDamage(attacker, (action.bonus ?? 0) + bonus);
        this.sound?.Play('hit');

        this._addFloatText({
            value: dmg,
            col: target.col,
            row: target.row,
            color: action.id === "magic" ? "#B694FF" : "#FFEE66",
        });

        this.message = target.IsAlive()
            ? `${attacker.name} ${action.verb} ${target.name}. ${dmg} de dano (${side}).`
            : `${target.name} derrotado por ${action.label.toLowerCase()}.`;

        afterAction?.();
    }

    _startEnemyTurn(message = "Turno inimigo.") {
        const next = this.party.slice(this.party.indexOf(this.player) + 1).find(unit => unit.IsAlive());
        if (next) {
            this.player = next;
            this._endPlayerReady("Player " + (this.party.indexOf(next) + 1) + " / confirme para mover.");
            return;
        }
        this.moveArea = [];
        this.actionArea = [];
        this.pathPreview = [];
        this.selectedAction = null;
        this.cursor = { col: this.player.col, row: this.player.row };
        this.enemyQueue = this.enemies.filter(enemy => enemy.IsAlive());
        this.phase = PHASE.ENEMY_TURN;
        this.message = message;
        this._scheduleAi(0.45, () => this._runNextEnemyAi());
    }

    _updateEnemyTurn(dt) {
        if (this.aiDelay <= 0) return;

        this.aiDelay = Math.max(0, this.aiDelay - dt);
        if (this.aiDelay > 0) return;

        const callback = this.aiCallback;
        this.aiCallback = null;
        callback?.();
    }

    _runNextEnemyAi() {
        if (!this.party.some(unit => unit.IsAlive())) {
            BattleState.ResetAll();
            this.player = this.party[0];
            this.phase = PHASE.SELECT_UNIT;
            this.cursor = { col: this.player.col, row: this.player.row };
            this.message = "Derrota. As unidades foram reiniciadas.";
            return;
        }

        const enemy = this.enemyQueue.shift();
        if (!enemy) {
            this.player = this.party.find(unit => unit.IsAlive());
            this._endPlayerReady("Novo turno: " + this.player.name);
            return;
        }

        if (!enemy.IsAlive()) {
            this._runNextEnemyAi();
            return;
        }

        this.player = this.party.filter(unit => unit.IsAlive()).sort((a, b) => enemy.DistanceTo(a) - enemy.DistanceTo(b))[0];
        if (enemy.DistanceTo(this.player) <= enemy.attackRange) {
            this._enemyAttack(enemy);
            return;
        }

        const path = this._bestEnemyPath(enemy);
        if (path?.length > 1) {
            this.pathPreview = path.slice(1);
            this._startPathMove(enemy, path, () => {
                this.pathPreview = [];
                if (enemy.DistanceTo(this.player) <= enemy.attackRange) this._enemyAttack(enemy);
                else this._scheduleAi(0.25, () => this._runNextEnemyAi());
            }, PHASE.ENEMY_TURN);
            return;
        }

        this.message = `${enemy.name} nao encontrou caminho.`;
        this._scheduleAi(0.35, () => this._runNextEnemyAi());
    }

    _enemyAttack(enemy) {
        const side = this.player.ImpactSide(enemy);
        const bonus = this.IsFftMode() ? (side === 'back' ? 3 : side === 'side' ? 1 : 0) : 0;
        enemy.Face(this.player.col, this.player.row);
        const dmg = this.player.TakeDamage(enemy, bonus);
        this.sound?.Play('hit');
        this._addFloatText({
            value: dmg,
            col: this.player.col,
            row: this.player.row,
            color: "#FF6666",
        });
        this.message = `${enemy.name} ataca ${this.player.name}. ${dmg} de dano.`;
        this._scheduleAi(0.65, () => this._runNextEnemyAi());
    }

    _bestEnemyPath(enemy) {
        const candidates = TacticalArea.Tiles(this.player, {
            range: enemy.attackRange,
            shape: TACTICAL_AREA_SHAPES.DIAMOND,
            grid: this.grid,
        }).filter(tile => !this.grid.IsBlocked(tile.col, tile.row));

        let best = null;
        for (const tile of candidates) {
            const occupied = this.units.some(unit => (
                unit !== enemy
                && unit.IsAlive()
                && unit.col === tile.col
                && unit.row === tile.row
            ));
            if (occupied) continue;

            const path = this._findPathTo(enemy, tile.col, tile.row);
            if (!path || path.length < 2) continue;
            if (!best || path.length < best.length) best = path;
        }

        if (!best) return null;
        return best.slice(0, Math.min(best.length, enemy.moveRange + 1));
    }

    _endPlayerReady(message) {
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
            this._endPlayerReady("Selecione o Hero com Z.");
            return;
        }

        if (this.phase === PHASE.ACTION_TARGET) {
            this.actionArea = [];
            if (this.IsFftMode()) {
                this.phase = PHASE.ACTION_MENU;
                this.message = "Escolha uma acao ou Esperar.";
                return;
            }

            this._startEnemyTurn("Turno encerrado. Turno inimigo.");
        }
    }

    _refreshPathPreview() {
        if (this.phase !== PHASE.MOVE_TARGET) return;

        const { col, row } = this.cursor;
        if (!TacticalArea.Contains(this.moveArea, col, row)) {
            this.pathPreview = [];
            return;
        }

        const path = this._findPathTo(this.player, col, row);
        this.pathPreview = path ? path.slice(1) : [];
    }

    _findPathTo(unit, col, row) {
        return this.grid.FindPath(unit, col, row, this.units);
    }

    _startPathMove(unit, path, onComplete, returnPhase = null) {
        this.pathQueue = path.slice(1);
        this.animUnit = unit;
        this.animCallback = onComplete;
        this.returnPhaseAfterAnimation = returnPhase;
        this.phase = PHASE.ANIMATING;
        unit.SetMoving(true);
        this._advancePathStep();
    }

    _advancePathStep() {
        const next = this.pathQueue.shift();

        if (!next) {
            const callback = this.animCallback;
            const returnPhase = this.returnPhaseAfterAnimation;
            this.animUnit?.SetMoving(false);
            this.animUnit = null;
            this.animTarget = null;
            this.animCallback = null;
            this.returnPhaseAfterAnimation = null;
            if (returnPhase) this.phase = returnPhase;
            callback?.();
            return;
        }

        this.animUnit.Face(next.x, next.y);
        this.animUnit.MoveGridOnly(next.x, next.y);
        this.sound?.Play('step');
        this.animTarget = this.grid.TileToPixel(next.x, next.y);
    }

    _updateAnimation(dt) {
        if (!this.animUnit || !this.animTarget) return;

        const t = MOVE_SPEED * dt;
        this.animUnit.pixelX = MathExt.LerpSnap(this.animUnit.pixelX, this.animTarget.x, t);
        this.animUnit.pixelY = MathExt.LerpSnap(this.animUnit.pixelY, this.animTarget.y, t);

        if (this.animUnit.pixelX === this.animTarget.x && this.animUnit.pixelY === this.animTarget.y) {
            this._advancePathStep();
        }
    }

    _scheduleAi(delay, callback) {
        this.aiDelay = delay;
        this.aiCallback = callback;
    }

    _addFloatText({ value, col, row, color }) {
        this.floatTexts.push({
            value,
            col,
            row,
            color,
            timer: 1.1,
            duration: 1.1,
        });
    }

    _updateFloatTexts(dt) {
        this.floatTexts.forEach(text => {
            text.timer = Math.max(0, text.timer - dt);
        });
        this.floatTexts = this.floatTexts.filter(text => text.timer > 0);
    }
}
