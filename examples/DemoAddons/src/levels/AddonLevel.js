import { Level, AssetManager } from 'gameforgejs/core';
import { Screen, Draw } from 'gameforgejs/2d';
import { ParallaxLayer2D } from 'gameforgejs/addons/parallax';
import { PatrolActor } from '../entities/PatrolActor.js';

export class AddonLevel extends Level {
    constructor() {
        super();
        this.TelaId = 'addon-playground';
        this.caption = 'Addon playground';
        this.layers = [];
    }
    OnStart(context = this.context) {
        const { width, height } = context.config.screen;
        this.screen = new Screen(this.TelaId, width, height, { config: context.config });
        this.draw = new Draw(this.screen);
        const assets = context.assets ?? AssetManager.instance;
        this.layers = [
            new ParallaxLayer2D(this.screen, { sprite: 'hills', speedX: -12 }, { assets }),
            new ParallaxLayer2D(this.screen, { sprite: 'trees', speedX: -40 }, { assets }),
        ];
        this.actor = new PatrolActor(this.screen);
        this.AddEntity(this.actor);
        super.OnStart(context);
    }
    OnUpdate(dt) {
        this.layers.forEach(layer => layer.OnUpdate(dt));
        super.OnUpdate(dt);
    }
    OnDrawn() {
        this.screen.Refresh();
        this.draw.Color = '#c7e5d9';
        this.draw.DrawRect(0, 0, this.screen.width, this.screen.height);
        this.layers.forEach(layer => layer.OnDrawn());
        super.OnDrawn();
    }
    OnGUI() {
        super.OnGUI();
        this.draw.Color = '#183d42';
        this.draw.FontSize = '20px';
        this.draw.DrawText(`State: ${this.actor.label}`, 24, 36);
        this.draw.FontSize = '14px';
        this.draw.DrawText('Hills: 12 px/s  |  Trees: 40 px/s', 24, 60);
    }
    OnDestroy() {
        this.layers.forEach(layer => layer.Dispose());
        this.layers = [];
        const screen = this.screen;
        try { super.OnDestroy(); }
        finally { screen?.Dispose(); }
    }
}
