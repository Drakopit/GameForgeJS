import { AreaAnnouncement } from './AreaAnnouncement.js';
import { HealthBar } from './HealthBar.js';

export class ToonRoomHUD {
    constructor(ui) {
        this.draw = ui.Draw;
        this.helpVisible = false;
        this.healthBar = new HealthBar(this.draw);
        this.announcement = new AreaAnnouncement(this.draw);
    }

    ShowArea(name) {
        this.announcement.Show(name);
    }

    OnUpdate(dt, areaName) {
        this.announcement.OnUpdate(dt, areaName);
    }

    ToggleHelp() {
        this.helpVisible = !this.helpVisible;
    }

    Draw(level) {
        this.draw.Color = '#173239';
        this.draw.DrawRect(16, 16, 600, 112);
        this.draw.Color = '#fff0ca';
        this.draw.FontSize = '20px';
        this.draw.DrawText(`Toon adventure — ${level.areaName}`, 30, 42);
        this.draw.FontSize = '14px';
        this.healthBar.Draw(level.player.health, 30, 76);
        this.draw.Color = '#fff0ca';
        this.draw.DrawText(`Life: ${level.player.health.hp}/${level.player.health.maxHp} | Defeated: ${level.defeatedCount}/${level.enemies.length} | H / Start: help`, 30, 66);
        let status = `Follow the trail north | Space / X: strike (${level.player.attack.phase})`;
        if (level.defeatedCount === level.enemies.length) status = 'Trail cleared — keep exploring! R / Y: restart';
        if (level.player.waterContact.zone) status = 'Shallow water — slower movement | Space / X: strike';
        if (level.result) status = `${level.result.toUpperCase()} — R / Y to restart`;
        this.draw.DrawText(status, 30, 114);

        this.announcement.Draw(level.width);
        if (this.helpVisible) this.DrawHelp();
    }

    DrawHelp() {
        this.draw.Color = '#173239';
        this.draw.DrawRect(180, 160, 600, 290);
        this.draw.Color = '#fff0ca';
        this.draw.FontSize = '24px';
        this.draw.DrawText('Explore the forest trail', 208, 200);
        this.draw.FontSize = '16px';
        this.draw.DrawText('Move: WASD / arrows or left stick / D-pad', 208, 238);
        this.draw.DrawText('Strike: Space / X (Xbox), Square (PS), Y (Nintendo)', 208, 268);
        this.draw.DrawText('Help: H / Start / Options / + (game keeps running)', 208, 298);
        this.draw.FontSize = '14px';
        this.draw.DrawText('Restart: R / top face button | Bands: B / Select / Share / −', 208, 326);
        this.draw.DrawText('Yellow: windup. Red: impact. Dodge, then strike during recovery.', 208, 362);
        this.draw.DrawText('Enter the pond through its open left bank; shallow water slows you.', 208, 422);
        this.draw.DrawText('Characters and forest: KayKit / Kay Lousberg (CC0).', 208, 396);
    }
}
