import { InputHelpPanel, Draw as ControlGuideDraw } from 'gameforgejs/2d';
import { ActionManager as ControlGuideActions } from 'gameforgejs/core';
import { Draw } from "gameforgejs/2d";
import { AssetManager } from "gameforgejs/core";
import { Level } from "gameforgejs/core";
import { Screen } from "gameforgejs/2d";
import { TacticalBattleManager } from "../tactical/TacticalBattleManager.js";

const W = 640;
const H = 480;

export class TacticalMapLevel extends Level {
    constructor() {
        super();
        this.caption = "Tactical RPG - Tactical Map";
        this.TelaId = "TacticalMap";
    }

    OnStart() {
        this.screen = new Screen("TacticalMap", W, H, { config: this.context?.config });
        this.controlsHelp=new InputHelpPanel(new ControlGuideDraw(this.screen),{title:'Controls'});
        this.draw = new Draw(this.screen);
        this.assets = AssetManager.instance;
        this.battle = new TacticalBattleManager({
            level: this,
            assets: this.assets,
        });
        this.entities = this.battle.Entities;
        this.entities.forEach(entity => {
            entity.level = this;
        });
        super.OnStart();
    }

    OnExit() {
        this.controlsHelp?.Dispose();

        super.OnExit();
    }

    OnUpdate(dt) {
        if(ControlGuideActions.IsActionDown('HELP'))this.controlsHelp?.Toggle();

        super.OnUpdate(dt);
        const flow = this.battle.Update(dt);
        if (flow?.next) this.Next = true;
    }

    OnDrawn() {
        this.screen.Refresh();
        this.battle.Draw();
    }

    OnGUI() {
        super.OnGUI();
        this.battle.DrawHud(this.FPS);

        this.controlsHelp?.OnDrawn();
}
}
