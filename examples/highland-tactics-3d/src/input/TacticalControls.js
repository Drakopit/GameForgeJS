import { ActionManager, Input, Touch } from 'gameforgejs/core';
import { Facings } from '../data/BattleRules.js';
/** Shared command routing for keyboard, gamepad, native buttons and touch tile picks. */
export class TacticalControls {
    constructor(level) { this.level = level; this.repeat = 0; this.previous = ''; }
    Update(dt) {
        const l = this.level, t = l.turn;
        if (ActionManager.IsActionDown('HELP'))
            l.hud.help.Toggle();
        if (ActionManager.IsActionDown('RESET'))
            l.ResetBattle();
        if (ActionManager.IsActionDown('ORBIT_LEFT'))
            l.cameraStep--;
        if (ActionManager.IsActionDown('ORBIT_RIGHT'))
            l.cameraStep++;
        if (ActionManager.IsActionDown('WEATHER'))
            l.environment.ToggleRain();
        if (l.hud.help.visible || t.result)
            return;
        const direction = ['UP', 'RIGHT', 'DOWN', 'LEFT'].find(action => ActionManager.IsActionDown(action) || ActionManager.IsAction(action));
        this.repeat -= dt;
        if (direction && (ActionManager.IsActionDown(direction) || direction !== this.previous || this.repeat <= 0)) {
            this.repeat = direction === this.previous ? 0.17 : 0.3;
            const index = ['UP', 'RIGHT', 'DOWN', 'LEFT'].indexOf(direction);
            if (t.phase === 'command')
                t.command = (t.command + (index === 0 || index === 3 ? -1 : 1) + 4) % 4;
            else if (t.phase === 'face')
                t.active.stats.facing = index;
            else if (t.cursor) {
                const d = Facings[index], tile = l.grid.Get(t.cursor.col + d.col, t.cursor.row + d.row);
                if (tile)
                    t.cursor = { col: tile.col, row: tile.row };
            }
            l.sound.Play('select');
        }
        this.previous = direction ?? '';
        if (ActionManager.IsActionDown('CANCEL') && ['move', 'target', 'face'].includes(t.phase))
            t.phase = 'command';
        const points = Input.instance.touch.GetStartedTouches().map(c => c.startPosition);
        if (Input.instance.mouse.buttonsDown[0])
            points.push(Input.instance.mouse.position);
        for (const raw of points) {
            const point = Touch.ToScreen(raw, l.ui.Screen);
            if (point.y < 105 || point.y > l.ui.Screen.Height - l.hud.footerHeight)
                continue;
            const tile = l.terrain.Pick(point, l.camera, l.ui.Screen);
            if (tile) {
                t.cursor = { col: tile.col, row: tile.row };
                this.Confirm();
            }
        }
        if (ActionManager.IsActionDown('CONFIRM'))
            this.Confirm();
    }
    Confirm() {
        const t = this.level.turn;
        if (t.phase === 'command')
            t.Choose(t.command);
        else if (t.phase === 'move') {
            if (!t.Move(t.cursor))
                t.message = 'Choose a blue reachable tile';
        }
        else if (t.phase === 'target') {
            const target = t.Alive().find(p => p.stats.col === t.cursor.col && p.stats.row === t.cursor.row);
            if (!t.Attack(target))
                t.message = 'Choose a highlighted enemy in reach and line of sight';
        }
        else if (t.phase === 'face')
            t.EndTurn();
    }
}
