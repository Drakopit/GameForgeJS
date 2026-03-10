/**
 * @doc BattleLevel
 * @summary Tela de batalha por turnos ao estilo FFT.
 *          Player escolhe ação no menu, inimigo age automaticamente após 1 segundo.
 *          Ao terminar, define BattleState.result e volta ao mapa (Back = true).
 *
 * Controles:
 *   Setas / W,S → navegar menu
 *   Z / Space   → confirmar ação
 */
import { Level } from "../Template/Level.js";
import { Screen } from "../Window/Screen.js";
import { Draw } from "../Graphic/Draw.js";
import { ActionManager } from "../Input/ActionManager.js";
import { BattleState } from "./BattleState.js";

const W = 640, H = 480;

const PHASE = {
    PLAYER_MENU: "PLAYER_MENU",
    ENEMY_WAITING: "ENEMY_WAITING",
    BATTLE_OVER: "BATTLE_OVER",
};

export class BattleLevel extends Level {
    constructor() {
        super();
        this.caption = "FFT Demo - Batalha";
        this.TelaId = "BattleScreen";
    }

    OnStart() {
        this.screen = new Screen("BattleScreen", W, H);
        this.draw = new Draw(this.screen);

        this.player = BattleState.playerUnit;
        this.enemy = BattleState.enemyUnit;

        this.menuOptions = ["Atacar", "Esperar"];
        this.selectedOption = 0;
        this.phase = PHASE.PLAYER_MENU;
        this.log = "Batalha iniciada! Escolha uma ação.";
        this.enemyTimer = 0;

        this.dmg = { value: 0, target: null, timer: 0 };
        super.OnStart();
    }

    OnExit() {
        if (this.screen?.Canvas) this.screen.Canvas.remove();
    }

    _calcDamage(attacker, defender) {
        return defender.TakeDamage(attacker);
    }

    OnUpdate(dt) {
        super.OnUpdate(dt);

        if (this.dmg.timer > 0) this.dmg.timer -= dt;

        switch (this.phase) {
            case PHASE.PLAYER_MENU: {
                // ADAPTAÇÃO: Input virtualizado da GameForgeJS
                if (ActionManager.IsActionDown("UP")) {
                    this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
                }
                if (ActionManager.IsActionDown("DOWN")) {
                    this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
                }

                if (ActionManager.IsActionDown("ATTACK")) { // Botão de Confirmação (Ex: Z, Space, Botão A)
                    if (this.selectedOption === 0) {
                        const dmg = this._calcDamage(this.player, this.enemy);
                        this.dmg = { value: dmg, target: "enemy", timer: 1.2 };
                        this.log = `${this.player.name} ataca! ${this.enemy.name} recebe ${dmg} de dano!`;

                        if (!this.enemy.IsAlive()) {
                            this.log += " Inimigo derrotado!";
                            BattleState.result = "PLAYER_WIN";
                            this.phase = PHASE.BATTLE_OVER;
                        } else {
                            this.phase = PHASE.ENEMY_WAITING;
                            this.enemyTimer = 1.2;
                        }
                    } else {
                        this.log = `${this.player.name} espera... Turno do inimigo!`;
                        this.phase = PHASE.ENEMY_WAITING;
                        this.enemyTimer = 1.0;
                    }
                }
                break;
            }

            case PHASE.ENEMY_WAITING: {
                this.enemyTimer -= dt;
                if (this.enemyTimer <= 0) {
                    const dmg = this._calcDamage(this.enemy, this.player);
                    this.dmg = { value: dmg, target: "player", timer: 1.2 };
                    this.log = `${this.enemy.name} ataca! ${this.player.name} recebe ${dmg} de dano!`;

                    if (!this.player.IsAlive()) {
                        this.log += " Você foi derrotado!";
                        BattleState.result = "ENEMY_WIN";
                        this.phase = PHASE.BATTLE_OVER;
                    } else {
                        this.log += " Seu turno!";
                        this.phase = PHASE.PLAYER_MENU;
                    }
                }
                break;
            }

            case PHASE.BATTLE_OVER: {
                if (ActionManager.IsActionDown("ATTACK")) {
                    this.Back = true; // A engine agora cuida de retornar ao mapa
                }
                break;
            }
        }
    }

