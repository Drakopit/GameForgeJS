// @ts-check
import { GameViewport, Level } from 'gameforgejs/core';
import { Screen } from 'gameforgejs/2d';
import { FoundrySettings } from '../data/FoundrySettings.js';
import { FoundryWorld } from '../entities/FoundryWorld.js';
import { FoundryProp } from '../entities/FoundryProp.js';
import { FoundryRenderer } from '../rendering/FoundryRenderer.js';
import { FoundryHUD } from '../ui/FoundryHUD.js';
import { FoundryInput } from '../input/FoundryInput.js';
import { RuntimeTelemetry } from '../components/RuntimeTelemetry.js';
import { RequireResource } from '../data/RequireResource.js';
import { FoundryAudio } from '../components/FoundryAudio.js';

/** Composition root only: engine lifecycle delegates simulation, input, passes and UI. */
export class FoundryLevel extends Level {
    /** @type {() => void} */ releaseViewport = () => {};
    constructor() {
        super(); this.caption = 'Storm Foundry — GameForgeJS FX Lab';
        /** @type {{model?: FoundrySettings, world?: FoundryWorld, renderer?: FoundryRenderer, hud?: FoundryHUD, controls?: FoundryInput, telemetry?: RuntimeTelemetry}} */
        this.resources = {};
    }
    get model() { return RequireResource(this.resources.model, 'settings'); }
    get world() { return RequireResource(this.resources.world, 'world'); }
    get renderer() { return RequireResource(this.resources.renderer, 'renderer'); }
    get hud() { return RequireResource(this.resources.hud, 'HUD'); }
    get controls() { return RequireResource(this.resources.controls, 'input'); }
    get telemetry() { return RequireResource(this.resources.telemetry, 'telemetry'); }
    /** @param {import('../data/FoundryTypes.js').FoundryContext} context */
    OnStart(context = this.context) {
        this.screen = new Screen('storm-foundry', 1280, 800, { config: context.config });
        this.resources.model = new FoundrySettings(/** @type {import('../data/FoundryTypes.js').ShowcaseData} */ (context.assets.jsons.showcase));
        this.resources.world = new FoundryWorld(this.model, this.screen.Width, this.screen.Height);
        for (let index = 0; index < this.model.data.limits.props; index++) {
            const prop = new FoundryProp(this.world); this.world.props.push(prop); this.AddEntity(prop);
        }
        this.AddEntity(this.world);
        this.world.AddComponent(new FoundryAudio(context.services.get('audio'),this.world));
        this.resources.telemetry = new RuntimeTelemetry();
        this.resources.renderer = new FoundryRenderer(this.world, this.screen);
        this.resources.hud = new FoundryHUD(this); this.resources.controls = new FoundryInput(this);
        this.releaseViewport = GameViewport.Bind(this.screen, { minWidth: 360, maxWidth: 1440,
            onResize: () => {
                this.controls.Cancel(); this.world.Resize(this.screen.Width, this.screen.Height); this.renderer.Resize();
            } });
        this.world.Clear();
        super.OnStart(context);
    }
    /** @param {number} dt */
    OnUpdate(dt) {
        const wasOpen = this.hud.panel.open;
        this.hud.Update(dt); this.controls.Update(dt, wasOpen);
        super.OnUpdate(dt); this.telemetry.OnUpdate(dt);
    }
    OnDrawn() { this.renderer.Draw(); }
    OnGUI() { this.controls.Draw(); this.hud.Draw(); }
    /** @param {number} index */
    SetPreset(index) { this.model.Apply(index); this.world.Clear(); }
    Reset() { this.controls.Cancel(); this.SetPreset(0); this.model.debug = false; this.model.telemetry = true; }
    OnExit() {
        this.releaseViewport(); this.resources.controls?.Cancel(); this.resources.hud?.Dispose(); this.resources.renderer?.Dispose();
        super.OnExit();
    }
}
