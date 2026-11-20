import { ActionManager, Vector2D } from 'gameforgejs/core';
import { Draw, HUDFrame, ActionBar, VirtualStick, InfoPanel } from 'gameforgejs/2d';

export class ArenaHUD {
    constructor(level) {
        this.level = level; const draw = new Draw(level.screen); this.frame = new HUDFrame(draw); this.stick = new VirtualStick(level.screen);
        this.help = new InfoPanel(draw, {title: 'Read → evade → punish', lines: [
            'WASD / left stick / touch stick: move.', 'Hold Space / A or tap FIRE: shoot toward boss.',
            'C / Y / DASH: evade through attacks.', 'Gold fan/circle/lane: locked aim before an attack.',
            'Punish during recovery. Three health phases.', 'Hazards first mark, then burn. R / RETRY: reset.',
        ]});
        this.bar = new ActionBar(level.screen, draw, [{label: 'FIRE', run: () => level.shootQueued = true},
            {label: 'DASH', run: () => level.dashQueued = true}, {label: 'RETRY', run: () => level.Reset()}, {label: 'HELP', run: () => this.help.Toggle()}]);
    }
    Direction() {
        const value = this.stick.direction.Add(new Vector2D(ActionManager.GetActionValue('RIGHT') - ActionManager.GetActionValue('LEFT'), ActionManager.GetActionValue('DOWN') - ActionManager.GetActionValue('UP')));
        return value.Length() > 1 ? value.Normalize() : value;
    }
    Update() {
        const screen = this.level.screen; this.stick.origin.Set(76, screen.Height - 80); this.stick.Update(); this.bar.Layout();
        if (ActionManager.IsActionDown('SECONDARY')) this.level.dashQueued = true;
        if (ActionManager.IsActionDown('RESET')) this.level.Reset();
        if (ActionManager.IsActionDown('HELP')) this.help.Toggle();
        this.help.layout = {...this.help.layout, x: 12, width: Math.min(560, screen.Width - 24), lineHeight: 24};
    }
    Draw() {
        const level = this.level, width = level.screen.Width, frame = this.frame;
        frame.Text('EMBER WARDEN', 18, 30, {size: 22, weight: 700});
        frame.Meter(level.boss.health.hp / level.boss.health.maxHp, {x: 18, y: 40, width: width - 36, height: 12}, '#e6ab70');
        frame.Text(`HP ${level.player.health.hp}/${level.player.health.maxHp} · PHASE ${level.brain.phase + 1} · ${level.brain.state}`, 18, 75, {size: 14});
        frame.Text(level.message, 18, 96, {size: 13, color: '#e6c998', maxWidth: width - 36});
        frame.Meter(1 - level.player.motion.cooldown / level.rules.player.dashCooldown,
            {x: 22, y: level.screen.Height - 145, width: 100, height: 7}, '#85ddc5');
        this.stick.Draw(level.screen.Context); this.bar.Draw(); this.help.OnDrawn();
        if (level.result) {
            const y = level.screen.Height / 2 - 50; frame.Panel({x: 14, y, width: width - 28, height: 100});
            frame.Text(level.result, width / 2, y + 43, {size: 30, weight: 700, align: 'center'});
            frame.Text('RETRY / R / Select to play again', width / 2, y + 75, {size: 14, align: 'center'});
        }
    }
    Dispose() { this.bar.Dispose(); this.stick.Cancel(); }
}
