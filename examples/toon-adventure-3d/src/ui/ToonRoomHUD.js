import { HUDFrame } from 'gameforgejs/2d';
import { AreaAnnouncement } from './AreaAnnouncement.js';
import { HealthBar } from './HealthBar.js';

const Layout = Object.freeze({
    player: { x: 16, y: 16, width: 300, height: 96 },
    health: { x: 92, y: 59, width: 204, height: 15 },
    objective: { width: 230, height: 83, margin: 16 },
    help: { x: 165, y: 175, width: 630, height: 290 },
});

export class ToonRoomHUD {
    constructor(ui) {
        this.draw = ui.Draw;
        this.frame = new HUDFrame(this.draw);
        this.helpVisible = false;
        this.healthBar = new HealthBar(this.frame, Layout.health);
        this.announcement = new AreaAnnouncement(this.draw);
    }

    ShowArea(name) { this.announcement.Show(name); }
    OnUpdate(dt, areaName) { this.announcement.OnUpdate(dt, areaName); }
    ToggleHelp() { this.helpVisible = !this.helpVisible; }

    Draw(level) {
        const frame = this.frame;
        frame.Panel(Layout.player);
        frame.Badge('EX', 29, 31, 48);
        frame.Text('EXPLORER', 92, 40, { size: 15, weight: 700, color: frame.theme.gold });
        frame.Text('Guardião da trilha', 92, 53, { size: 10, color: frame.theme.muted });
        this.healthBar.Draw(level.player.health);
        frame.Text(`HP   ${level.player.attack.phase.toUpperCase()}`, 92, 94, { size: 11, color: frame.theme.muted });
        const right = level.width - Layout.objective.width - Layout.objective.margin;
        frame.Panel({ x: right, y: 16, width: Layout.objective.width, height: Layout.objective.height });
        frame.Text('EXPEDIÇÃO  /  FLORESTA', right + 14, 36, { size: 10, color: frame.theme.gold, weight: 700 });
        frame.Text(`${level.defeatedCount} / ${level.enemies.length} sentinelas`, right + 14, 57, { size: 17, weight: 700 });
        frame.Meter(level.defeatedCount / level.enemies.length, { x: right + 14, y: 70, width: 202, height: 5 }, frame.theme.gold);
        frame.Text(level.areaName, right + 14, 89, { size: 10, color: frame.theme.muted });

        let status = 'Siga a trilha ao norte';
        if (level.defeatedCount === level.enemies.length) status = 'Trilha concluída — explore livremente';
        if (level.player.waterContact.zone) status = 'Água rasa — movimento reduzido';
        if (level.result) status = 'Você caiu. R / Y para recomeçar';
        frame.Panel({ x: 16, y: level.height - 56, width: 480, height: 40 });
        frame.Text(status, 30, level.height - 31, { size: 13, weight: 700 });
        frame.Text('Space / X  ATACAR     H / Start  AJUDA', level.width - 18, level.height - 24,
            { size: 11, color: frame.theme.text, align: 'right' });
        this.announcement.Draw(level.width);
        if (this.helpVisible) this.DrawHelp();
    }

    DrawHelp() {
        const frame = this.frame;
        frame.Panel(Layout.help);
        frame.Text('EXPEDIÇÃO NA FLORESTA', 189, 207, { size: 21, color: frame.theme.gold, weight: 700 });
        const lines = [
            'Mover: WASD / setas ou analógico esquerdo / D-pad',
            'Atacar: Space / X (Xbox), Square (PS), Y (Nintendo)',
            'Ajuda: H / Start / Options / + — o mundo continua ativo',
            'Recomeçar: R / botão superior    Luz: B / Select / Share / Minus',
            'Amarelo: preparação. Vermelho: impacto. Esquive e contra-ataque.',
            'Entre no lago pela margem esquerda. A água rasa reduz a velocidade.',
        ];
        lines.forEach((text, index) => frame.Text(text, 189, 240 + index * 28, { size: 14, maxWidth: 580 }));
        frame.Text('Personagens e floresta: KayKit / Kay Lousberg (CC0)', 189, 443, { size: 11, color: frame.theme.muted });
    }
}
