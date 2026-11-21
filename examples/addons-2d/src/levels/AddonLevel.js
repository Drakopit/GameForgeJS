import { Level, AssetManager, ActionManager, SoundEffects } from 'gameforgejs/core';
import { Screen, Draw, HUDFrame, InputHelpPanel } from 'gameforgejs/2d';
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
        this.hud = new HUDFrame(this.draw);
        this.help = new InputHelpPanel(this.draw);
        const assets = context.assets ?? AssetManager.instance;
        this.layers = [
            new ParallaxLayer2D(this.screen, { sprite: 'hills', speedX: -12 }, { assets }),
            new ParallaxLayer2D(this.screen, { sprite: 'trees', speedX: -40 }, { assets }),
        ];
        this.actor = new PatrolActor(this.screen);
        this.sound = this.actor.AddComponent(new SoundEffects(this.context.services.get('audio')));
        this.AddEntity(this.actor);
        super.OnStart(context);
    }
    OnUpdate(dt) {
        if (ActionManager.IsActionDown('HELP')) {
            this.help.Toggle();
            this.sound.Play('select');
        }
        if (this.help.visible) return;
        this.layers.forEach(layer => layer.OnUpdate(dt));
        super.OnUpdate(dt);
    }
    OnDrawn() {
        this.screen.Refresh();
        this.draw.Color = '#c7e5d9';
        this.draw.DrawRect(0, 0, this.screen.width, this.screen.height);
        this.layers.forEach(layer => layer.OnDrawn());
        for(const entity of this.entities)entity.OnDrawn();
    }
    OnGUI() {
        super.OnGUI();
        this.hud.Panel({ x: 12, y: 12, width: 600, height: 108 });
        this.hud.Text('ADDON BUILDING BLOCKS', 28, 40, { size: 20, color: this.hud.theme.gold, weight: 700 });
        this.hud.Text(`State: ${this.actor.label} / parallax + state machine`, 28, 66, { size: 14 });
        this.help.DrawAction('HELP', 28, 88);
        this.help.OnDrawn();
    }

    OnExit() {
        this.help?.Dispose();
        this.layers.forEach(layer => layer.Dispose());
        this.layers = [];
        super.OnExit();
    }
}
