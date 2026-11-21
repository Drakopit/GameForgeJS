import { Level, GameViewport, AssetManager, Input } from 'gameforgejs/core';
import { Screen, Draw, HUDFrame, ActionBar } from 'gameforgejs/2d';
import { FighterAnimations, GetSheetAnimations } from '../data/FighterAnimations.js';
import { FIGHTING_GAME_CHARACTERS, FIGHTING_GAME_FLOW, GoToFightingLevel } from '../state/FightingGameState.js';
import { FighterPosePreview } from '../presentation/FighterPosePreview.js';
import { anyGamepadDirectionDown, anyGamepadButtonDown } from '../input/FightingInput.js';
/** Every authored sequence can be inspected on every supplied sheet using native UI. */
export class FightingAnimationLevel extends Level {
    OnStart(context = this.context) {
        this.screen = new Screen('fighter-animation-lab', 960, 640, { config: context.config });
        this.draw = new Draw(this.screen);
        this.frame = new HUDFrame(this.draw);
        this.releaseViewport = GameViewport.Bind(this.screen, { maxWidth: 1440 });
        this.names = Object.keys(FighterAnimations);
        this.clipIndex = 0;
        this.characterIndex = 0;
        this.age = 0;
        this.auto = true;
        this.preview = this.AddEntity(new FighterPosePreview(this.screen));
        this.Play();
        this.bar = new ActionBar(this.screen, this.draw, [
            { label: 'PREV CLIP', run: () => this.StepClip(-1) }, { label: 'NEXT CLIP', run: () => this.StepClip(1) },
            { label: 'PREV FIGHTER', run: () => this.StepCharacter(-1) }, { label: 'NEXT FIGHTER', run: () => this.StepCharacter(1) },
            { label: () => this.auto ? 'AUTO ON' : 'AUTO OFF', run: () => this.auto = !this.auto },
            { label: 'BACK', run: () => GoToFightingLevel(this, FIGHTING_GAME_FLOW.menuIndex) },
        ]);
        super.OnStart(context);
    }
    Play() {
        this.age = 0;
        const character = FIGHTING_GAME_CHARACTERS[this.characterIndex];
        this.names = Object.keys(GetSheetAnimations(character.asset));
        this.clipIndex %= this.names.length;
        this.preview.Play((this.context.assets ?? AssetManager.instance).GetImage(character.asset), this.names[this.clipIndex]);
    }
    StepClip(direction) { this.clipIndex = (this.clipIndex + direction + this.names.length) % this.names.length; this.Play(); }
    StepCharacter(direction) { this.characterIndex = (this.characterIndex + direction + FIGHTING_GAME_CHARACTERS.length) % FIGHTING_GAME_CHARACTERS.length; this.Play(); }
    OnUpdate(dt) {
        if (Input.GetKeyDown('Escape') || anyGamepadButtonDown(['button_1'])) {
            GoToFightingLevel(this, FIGHTING_GAME_FLOW.menuIndex);
            return;
        }
        if (Input.GetKeyDown('ArrowDown') || anyGamepadDirectionDown('down')) {
            this.auto = false;
            this.StepClip(1);
        }
        if (Input.GetKeyDown('ArrowUp') || anyGamepadDirectionDown('up')) {
            this.auto = false;
            this.StepClip(-1);
        }
        if (Input.GetKeyDown('ArrowRight') || anyGamepadDirectionDown('right'))
            this.StepCharacter(1);
        if (Input.GetKeyDown('ArrowLeft') || anyGamepadDirectionDown('left'))
            this.StepCharacter(-1);
        this.age += dt;
        if (this.auto && this.age > Math.max(1.1, this.preview.clip.count / this.preview.clip.fps + 0.5))
            this.StepClip(1);
        super.OnUpdate(dt);
    }
    OnDrawn() { super.OnDrawn(); }
    OnGUI() {
        const f = this.frame, w = this.screen.Width;
        f.Panel({ x: 12, y: 12, width: w - 24, height: 115 });
        f.Text('FIGHTER ANIMATION LAB', 26, 39, { size: 20, weight: 700, color: f.theme.gold, maxWidth: w - 52 });
        f.Text(`${FIGHTING_GAME_CHARACTERS[this.characterIndex].name} · ${this.names[this.clipIndex]} · ${this.clipIndex + 1}/${this.names.length}`, 26, 68, { size: 16, maxWidth: w - 52 });
        f.Text(`${this.preview.clip.count} frames · ${this.preview.clip.fps} FPS · ${this.characterIndex === 3 ? 73 : 79} occupied cells on this sheet`, 26, 95, { size: 11, maxWidth: w - 52 });
        f.Text('Arrows / D-pad: clips and fighter. Escape / B: back.', 26, 114, { size: 10, maxWidth: w - 52 });
        this.bar.Draw();
    }
    OnExit() { this.releaseViewport?.(); this.bar?.Dispose(); super.OnExit(); }
}
