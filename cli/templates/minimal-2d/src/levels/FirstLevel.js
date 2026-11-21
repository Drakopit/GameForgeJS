import { Level } from 'gameforgejs/core';
import { Draw, Screen, HUDFrame } from 'gameforgejs/2d';
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
        this.hud = new HUDFrame(this.draw);
        this.AddEntity(new Player(this.screen));
        super.OnStart(context);
    }

    OnGUI() {
        super.OnGUI();
        this.hud.Panel({ x: 16, y: 16, width: 440, height: 75 });
        this.hud.Text(this.caption, 32, 44, { size: 22, color: this.hud.theme.gold });
        this.hud.Text('Move with WASD or the arrow keys.', 32, 70, { size: 14 });
    }
}
