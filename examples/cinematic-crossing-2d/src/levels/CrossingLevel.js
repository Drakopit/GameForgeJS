import { Level, GameViewport, Vector2D, MathExt, SoundEffects } from 'gameforgejs/core';
import { Screen, Camera, GameObject } from 'gameforgejs/2d';
import { ScenarioWithRoute } from '../data/CrossingScene.js';
import { Courier } from '../entities/Courier.js';
import { CrossingLandscape } from '../entities/CrossingLandscape.js';
import { CrossingSequence } from '../components/CrossingSequence.js';
import { CrossingHUD } from '../ui/CrossingHUD.js';

export class CrossingLevel extends Level {
    OnStart(context = this.context) {
        this.rules = ScenarioWithRoute(context.assets.jsons.scenario, context.assets.jsons.crossing); this.caption = 'Lantern Crossing / Camera + Timeline';
        this.screen = new Screen('crossing', 960, 640, {config: context.config});
        this.camera = new Camera(new Vector2D(), new Vector2D(960, 640)); this.camera.Init(this.screen, this.rules.world);
        this.focus = new Vector2D(240, 360); this.magnification = 1; this.fade = 0; this.dialogue = '';
        this.sound = new SoundEffects(context.services.get('audio'),context.config.audio?.cues);
        this.AddEntity(new CrossingLandscape(this)); this.courier = this.AddEntity(new Courier(this));
        this.sequence = new CrossingSequence(this); const director = new GameObject(); director.AddComponent(this.sound); director.AddComponent(this.sequence); this.AddEntity(director);
        this.hud = new CrossingHUD(this);
        this.releaseViewport = GameViewport.Bind(this.screen, {onResize: () => {this.hud.stick.Cancel(); this.camera.size.Set(this.screen.Width, this.screen.Height);}});
        super.OnStart(context); this.Play();
    }
    Play() { this.sequence.Cancel(); this.courier.path.Restart(); this.sequence.Play(); this.sound.Play('transition'); }
    OnUpdate(dt) {
        this.hud.Update(); if(!this.hud.help.visible)super.OnUpdate(dt);
        const baseZoom = Math.min(this.screen.Width / 760, this.screen.Height / 580);
        this.camera.SetZoom(baseZoom * this.magnification);
        const response = this.sequence.time === 0 ? 1 : 1 - Math.exp(-6 * dt);
        this.camera.position.Set(MathExt.Lerp(this.camera.position.x, this.focus.x - this.screen.Width / (2 * this.camera.zoom), response),
            MathExt.Lerp(this.camera.position.y, this.focus.y - 60 - this.screen.Height / (2 * this.camera.zoom), response));
    }
    OnDrawn() {
        super.OnDrawn(); const ctx = this.screen.Context;
        ctx.save(); ctx.globalAlpha = this.fade; ctx.fillStyle = '#101e2b'; ctx.fillRect(0, 0, this.screen.Width, this.screen.Height); ctx.restore();
    }
    OnGUI() { this.hud.Draw(); }
    OnExit() { this.releaseViewport?.(); this.hud?.Dispose(); super.OnExit(); }
}
