import { Level, AssetManager, ActionManager, SceneDocument, SoundEffects } from 'gameforgejs/core';
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
        // Layout: scenes/playground.gfscene.json (gameforgejs.scene)
        const scene = new SceneDocument(assets.jsons.playground_scene);
        this.layers = scene.Nodes({ layer: 'parallax' }).map(node => {
            const [x, y] = scene.WorldPosition(node);
            return new ParallaxLayer2D(this.screen, { x, y, ...scene.Component(node, 'Parallax') }, { assets });
        });
        const actor = scene.Node('patrol_actor');
        const bounds = scene.Rect(scene.Node('patrol_bounds'));
        const [actorX, actorY] = scene.WorldPosition(actor);
        this.actor = new PatrolActor(this.screen, { x: actorX, y: actorY }, {
            left: bounds.x,
            right: bounds.x + bounds.width,
            speed: scene.Component(actor, 'Data').speed ?? 100,
        });
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
