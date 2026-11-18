import { Draw } from 'gameforgejs/2d';

export class PlatformerHUD {
    constructor(screen) {
        this.draw = new Draw(screen);
    }

    Draw(level) {
        let instruction = 'Collect all coins, then reach the flag';
        if (level.won) {
            instruction = level.stage.last
                ? 'Both stages complete! Enter / Start to play again.'
                : 'Stage complete! Enter / Start for the next stage.';
        }

        this.draw.Color = '#edf5ec';
        this.draw.FontSize = '20px';
        this.draw.DrawText(level.stage.title, 24, 36);
        this.draw.FontSize = '14px';
        this.draw.DrawText(`Coins: ${level.collectedCount}/${level.coins.length} | ${instruction}`, 24, 62);
        this.draw.DrawText('WASD / left stick: move | Space / A: jump | R / Y: restart', 24, 84);
    }
}
