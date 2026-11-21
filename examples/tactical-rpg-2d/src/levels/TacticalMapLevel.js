import { expedition } from '../state/Expedition.js';
import { GameObject, InputHelpPanel, Draw as ControlGuideDraw } from 'gameforgejs/2d';
import { ActionManager as ControlGuideActions } from 'gameforgejs/core';
import { Draw } from "gameforgejs/2d";
import { AssetManager } from "gameforgejs/core";
import { Level, SoundEffects } from "gameforgejs/core";
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
        this.controlsHelp=new InputHelpPanel(new ControlGuideDraw(this.screen),{ title: 'Controls', playerRows: () => expedition.seats === 2 ? [
            this.controlsHelp.data.rows,
            [{ label: 'Up / Left', rules: [{ device: 'keyboard', input: 'KeyI' }, { device: 'keyboard', input: 'KeyJ' },
                { device: 'gamepad', input: 'DPAD_UP' }, { device: 'gamepad', input: 'DPAD_LEFT' }] },
                { label: 'Down / Right', rules: [{ device: 'keyboard', input: 'KeyK' }, { device: 'keyboard', input: 'KeyL' },
                { device: 'gamepad', input: 'DPAD_DOWN' }, { device: 'gamepad', input: 'DPAD_RIGHT' }] },
                { label: 'Confirm', rules: [{ device: 'keyboard', input: 'KeyF' }, { device: 'gamepad', input: 'A' }] },
                { label: 'Cancel', rules: [{ device: 'keyboard', input: 'KeyG' }, { device: 'gamepad', input: 'B' }] }],
        ] : [] });
        this.draw = new Draw(this.screen);
        this.assets = AssetManager.instance;
        const director = new GameObject();
        const sound = director.AddComponent(new SoundEffects(this.context.services.get('audio')));
        this.battle = new TacticalBattleManager({
            sound,
            level: this,
            assets: this.assets,
        });
        for (const unit of this.battle.Entities) this.AddEntity(unit);
        this.AddEntity(director);
        super.OnStart();
    }

    OnExit() {
        this.controlsHelp?.Dispose();

        super.OnExit();
    }

    OnUpdate(dt) {
        if(ControlGuideActions.IsActionDown('HELP'))this.controlsHelp?.Toggle();
        if (this.controlsHelp.visible) return;

        super.OnUpdate(dt);
        const flow = this.battle.Update(dt);
        if (flow?.next) this.Next = true;
        if (flow?.back) this.Back = true;
    }

    OnDrawn() {
        this.screen.Refresh();
        this.battle.Draw();
    }

    OnGUI() {
        super.OnGUI();
        this.battle.DrawHud();

        this.controlsHelp?.OnDrawn();
}
}
