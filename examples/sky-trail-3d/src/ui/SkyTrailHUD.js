import { HUDFrame } from 'gameforgejs/2d';
import { Input, Vector3D } from 'gameforgejs/core';
import { SkyTrailHelp } from './SkyTrailHelp.js';

const Layout = Object.freeze({
    player: { x: 16, y: 16, width: 272, height: 88 },
    mission: { width: 228, height: 88, margin: 16 },
    result: { x: 144, y: 162, width: 432, height: 156 },
});

export class SkyTrailHUD {
    get helpVisible() {return this.help?.view?.visible ?? this._helpVisible ?? false;}
    set helpVisible(value) {this._helpVisible=value;if(this.help?.view)this.help.view.visible=value;}
    constructor() {
        this.helpVisible = false;
        this.help = new SkyTrailHelp();
    }

    Draw(level) {
        this.frame ??= new HUDFrame(level.ui.Draw);
        const frame = this.frame;
        frame.Panel(Layout.player);
        frame.Badge('ST', 28, 32, 44);
        frame.Text('SKY EXPLORER', 86, 39, { size: 14, weight: 700, color: frame.theme.gold });
        frame.Text(`Moedas  ${level.collectedCoins} / ${level.goalCoins}`, 86, 58, { size: 13, weight: 700 });
        frame.Meter(level.collectedCoins / level.goalCoins, { x: 86, y: 67, width: 185, height: 7 }, frame.theme.gold);
        frame.Text(`SCORE ${level.score}    QUEDAS ${level.falls}`, 86, 92, { size: 10, color: frame.theme.muted });
        const right = level.width - Layout.mission.width - Layout.mission.margin;
        frame.Panel({ x: right, y: 16, width: Layout.mission.width, height: Layout.mission.height });
        frame.Text(level.course.name, right + 14, 38, { size: 13, color: frame.theme.gold, weight: 700, maxWidth: 200 });
        frame.Text(`${level.time.toFixed(1)} s`, right + 14, 66, { size: 23, weight: 700 });
        const record = level.bestTime === undefined ? 'Primeira expedição' : `Melhor  ${level.bestTime.toFixed(1)} s`;
        frame.Text(record, right + 14, 91, { size: 11, color: frame.theme.muted });

        const altitude = Math.max(0, Vector3D.FromArray(level.playerModel.transform.position).y).toFixed(1);
        frame.Panel({ x: 16, y: level.height - 62, width: level.width - 32, height: 46 });
        const objective = level.goalUnlocked ? 'BANDEIRA LIBERADA' : `${level.goalCoins - level.collectedCoins} MOEDAS PARA A BANDEIRA`;
        frame.Text(objective, 30, level.height - 42, { size: 11, color: frame.theme.gold, weight: 700 });
        frame.Text(`${altitude} m  /  ${level.checkpoint ? 'Checkpoint ativo' : 'Encontre o checkpoint'}`, 30, level.height - 25,
            { size: 11, color: frame.theme.muted });
        const device = Input.GetConnectedGamepadIndices().length ? 'GAMEPAD' : 'TECLADO';
        this.help.view?.DrawAction('HELP',level.width-170,level.height-55);
        this.help.Draw(level.ui.Draw, this.helpVisible);
        if (level.handoff > 0) {
            frame.context.save();
            const fade = level.pendingSegment === null ? level.handoff / 0.55 : 1 - level.handoff / 0.32;
            frame.context.globalAlpha = Math.min(1, fade);
            frame.context.fillStyle = '#101c2c';
            frame.context.fillRect(0, 0, level.ui.Screen.Width, level.ui.Screen.Height);
            frame.context.globalAlpha = Math.min(1, level.handoff * 3);
            frame.Panel({ x: level.width / 2 - 132, y: 112, width: 264, height: 40 });
            frame.Text('Segment ' + (level.segment + 1) + ' / ' + level.route.length, level.width / 2, 138,
                { align: 'center', size: 16, color: frame.theme.gold });
            frame.context.restore();
        }
        if (level.gameState === 'WON') this.DrawResult(level);
    }

    DrawResult(level) {
        const frame = this.frame;
        frame.Panel(Layout.result);
        frame.Text('EXPEDIÇÃO CONCLUÍDA', 360, 200, { size: 24, align: 'center', weight: 700, color: frame.theme.gold });
        frame.Text(`${level.time.toFixed(1)} s    /    ${level.score} pontos`, 360, 238, { size: 18, align: 'center' });
        frame.Text('Enter / A  TENTAR NOVAMENTE', 360, 271, { size: 12, align: 'center' });
        frame.Text('Esc / B  ESCOLHER EXPEDIÇÃO', 360, 295, { size: 11, align: 'center', color: frame.theme.muted });
    }
}
