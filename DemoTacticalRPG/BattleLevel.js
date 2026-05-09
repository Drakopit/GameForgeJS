import { Level } from "../Template/Level.js";
import { Screen } from "../Window/Screen.js";
import { Draw } from "../Graphic/Draw.js";
import { ActionManager } from "../Input/ActionManager.js";
import { BattleState } from "./BattleState.js";

const W = 640;
const H = 480;

const PHASE = {
    PLAYER_MENU: "PLAYER_MENU",
    ENEMY_WAITING: "ENEMY_WAITING",
    BATTLE_OVER: "BATTLE_OVER",
};

export class BattleLevel extends Level {
    constructor() {
        super();
        this.caption = "FFT Demo - Battle";
        this.TelaId = "BattleScreen";
    }

    OnStart() {
        this.screen = new Screen("BattleScreen", W, H);
        this.draw = new Draw(this.screen);

        this.player = BattleState.playerUnit;
        this.enemy = BattleState.enemyUnit;
        this.invalidEncounter = !BattleState.CanStartBattle();

        this.menuOptions = ["Atacar", "Esperar"];
        this.selectedOption = 0;
        this.phase = this.invalidEncounter ? PHASE.BATTLE_OVER : PHASE.PLAYER_MENU;
        this.log = this.invalidEncounter
            ? "Encontro invalido. Voltando ao mapa..."
            : "Batalha iniciada! Escolha uma acao.";
        this.enemyTimer = 0;
        this.dmg = { value: 0, target: null, timer: 0 };

        super.OnStart();
    }

    OnExit() {
        if (this.screen?.Canvas) this.screen.Canvas.remove();
    }

    _calcDamage(attacker, defender) {
        if (!attacker?.IsAlive?.() || !defender?.IsAlive?.()) return 0;
        return defender.TakeDamage(attacker);
    }

    OnUpdate(dt) {
        super.OnUpdate(dt);

        if (this.invalidEncounter) {
            this.Back = true;
            return;
        }

        if (this.dmg.timer > 0) this.dmg.timer -= dt;

        switch (this.phase) {
            case PHASE.PLAYER_MENU:
                this._updatePlayerMenu();
                break;

            case PHASE.ENEMY_WAITING:
                this._updateEnemyTurn(dt);
                break;

            case PHASE.BATTLE_OVER:
                if (ActionManager.IsActionDown("ATTACK")) {
                    this.Back = true;
                }
                break;
        }
    }

    _updatePlayerMenu() {
        if (ActionManager.IsActionDown("UP")) {
            this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
        }

        if (ActionManager.IsActionDown("DOWN")) {
            this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
        }

        if (!ActionManager.IsActionDown("ATTACK")) return;

        if (this.selectedOption === 0) {
            const dmg = this._calcDamage(this.player, this.enemy);
            this.dmg = { value: dmg, target: "enemy", timer: 1.2 };
            this.log = `${this.player.name} ataca. ${this.enemy.name} recebe ${dmg} de dano.`;

            if (!this.enemy.IsAlive()) {
                this.log += " Inimigo derrotado.";
                BattleState.FinishEncounter("PLAYER_WIN");
                this.phase = PHASE.BATTLE_OVER;
                return;
            }

            this.phase = PHASE.ENEMY_WAITING;
            this.enemyTimer = 1.2;
            return;
        }

        this.log = `${this.player.name} espera. Turno do inimigo.`;
        this.phase = PHASE.ENEMY_WAITING;
        this.enemyTimer = 1.0;
    }

    _updateEnemyTurn(dt) {
        this.enemyTimer -= dt;
        if (this.enemyTimer > 0) return;

        const dmg = this._calcDamage(this.enemy, this.player);
        this.dmg = { value: dmg, target: "player", timer: 1.2 };
        this.log = `${this.enemy.name} ataca. ${this.player.name} recebe ${dmg} de dano.`;

        if (!this.player.IsAlive()) {
            this.log += " Voce foi derrotado.";
            BattleState.FinishEncounter("ENEMY_WIN");
            this.phase = PHASE.BATTLE_OVER;
            return;
        }

        this.log += " Seu turno.";
        this.phase = PHASE.PLAYER_MENU;
    }

    OnDrawn() {
        this.screen.Refresh();

        const sky = this.screen.Context.createLinearGradient(0, 0, 0, H * 0.65);
        sky.addColorStop(0, "#0a0a1e");
        sky.addColorStop(1, "#1a1a3e");
        this.screen.Context.fillStyle = sky;
        this.screen.Context.fillRect(0, 0, W, H * 0.65);

        this.draw.Style = this.draw.TYPES.FILLED;
        this.draw.Color = "#2d4a1e";
        this.draw.DrawRect(0, H * 0.65, W, H * 0.35);
        this.draw.Color = "#1e3414";
        this.draw.DrawRect(0, H * 0.7, W, H * 0.3);

        if (!this.player || !this.enemy) return;

        this._drawBattleUnit(this.player, 160, 300);
        this._drawBattleUnit(this.enemy, 480, 300);
        this._drawDamageText();
    }

