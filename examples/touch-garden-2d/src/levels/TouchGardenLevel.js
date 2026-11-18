import { ActionManager, Input, Level } from 'gameforgejs/core';
import { Screen } from 'gameforgejs/2d';
import { TouchControls } from '../input/TouchControls.js';
import { GardenPlayer } from '../entities/GardenPlayer.js';
import { GardenObstacle } from '../entities/GardenObstacle.js';
import { GardenCrystal } from '../entities/GardenCrystal.js';
import { GardenBackground } from '../entities/GardenBackground.js';
import { TouchGardenHUD } from '../ui/TouchGardenHUD.js';
import { GardenSettings as Settings } from '../data/GardenSettings.js';

export class TouchGardenLevel extends Level {
    constructor() {
        super();
        this.caption = 'GameForgeJS - Touch Garden 2D';
    }

    OnStart(context = this.context) {
        const { width, height } = context.config.screen;
        this.screen = new Screen('touch-garden', width, height, { config: context.config });
        this.controls = new TouchControls(Input.instance.touch, this.screen);
        this.AddEntity(new GardenBackground(this.screen));
        this.obstacles = Settings.obstacles.map(box => this.AddEntity(new GardenObstacle(this.screen, box)));
        this.crystals = Settings.crystals.map(position => this.AddEntity(new GardenCrystal(this.screen, position)));
        this.player = this.AddEntity(new GardenPlayer(this.screen, this.controls, this.obstacles));
        this.hud = new TouchGardenHUD(this.screen, this.controls);
        this.collected = 0;
        super.OnStart(context);
    }

    OnUpdate(dt) {
        this.controls.Update();
        if (this.controls.resetPressed || ActionManager.IsActionDown('RESET')) this.ResetGarden();
        if (this.controls.helpPressed || ActionManager.IsActionDown('HELP')) this.hud.helpVisible = !this.hud.helpVisible;
        super.OnUpdate(dt);
    }

    OnFixedUpdate(dt) {
        super.OnFixedUpdate(dt);
        for (const crystal of this.crystals) if (crystal.TryCollect(this.player)) this.collected++;
    }

    ResetGarden() {
        this.player.Reset();
        this.controls.Reset();
        for (const crystal of this.crystals) crystal.collected = false;
        this.collected = 0;
    }

    OnGUI() { super.OnGUI(); this.hud.Draw(this); }

    OnExit() {
        this.controls.Reset();
        super.OnExit();
    }
}
