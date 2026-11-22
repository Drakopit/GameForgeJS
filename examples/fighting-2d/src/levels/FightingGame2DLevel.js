import { Level, AssetManager, SoundEffects } from 'gameforgejs/core';
import { GameObject, Screen } from 'gameforgejs/2d';
import { Fighter2D } from '../entities/Fighter2D.js';
import { FightingCPU } from '../ai/FightingCPU.js';
import { FightingInputReader } from '../input/FightingInputReader.js';
import { FightingCombat } from '../combat/FightingCombat.js';
import { FightingArena } from '../presentation/FightingArena.js';
import { FightingEffects } from '../presentation/FightingEffects.js';
import { FightingHUD } from '../ui/FightingHUD.js';
import { ScreenSettings, RoundSettings as Round, CombatSettings } from '../data/FightingSettings.js';
import { ArenaFromScene } from '../data/ArenaScene.js';
import { FIGHTING_GAME_FLOW, FightingGameSession, GoToFightingLevel } from '../state/FightingGameState.js';
import { FightingViewport } from '../presentation/FightingViewport.js';
import { FightingTouchControls } from '../input/FightingTouchControls.js';

export class FightingGame2DLevel extends Level {
    constructor() { super(); this.caption = 'GameForgeJS — Fighting Arena 2D'; this.TelaId = 'FightingGame2D'; }
    OnStart(context = this.context) {
        // Arena bounds, ground line and start marks come from scenes/arena.gfscene.json.
        this.layout = ArenaFromScene(context.assets.jsons.arena_scene);
        this.arena = this.layout.arena;
        this.screen = new Screen(this.TelaId, ScreenSettings.width, ScreenSettings.height, { config: context.config });
        this.screen.Canvas.focus();
        this.viewport = new FightingViewport(this.screen,{combat:true});
        this.touch = new FightingTouchControls(this.screen);
        this.input = new FightingInputReader(context,this.touch);
        this.background = new FightingArena(); this.effects = new FightingEffects(); this.hud = new FightingHUD(this.screen);
        const director = this.AddEntity(new GameObject());
        this.sound = director.AddComponent(new SoundEffects(this.context.services.get('audio')));
        this.combat = new FightingCombat(this);
        this.CreateFighters(); this.StartRound(true);
        super.OnStart(context);
    }
    CreateFighters() {
        for (const fighter of this.fighters ?? []) this.RemoveEntity(fighter);
        const create = (id, character, x, facingRight, input, controlledByPlayer) => this.AddEntity(new Fighter2D({
            id, name: character.name, image: AssetManager.instance.GetImage(character.asset), screen: this.screen,
            tint: character.tint, stats: character.stats, x, groundY: this.arena.groundY, facingRight, input, controlledByPlayer,
        }));
        this.playerOne = create('p1', FightingGameSession.GetP1(), this.layout.playerOneX, true, this.input.controls.playerOne, true);
        this.playerTwo = create('p2', FightingGameSession.GetP2(), this.layout.playerTwoX, false, this.input.controls.playerTwo, FightingGameSession.mode === 'versus');
        this.fighters = [this.playerOne, this.playerTwo];
        this.playerOne.opponent = this.playerTwo; this.playerTwo.opponent = this.playerOne;
        this.cpu = new FightingCPU();
    }
    StartRound(resetMatch = false) {
        this.hud.help.visible=false;
        if (resetMatch) {
            this.roundNumber = 1; this.matchWinner = null; this.advanceRequested = false;
            for (const fighter of this.fighters) fighter.roundWins = 0;
        }
        this.roundState = 'intro'; this.roundStateTimer = Round.startDelay; this.roundTimer = Round.maxTime;
        this.input.ClearQueued();
        this.arcadeComplete = false; this.combat.Clear(); this.effects.Reset(); this.cpu.Reset();
        this.playerOne.ResetRound(this.layout.playerOneX, this.arena.groundY, true);
        this.playerTwo.ResetRound(this.layout.playerTwoX, this.arena.groundY, false);
        this.playerOne.ChangeState('intro');this.playerTwo.ChangeState('intro');
    }
    OnUpdate(dt) {
        const delta = Math.min(dt ?? 1 / 60, CombatSettings.maxDelta);
        this.effects.OnUpdate(delta);
        const confirmPressed = this.input.ConfirmPressed();
        if (this.input.HelpPressed()) this.hud.help.Toggle();
        if (this.input.BackPressed()) {
            if (this.hud.help.visible) this.hud.help.Toggle();
            else GoToFightingLevel(this, FIGHTING_GAME_FLOW.menuIndex);
            return;
        }
        if(this.hud.help.visible){this.input.ClearQueued();return;}
        if (this.matchWinner) {
            this.advanceRequested ||= confirmPressed;
            this.UpdateMatchOver(delta);
            return;
        }
        if (this.roundState !== 'fight') {
            this.roundStateTimer -= delta;
            for (const fighter of this.fighters) fighter.UpdateAnimation(delta);
            if (this.roundStateTimer <= 0) {
                if (this.roundState === 'intro') this.roundState = 'fight';
                else { this.roundNumber++; this.StartRound(); }
            }
            return;
        }
        this.roundTimer = Math.max(0, this.roundTimer - delta);
        for (const fighter of this.fighters) {
            fighter.FaceOpponent();
            fighter.command = fighter.controlledByPlayer ? this.input.Player(fighter) : this.cpu.Read(fighter, delta, this.combat.projectiles.pool);
        }
        super.OnUpdate(delta);
        this.combat.ResolvePush(); this.combat.Resolve(); this.CheckRoundEnd();
    }
    UpdateMatchOver(dt) {
        this.roundStateTimer -= dt;
        for (const fighter of this.fighters) fighter.UpdateAnimation(dt);
        if (this.roundStateTimer > 0 || !this.advanceRequested) return;
        if (FightingGameSession.mode === 'arcade' && this.matchWinner === this.playerOne) {
            if (!FightingGameSession.HasNextArcadeOpponent()) { GoToFightingLevel(this, FIGHTING_GAME_FLOW.menuIndex); return; }
            FightingGameSession.AdvanceArcadeOpponent(); this.CreateFighters();
        }
        this.StartRound(true);
    }
    CheckRoundEnd() {
        if (this.fighters.every(fighter => fighter.hp > 0) && this.roundTimer > 0) return;
        const winner = this.playerOne.hp === this.playerTwo.hp ? null : this.playerOne.hp > this.playerTwo.hp ? this.playerOne : this.playerTwo;
        if (winner) { winner.roundWins++; winner.PlayVictory(); }
        for (const fighter of this.fighters) if (fighter !== winner) fighter.PlayDefeat();
        this.sound.Play('success');
        this.combat.Clear(); this.roundState = 'roundOver'; this.roundStateTimer = Round.endDelay;
        if (winner?.roundWins >= Round.winsToMatch) {
            this.matchWinner = winner;
            this.arcadeComplete = FightingGameSession.mode === 'arcade' && winner === this.playerOne && !FightingGameSession.HasNextArcadeOpponent();
            this.roundStateTimer += Round.continueDelay;
        }
    }
    OnDrawn() {
        this.screen.Refresh();
        this.viewport.Begin();
        const ctx = this.screen.Context; const shake = this.effects.Offset();
        ctx.save(); ctx.translate(shake.x, shake.y);
        this.background.DrawArena(ctx, this.arena);
        // The level owns its background pass; each registered entity owns its drawing.
        for (const entity of [...this.entities].sort((a, b) => a.position.y - b.position.y)) entity.OnDrawn();
        this.effects.Draw(ctx); ctx.restore();this.viewport.End();
    }
    OnGUI() {
        if(this.screen.Width>=600){this.viewport.Begin();this.hud.Draw(this);this.viewport.End();}
        else this.hud.DrawCompact(this);
        this.touch.Draw();this.hud.DrawUtility();this.hud.help.OnDrawn();
    }
    OnExit() {
        this.hud?.help?.Dispose();
        this.hud?.helpButton?.Dispose();this.touch?.Dispose();this.viewport?.Dispose();
        this.input?.Dispose();
        this.combat?.Clear();
        try { super.OnExit(); }
        finally {
            this.fighters = [];
            this.playerOne = this.playerTwo = this.matchWinner = null;
            this.combat = this.hud = this.background = this.effects = this.cpu = null;
            this.input = this.screen = null;
        }
    }
}
