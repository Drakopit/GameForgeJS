export class ToonRoomHUD {
    constructor(ui) {
        this.draw = ui.Draw;
        this.helpVisible = false;
    }

    ToggleHelp() {
        this.helpVisible = !this.helpVisible;
    }

    Draw(level) {
        this.draw.Color = '#173239';
        this.draw.DrawRect(16, 16, 540, 98);
        this.draw.Color = '#fff0ca';
        this.draw.FontSize = '20px';
        this.draw.DrawText(`Toon adventure — ${level.areaName}`, 30, 42);
        this.draw.FontSize = '14px';
        this.draw.DrawText(`Life: ${level.player.health.hp}/${level.player.health.maxHp} | Defeated: ${level.defeatedCount}/${level.enemies.length} | H: help`, 30, 66);
        let status = `Follow the trail north | Space: strike (${level.player.attack.phase})`;
        if (level.defeatedCount === level.enemies.length) status = 'Trail cleared — keep exploring! R: restart';
        if (level.result) status = `${level.result.toUpperCase()} — R to restart`;
        this.draw.DrawText(status, 30, 92);

        if (this.helpVisible) this.DrawHelp();
    }

    DrawHelp() {
        this.draw.Color = '#173239';
        this.draw.DrawRect(180, 160, 600, 240);
        this.draw.Color = '#fff0ca';
        this.draw.FontSize = '24px';
        this.draw.DrawText('Explore the forest trail', 208, 200);
        this.draw.FontSize = '16px';
        this.draw.DrawText('WASD / arrows: move the knight', 208, 238);
        this.draw.DrawText('Space: strike   B: lighting bands   R: restart trail', 208, 268);
        this.draw.DrawText('H: close help — the game keeps running', 208, 298);
        this.draw.FontSize = '14px';
        this.draw.DrawText('Yellow: windup. Red: impact. Dodge, then strike during recovery.', 208, 346);
        this.draw.DrawText('Characters and forest: KayKit / Kay Lousberg (CC0).', 208, 370);
    }
}