    _drawDamageText() {
        if (this.dmg.timer <= 0) return;

        const isPlayer = this.dmg.target === "player";
        const ux = isPlayer ? 160 : 480;
        const elapsed = 1.2 - this.dmg.timer;
        const floatY = 180 - elapsed * 50;
        const alpha = Math.min(1, this.dmg.timer);

        this.screen.Context.globalAlpha = alpha;
        this.draw.Color = "#FF2222";
        this.draw.FontSize = "36px";
        this.draw.Font = "monospace";
        this.draw.SetTextAlign("center");
        this.draw.DrawText(`-${this.dmg.value}`, ux, floatY);
        this.screen.Context.globalAlpha = 1;
    }

    _drawBattleUnit(unit, cx, groundY) {
        const w = 70;
        const h = 110;
        const x = cx - w / 2;
        const y = groundY - h;

        this.draw.Style = this.draw.TYPES.FILLED;
        this.draw.Color = "rgba(0,0,0,0.3)";
        this.draw.DrawCircle(cx, groundY + 6, 25);

        this.draw.Color = unit.IsAlive() ? unit.color : "#555555";
        this.draw.DrawRect(x, y, w, h);

        this.draw.Color = "rgba(255,255,255,0.15)";
        this.draw.DrawRect(x + 4, y + 4, w / 3, h - 8);

        this.draw.Color = "rgba(0,0,0,0.7)";
        this.draw.DrawRect(cx - 52, y - 32, 104, 22);

        this.draw.Color = "#FFFFFF";
        this.draw.FontSize = "13px";
        this.draw.Font = "monospace";
        this.draw.SetTextAlign("center");
        this.draw.DrawText(unit.name, cx, y - 15);

        const barW = 120;
        const barX = cx - barW / 2;
        const barY = y - 52;
        const pct = Math.max(0, unit.hp / unit.maxHp);

        this.draw.Color = "#222222";
        this.draw.DrawRect(barX, barY, barW, 14);

        this.draw.Color = pct > 0.5 ? "#44DD44" : pct > 0.25 ? "#FFAA00" : "#FF3333";
        this.draw.DrawRect(barX, barY, barW * pct, 14);

        this.draw.Style = this.draw.TYPES.STROKED;
        this.draw.Color = "#888888";
        this.draw.DrawRect(barX, barY, barW, 14);

        this.draw.Style = this.draw.TYPES.FILLED;
        this.draw.Color = "#FFFFFF";
        this.draw.FontSize = "11px";
        this.draw.DrawText(`${unit.hp} / ${unit.maxHp}`, cx, barY + 11);
    }

    OnGUI() {
        this.draw.Style = this.draw.TYPES.FILLED;

        if (this.phase === PHASE.PLAYER_MENU) {
            this._drawMenu();
        }

        const turnLabel = this.phase === PHASE.PLAYER_MENU
            ? "SEU TURNO"
            : this.phase === PHASE.ENEMY_WAITING ? "INIMIGO AGUARDA..." : "";

        if (turnLabel) {
            this.draw.Color = this.phase === PHASE.PLAYER_MENU ? "#44FF88" : "#FF6666";
            this.draw.FontSize = "13px";
            this.draw.Font = "monospace";
            this.draw.SetTextAlign("right");
            this.draw.DrawText(turnLabel, W - 15, 375);
        }

        this.draw.Color = "rgba(0,0,0,0.88)";
        this.draw.DrawRect(0, 422, W, 58);

        this.draw.Style = this.draw.TYPES.STROKED;
        this.draw.Color = "#444444";
        this.draw.DrawRect(0, 422, W, 58);

        this.draw.Style = this.draw.TYPES.FILLED;
        this.draw.Color = "#FFFFFF";
        this.draw.FontSize = "14px";
        this.draw.Font = "monospace";
        this.draw.SetTextAlign("left");
        this.draw.DrawText(this.log, 14, 448);

        if (this.phase === PHASE.BATTLE_OVER && !this.invalidEncounter) {
            this.draw.Color = "#FFD700";
            this.draw.FontSize = "12px";
            this.draw.DrawText("Pressione Z para voltar ao mapa", 14, 470);
        }
    }

    _drawMenu() {
        const mx = 20;
        const my = 355;
        const mw = 160;
        const mh = this.menuOptions.length * 38 + 16;

        this.draw.Color = "rgba(0,0,0,0.85)";
        this.draw.DrawRect(mx, my, mw, mh);

        this.draw.Style = this.draw.TYPES.STROKED;
        this.draw.Color = "#AAAAAA";
        this.draw.DrawRect(mx, my, mw, mh);

        this.draw.Style = this.draw.TYPES.FILLED;
        for (let i = 0; i < this.menuOptions.length; i++) {
            const selected = i === this.selectedOption;
            this.draw.Color = selected ? "#FFD700" : "#CCCCCC";
            this.draw.FontSize = "16px";
            this.draw.Font = "monospace";
            this.draw.SetTextAlign("left");
            this.draw.DrawText((selected ? "> " : "  ") + this.menuOptions[i], mx + 12, my + 30 + i * 38);
        }
    }
}
