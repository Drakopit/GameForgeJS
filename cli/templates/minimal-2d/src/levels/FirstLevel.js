import { Level } from 'gameforgejs/core';
import { Draw, Screen } from 'gameforgejs/2d';
import { Player } from '../entities/Player.js';

export class FirstLevel extends Level {
    constructor() {
        super();
        this.TelaId = 'gameCanvas';
        this.caption = '__PROJECT_NAME__';
    }

    OnStart(context = this.context) {
        const { width = 800, height = 450 } = context.config.screen ?? {};
        this.screen = new Screen(this.TelaId, width, height, { config: context.config });
        this.draw = new Draw(this.screen);
        this.AddEntity(new Player(this.screen));
        super.OnStart(context);
    }

    OnGUI() {
        super.OnGUI();
        this.draw.Color = '#ffffff';
        this.draw.FontSize = '16px';
        this.draw.DrawText('Move with WASD or the arrow keys.', 16, 28);
    }
}
