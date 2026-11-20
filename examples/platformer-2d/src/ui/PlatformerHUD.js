import { Draw, HUDFrame, InputHelpPanel as InfoPanel } from 'gameforgejs/2d';

export class PlatformerHUD {
    constructor(screen) {
        this.draw = new Draw(screen);
        this.frame = new HUDFrame(this.draw);
        this.help = new InfoPanel(this.draw, { title: 'PLATFORMER FIELD GUIDE', y: 120, lines: [] });
    }

    Draw(level) {
        let instruction = 'Collect all coins, then reach the flag';
        if (level.won) {
            instruction = level.stage.last
                ? 'Both stages complete! Enter / Start to play again.'
                : 'Stage complete! Enter / Start for the next stage.';
        }

        this.frame.Panel({ x: 12, y: 12, width: 935, height: 92 });
        this.draw.Color = '#edf5ec';
        this.draw.FontSize = '20px';
        this.draw.DrawText(level.stage.title, 24, 36);
        this.draw.FontSize = '14px';
        this.draw.DrawText(`Coins: ${level.collectedCount}/${level.coins.length} | ${instruction}`, 24, 62);
        this.help.DrawAction('HELP',24,68);
        this.help.OnDrawn();
    }
}
