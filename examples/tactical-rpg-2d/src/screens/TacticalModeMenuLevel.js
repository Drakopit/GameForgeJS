import { Button, Draw, HUDFrame, InputHelpPanel, Screen } from 'gameforgejs/2d';
import { ActionManager, Level } from 'gameforgejs/core';
import { BattleState, BATTLE_MODES } from '../state/BattleState.js';
import { classes, expedition, stages } from '../state/Expedition.js';

const start = [
    { name: 'Solo campaign', detail: 'Command one hero in the classic duel format' },
    { name: 'Solo skirmish', detail: 'Command one hero in grid-based combat' },
    { name: 'Local co-op', detail: 'Two players alternate command of their own hero' },
];

export class TacticalModeMenuLevel extends Level {
    OnStart() {
        this.caption = "GameForgeJS - Tactical RPG";
        this.screen = new Screen('TacticalModeMenu', 640, 480, { config: this.context.config });
        const draw = new Draw(this.screen);
        this.frame = new HUDFrame(draw);
        this.controlsHelp = new InputHelpPanel(draw);
        this.step = this.selected = 0;
        this.buttons = start.map((_, i) => {
            const button = new Button(this.screen, { pointerInput: true });
            button.SetButton({ x: 64, y: 133 + i * 82, width: 512, height: 67 });
            button.OnClick(() => this.Confirm(i));
            return button;
        });
        super.OnStart();
    }

    get Options() { return this.step === 0 ? start : this.step > expedition.seats ? stages : classes; }

    Confirm(index) {
        if (this.step === 0) {
            expedition.seats = index === 2 ? 2 : 1;
            expedition.classes = [];
            BattleState.SetBattleMode(index === 0 ? BATTLE_MODES.FIRE_EMBLEM : BATTLE_MODES.FINAL_FANTASY_TACTICS);
        } else if (this.step <= expedition.seats) {
            expedition.classes[this.step - 1] = classes[index];
        } else {
            expedition.stage = stages[index];
            BattleState.initialized = false;
            this.Next = true;
            return;
        }
        this.step++;
        this.selected = 0;
    }

    OnUpdate(dt) {
        super.OnUpdate(dt);
        if (ActionManager.IsActionDown('HELP')) this.controlsHelp.Toggle();
        if (this.controlsHelp.visible) return;
        if (ActionManager.IsActionDown('UP')) this.selected = (this.selected + 2) % 3;
        if (ActionManager.IsActionDown('DOWN')) this.selected = (this.selected + 1) % 3;
        if (ActionManager.IsActionDown('CANCEL')) { this.step = Math.max(0, this.step - 1); this.selected = 0; }
        else if (ActionManager.IsActionDown('ATTACK')) this.Confirm(this.selected);
    }

    OnDrawn() {
        this.screen.Refresh();
        const ctx = this.screen.Context;
        const gradient = ctx.createLinearGradient(0, 0, 640, 480);
        gradient.addColorStop(0, '#1f3940');
        gradient.addColorStop(1, '#111725');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 640, 480);
        const f = this.frame;
        f.Text('TACTICAL RPG', 64, 67, { size: 34, weight: 700, color: f.theme.gold });
        const prompt = this.step === 0 ? 'Choose a battle format' : this.step <= expedition.seats
            ? 'Player ' + this.step + ' / Choose a class' : 'Choose a battlefield';
        f.Text(prompt, 64, 103, { size: 16, color: f.theme.muted });
        this.Options.forEach((option, i) => {
            const box = this.buttons[i].rect;
            f.Panel(box);
            const preview = option.asset && this.context.assets.GetImage(option.asset);
            if (preview?.naturalWidth) ctx.drawImage(preview, 0, 0, option.frame.width, option.frame.height,
                box.x + 6, box.y - 3, 72, 72);
            const textX = box.x + (preview ? 82 : 18);
            f.Text(option.name, textX, box.y + 28, { size: 19, weight: 700,
                color: i === this.selected ? f.theme.gold : f.theme.text });
            f.Text(option.detail, textX, box.y + 50, { size: 13 });
        });
        this.controlsHelp.DrawAction('ATTACK', 64, 404);
        this.controlsHelp.DrawAction('HELP', 228, 404);
        this.controlsHelp.DrawAction('CANCEL', 390, 404);
    }

    OnGUI() { this.controlsHelp.OnDrawn(); }
    OnExit() {
        for (const button of this.buttons) button.Dispose();
        this.controlsHelp.Dispose();
        super.OnExit();
    }
}
