import { Level, EventEmitter, GameViewport, SoundEffects } from 'gameforgejs/core';
import { Screen, GameObject } from 'gameforgejs/2d';
import { ScenarioWithAtlas } from '../data/AtlasScene.js';
import { RouteProgress } from '../data/RouteProgress.js';
import { RouteNavigator } from '../components/RouteNavigator.js';
import { StageTrial } from '../components/StageTrial.js';
import { AtlasView } from '../entities/AtlasView.js';
import { AtlasHUD } from '../ui/AtlasHUD.js';

export class AtlasLevel extends Level {
    OnStart(context = this.context) {
        this.caption = 'Route Atlas / Interactive World Map'; this.rules = ScenarioWithAtlas(context.assets.jsons.scenario, context.assets.jsons.atlas);
        this.screen = new Screen('atlas', 960, 640, {config: context.config});
        this.progress = new RouteProgress(this.rules); this.events = new EventEmitter(); this.mode = 'map'; this.message = 'Enter Tide Harbor to open the first route.';
        this.navigator = new RouteNavigator(this); this.trial = new StageTrial(this);
        this.sound = new SoundEffects(context.services.get('audio'),context.config.audio?.cues);
        this.view = this.AddEntity(new AtlasView(this)); const state = new GameObject(); state.AddComponent(this.sound); state.AddComponent(this.navigator); state.AddComponent(this.trial); this.AddEntity(state);
        this.hud = new AtlasHUD(this);
        this.removeClear = this.events.on('stage:cleared', id => { this.progress.Clear(id); this.message = 'Stage clear! New routes are highlighted.'; this.sound.Play('success'); });
        this.releaseViewport = GameViewport.Bind(this.screen, {onResize: () => this.hud.stick.Cancel()}); super.OnStart(context);
    }
    EnterStage() {
        if (this.mode !== 'map' || this.navigator.destination) return;
        this.mode = 'stage'; this.events.emit('stage:entered', this.progress.current); this.sound.Play('transition');
    }
    Reset() { this.mode = 'map'; this.progress.Reset(); this.navigator.destination = null; this.navigator.position.Copy(this.progress.nodes.get(this.progress.start)); this.message = 'Progress reset.'; }
    OnUpdate(dt) { this.hud.Update(); if(!this.hud.help.visible)super.OnUpdate(dt); }
    OnFixedUpdate(dt) {if(!this.hud.help.visible)super.OnFixedUpdate(dt);}
    OnGUI() { this.hud.Draw(); }
    OnExit() { this.releaseViewport?.(); this.removeClear?.(); this.hud?.Dispose(); super.OnExit(); }
}
