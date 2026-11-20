import { ActionManager, Vector2D } from 'gameforgejs/core';
import { Draw, HUDFrame, ActionBar, InputHelpPanel as InfoPanel, VirtualStick } from 'gameforgejs/2d';

export class AtlasHUD {
    constructor(level) {
        this.level = level; const draw = new Draw(level.screen); this.frame = new HUDFrame(draw); this.stick = new VirtualStick(level.screen);
        this.help = new InfoPanel(draw, {title: 'Graph → stage → unlock', lines: []});
        this.bar = new ActionBar(level.screen, draw, [{label: 'ENTER', run: () => level.EnterStage()},
            {label: 'BACK', run: () => level.mode = 'map'}, {label: 'RESET', run: () => level.Reset()}, {label: 'HELP', run: () => this.help.Toggle()}]);
    }
    Direction() {
        const value = this.stick.direction.Add(new Vector2D(ActionManager.GetActionValue('RIGHT') - ActionManager.GetActionValue('LEFT'), ActionManager.GetActionValue('DOWN') - ActionManager.GetActionValue('UP')));
        return value.Length() > 1 ? value.Normalize() : value;
    }
    Update() {
        const screen = this.level.screen; this.stick.origin.Set(76, screen.Height - 82); this.stick.Update(); this.bar.Layout();
        if (ActionManager.IsActionDown('SKIP')) this.level.mode = 'map';
        if (ActionManager.IsActionDown('RESET')) this.level.Reset();
        if (ActionManager.IsActionDown('HELP')) this.help.Toggle();
        this.help.layout = {...this.help.layout, x: 12, width: Math.min(580, screen.Width - 24), lineHeight: 24};
    }
    Draw() {
        const level = this.level, node = level.progress.nodes.get(level.progress.current);
        this.frame.Text('ROUTE ATLAS', 20, 33, {size: 24, weight: 700});
        this.frame.Text(node.name, 20, 59, {size: 18, color: '#eed095'});
        const text = level.mode === 'stage' ? `Collect shards: ${level.trial.collected.size}/3 · avoid red sentries` : `${level.progress.cleared.size}/8 cleared · ${level.message}`;
        this.frame.Text(text, 20, 83, {size: 13, maxWidth: level.screen.Width - 40});
        this.stick.Draw(level.screen.Context); this.bar.Draw(); this.help.OnDrawn();
    }
    Dispose() { this.help.Dispose(); this.bar.Dispose(); this.stick.Cancel(); }
}
