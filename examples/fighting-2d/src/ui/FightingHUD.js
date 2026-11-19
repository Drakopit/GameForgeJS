import { Draw, HUDFrame } from 'gameforgejs/2d';
import { RoundSettings, ScreenSettings } from '../data/FightingSettings.js';
import { FightingGameSession } from '../state/FightingGameState.js';
import { FightingHelp } from './FightingHelp.js';

const Layout = Object.freeze({ barWidth: 350, barHeight: 18, margin: 24, panelWidth: 380, panelHeight: 116 });
export class FightingHUD {
    constructor(screen) { this.frame = new HUDFrame(new Draw(screen)); this.help = new FightingHelp(screen); }
    Draw(level) {
        this.DrawFighter(level.playerOne, false); this.DrawFighter(level.playerTwo, true);
        const frame = this.frame;
        frame.Panel({ x: 432, y: 16, width: 96, height: 82 });
        frame.Text(String(Math.ceil(level.roundTimer)).padStart(2, '0'), 480, 51, { size: 30, weight: 700, align: 'center' });
        frame.Text(`ROUND ${level.roundNumber}`, 480, 72, { size: 10, align: 'center', color: frame.theme.gold });
        frame.Text(FightingGameSession.mode.toUpperCase(), 480, 89, { size: 9, align: 'center', color: frame.theme.muted });
        frame.Panel({ x: 16, y: 474, width: 928, height: 52 });
        frame.Text('P1  A/D mover · W salto · S defesa · J leve · K pesado · L poder · U super', 30, 495, { size: 12 });
        frame.Text('PAD  X leve · Y pesado · RB poder · RT super · A salto · LB defesa     H / Start: ajuda', 30, 514, { size: 11, color: frame.theme.muted });
        this.DrawRoundState(level);
        this.help.OnDrawn();
    }
    DrawFighter(fighter, right) {
        const frame = this.frame;
        const x = right ? ScreenSettings.width - Layout.margin - Layout.panelWidth : Layout.margin;
        const barX = x + 15;
        frame.Panel({ x, y: 16, width: Layout.panelWidth, height: Layout.panelHeight });
        frame.Text(fighter.name.toUpperCase(), barX, 39, { size: 18, weight: 700, color: fighter.tint });
        frame.Text(`${Math.ceil(fighter.hp)} / ${fighter.maxHp}`, x + Layout.panelWidth - 14, 38, { size: 11, align: 'right' });
        frame.Meter(fighter.displayHp / fighter.maxHp, { x: barX, y: 49, width: Layout.barWidth, height: Layout.barHeight }, '#a75247');
        frame.Meter(fighter.hp / fighter.maxHp, { x: barX, y: 49, width: Layout.barWidth, height: Layout.barHeight }, frame.theme.green);
        frame.Meter(fighter.meter / 100, { x: barX, y: 76, width: Layout.barWidth, height: 7 }, fighter.meter >= 50 ? '#e5cb75' : '#6ccfe5');
        const ready = fighter.CanStartAttack('special');
        frame.Text(fighter.noticeRemaining > 0 ? fighter.notice : `${ready ? 'ESFERA PRONTA' : 'ESFERA EM RECARGA'}   /   ${fighter.meter >= 50 ? 'SUPER PRONTO' : 'SUPER 50 EN'}`, barX, 101, { size: 10, color: frame.theme.gold });
        frame.Text(`${fighter.roundWins} / ${RoundSettings.winsToMatch} rounds`, barX, 119, { size: 10, color: frame.theme.muted });
        if (fighter.comboCount > 1) frame.Text(`${fighter.comboCount} HIT COMBO`, right ? 912 : 48, 167,
            { size: 24, weight: 700, align: right ? 'right' : 'left', color: frame.theme.gold });
    }
    DrawRoundState(level) {
        let title = '', subtitle = '';
        if (level.matchWinner) {
            title = level.arcadeComplete ? 'ARCADE CLEAR' : `${level.matchWinner.name} WINS`;
            subtitle = level.arcadeComplete ? 'CAMPANHA CONCLUÍDA' : 'Enter / A: continuar';
        } else if (level.roundState === 'intro') { title = 'FIGHT'; subtitle = `ROUND ${level.roundNumber}`; }
        else if (level.roundState === 'roundOver') title = 'K.O.';
        if (!title) return;
        this.frame.Panel({ x: 260, y: 206, width: 440, height: 102 });
        this.frame.Text(title, 480, 253, { size: 40, weight: 700, align: 'center', color: this.frame.theme.gold });
        this.frame.Text(subtitle, 480, 282, { size: 13, align: 'center' });
    }
}
