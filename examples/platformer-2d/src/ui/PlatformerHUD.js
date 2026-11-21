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

        this.frame.Panel({ x: 12, y: 12, width: level.screen.Width-24, height: 92 });
        this.draw.Color = '#edf5ec';
        this.draw.FontSize = '20px';
        this.frame.Text(level.stage.title,24,38,{size:20,weight:700,maxWidth:level.screen.Width-185});
        this.draw.FontSize = '14px';
        this.frame.Text(`Coins ${level.collectedCount}/${level.coins.length}`,24,64,{size:15});
        this.frame.Text(instruction,24,88,{size:12,maxWidth:level.screen.Width-48});
        this.help.DrawAction('HELP',level.screen.Width-145,20);
        this.help.OnDrawn();
    }
}