    OnDrawn() {
        this.screen.Refresh();
        
        // Exceção à regra: Para gradientes, usamos o Context nativo.
        const sky = this.screen.Context.createLinearGradient(0, 0, 0, H * 0.65);
        sky.addColorStop(0, "#0a0a1e");
        sky.addColorStop(1, "#1a1a3e");
        this.screen.Context.fillStyle = sky;
        this.screen.Context.fillRect(0, 0, W, H * 0.65);

        // Chão
        this.draw.Style = this.draw.TYPES.FILLED;
        this.draw.Color = "#2d4a1e";
        this.draw.DrawRect(0, H * 0.65, W, H * 0.35);
        this.draw.Color = "#1e3414";
        this.draw.DrawRect(0, H * 0.7, W, H * 0.3);

        this._drawBattleUnit(this.player, 160, 300);
        this._drawBattleUnit(this.enemy, 480, 300);

        // Texto Flutuante de Dano
        if (this.dmg.timer > 0) {
            const isPlayer = this.dmg.target === "player";
            const ux = isPlayer ? 160 : 480;
            const elapsed = 1.2 - this.dmg.timer;
            const floatY = 180 - elapsed * 50;
            const alpha = Math.min(1, this.dmg.timer);

            this.screen.Context.globalAlpha = alpha;
            this.draw.Color = "#FF2222";
            this.draw.Font = "bold 36px monospace";
            this.draw.SetTextAlign("center");
            this.draw.DrawText(`-${this.dmg.value}`, ux, floatY);
            this.screen.Context.globalAlpha = 1;
        }
    }

    _drawBattleUnit(unit, cx, groundY) {
        const w = 70, h = 110;
        const x = cx - w / 2;
        const y = groundY - h;

        this.draw.Style = this.draw.TYPES.FILLED;

        // Sombra
        this.draw.Color = "rgba(0,0,0,0.3)";
        this.draw.DrawCircle(cx, groundY + 6, 25); // Usando círculo aproximado

        // Corpo
        this.draw.Color = unit.IsAlive() ? unit.color : "#555555";
        this.draw.DrawRect(x, y, w, h);

        // Brilho lateral
        this.draw.Color = "rgba(255,255,255,0.15)";
        this.draw.DrawRect(x + 4, y + 4, w / 3, h - 8);

        // Fundo do Nome
        this.draw.Color = "rgba(0,0,0,0.7)";
        this.draw.DrawRect(cx - 52, y - 32, 104, 22);
        
        // Texto do Nome
        this.draw.Color = "#FFFFFF";
        this.draw.Font = "bold 13px monospace";
        this.draw.SetTextAlign("center");
        this.draw.DrawText(unit.name, cx, y - 15);

        // Barra de HP
        const barW = 120, barX = cx - barW / 2, barY = y - 52;
        const pct = unit.hp / unit.maxHp;

        this.draw.Color = "#222222";
        this.draw.DrawRect(barX, barY, barW, 14);

        this.draw.Color = pct > 0.5 ? "#44DD44" : pct > 0.25 ? "#FFAA00" : "#FF3333";
        this.draw.DrawRect(barX, barY, barW * Math.max(0, pct), 14);

        this.draw.Style = this.draw.TYPES.STROKED;
        this.draw.Color = "#888888";
        this.draw.DrawRect(barX, barY, barW, 14);

        this.draw.Style = this.draw.TYPES.FILLED;
        this.draw.Color = "#FFFFFF";
        this.draw.Font = "11px monospace";
        this.draw.DrawText(`${unit.hp} / ${unit.maxHp}`, cx, barY + 11);
    }

    OnGUI() {
        this.draw.Style = this.draw.TYPES.FILLED;

        if (this.phase === PHASE.PLAYER_MENU) {
            const mx = 20, my = 355;
            const mw = 160, mh = this.menuOptions.length * 38 + 16;

            this.draw.Color = "rgba(0,0,0,0.85)";
            this.draw.DrawRect(mx, my, mw, mh);
            
            this.draw.Style = this.draw.TYPES.STROKED;
            this.draw.Color = "#AAAAAA";
            this.draw.DrawRect(mx, my, mw, mh);
            
            this.draw.Style = this.draw.TYPES.FILLED;

            for (let i = 0; i < this.menuOptions.length; i++) {
                const selected = i === this.selectedOption;
                this.draw.Color = selected ? "#FFD700" : "#CCCCCC";
                this.draw.Font = selected ? "bold 16px monospace" : "16px monospace";
                this.draw.SetTextAlign("left");
                this.draw.DrawText((selected ? "▶ " : "  ") + this.menuOptions[i], mx + 12, my + 30 + i * 38);
            }
        }

        const turnLabel = this.phase === PHASE.PLAYER_MENU ? "▶ SEU TURNO" : this.phase === PHASE.ENEMY_WAITING ? "INIMIGO AGUARDA..." : "";

        if (turnLabel) {
            this.draw.Color = this.phase === PHASE.PLAYER_MENU ? "#44FF88" : "#FF6666";
            this.draw.Font = "bold 13px monospace";
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
        this.draw.Font = "14px monospace";
        this.draw.SetTextAlign("left");
        this.draw.DrawText(this.log, 14, 448);

        if (this.phase === PHASE.BATTLE_OVER) {
            this.draw.Color = "#FFD700";
            this.draw.Font = "12px monospace";
            this.draw.DrawText("Pressione Confirma (Z/Space) para voltar", 14, 470);
        }
    }
}