import { InputHelpPanel, Draw as ControlGuideDraw } from 'gameforgejs/2d';
import { ActionManager as ControlGuideActions } from 'gameforgejs/core';
import { Level, SceneDocument } from "gameforgejs/core";
import { Screen, ActionBar, GameObject } from "gameforgejs/2d";
import { SoundEffects } from 'gameforgejs/core';
import { GameViewport,Input } from 'gameforgejs/core';
import { PuzzleLayout } from '../ui/PuzzleLayout.js';
import { Draw } from "gameforgejs/2d";
import { ActionManager } from "gameforgejs/core";

import { PuzzleConfig } from "../data/puzzleConfig.js";
import { Characters } from "../data/characters.js";
import { PuzzleGem, GemType } from "../entities/PuzzleGem.js";
import { PuzzleBoard } from "../entities/PuzzleBoard.js";
import { FallingPiece } from "../entities/FallingPiece.js";
import { PuzzleFighter, FighterState } from "../entities/PuzzleFighter.js";
import { CpuPuzzleController } from "../entities/CpuPuzzleController.js";
import { PuzzleHUD } from "../ui/PuzzleHUD.js";

export class StreetFightPuzzleScene extends Level {
    constructor() {
        super();
        this.caption = "GameForgeJS — Puzzle Battle 2D";
        this.TelaId = "StreetFightPuzzle";
    }

    OnStart() {
        this.screen = new Screen(this.TelaId, 800, 600, { config: this.context?.config });
        this.controlsHelp=new InputHelpPanel(new ControlGuideDraw(this.screen),{title:'Controls'});
        this.draw = new Draw(this.screen);
        this.sound = new SoundEffects(this.context.services.get('audio'));
        // Board positions come from scenes/arena.gfscene.json.
        const arena = new SceneDocument(this.context.assets.jsons.arena_scene);
        this.boardPositions = [arena.Rect(arena.Node('board_1')), arena.Rect(arena.Node('board_2'))];
        const director = new GameObject(); director.AddComponent(this.sound); this.AddEntity(director);
        this.bar = new ActionBar(this.screen,this.draw,[
            {label:'LEFT',touchOnly:true,run:()=>this.PlayInput('aiMoveLeft')},
            {label:'RIGHT',touchOnly:true,run:()=>this.PlayInput('aiMoveRight')},
            {label:'ROTATE',touchOnly:true,run:()=>this.PlayInput('aiRotate')},
            {label:'DROP',touchOnly:true,run:()=>this.PlayInput('aiDrop')},
            {label:()=>this.paused?'RESUME':'PAUSE',run:()=>this.paused=!this.paused},
            {label:'RETRY',run:()=>this.ResetMatch()},
            {label:'HELP',run:()=>this.controlsHelp.Toggle()},
        ]);

        if (this.screen.Canvas) {
            this.screen.Canvas.tabIndex = 0;
            this.screen.Canvas.focus();
        }

        this.ResetMatch();
        this.releaseViewport=GameViewport.Bind(this.screen,{maxWidth:1200,onResize:()=>this.Layout()});
        super.OnStart();
    }

    ResetMatch() {
        for (const actor of this.fighterActors ?? []) this.RemoveEntity(actor);
        this.fighterActors = [this.AddEntity(new GameObject()), this.AddEntity(new GameObject())];
        // P1 Setup
        this.board1 = new PuzzleBoard(this.boardPositions[0].x, this.boardPositions[0].y, true);
        this.piece1 = new FallingPiece(this.board1, { left: 'PUZZLE_LEFT', right: 'PUZZLE_RIGHT', rotate: 'PUZZLE_ROTATE', drop: 'PUZZLE_DROP' }, false);
        this.fighter1 = this.fighterActors[0].AddComponent(new PuzzleFighter(0, 0, Characters.BLAZE));

        // P2 Setup (CPU)
        this.board2 = new PuzzleBoard(this.boardPositions[1].x, this.boardPositions[1].y, false);
        this.piece2 = new FallingPiece(this.board2, null, true);
        this.fighter2 = this.fighterActors[1].AddComponent(new PuzzleFighter(0, 0, Characters.KIRA));
        this.cpuController = new CpuPuzzleController(this.board2, this.piece2);
        for(const board of [this.board1,this.board2]){
            ['red','red','blue','blue','green','green'].forEach((color,col)=>board.grid[PuzzleConfig.ROWS-1][col]=new PuzzleGem(GemType.NORMAL,color));
            for (const col of [2, 3]) board.grid[PuzzleConfig.ROWS - 2][col] = new PuzzleGem(GemType.NORMAL, "blue");
        }

        this.hud = new PuzzleHUD(this.draw);
        this.paused = false;

        this.p1NextGems = [];
        this.p2NextGems = [];

        this.gameEnded = false;

        this.bindEvents();

        // Generate initial next pieces
        this.p1NextGems = [new PuzzleGem(GemType.CRASH,'red'),new PuzzleGem(GemType.NORMAL,'red')];
        this.p2NextGems = [this.generateRandomGem(), this.generateRandomGem()];

        this.spawnPiece(1);
        this.spawnPiece(2);
        this.Layout();

    }

    Layout() {PuzzleLayout.Apply(this.screen,[this.board1,this.board2],Input.instance.presentation.TouchVisible);}
    PlayInput(action) {if(!this.paused&&!this.gameEnded&&!this.controlsHelp.visible)this.piece1[action]();}

    bindEvents() {
        this.board1.onSendGarbage = (amount) => {
            this.board2.receiveGarbage(amount);
        };
        this.board1.onCombo = (combo, amt) => {
            this.sound.Play('collect');
            this.fighter1.setState(FighterState.ATTACK, 0.5);
            this.fighter2.setState(FighterState.HIT, 0.5);
            this.hud.addFloatingText(this.board1.x+this.board1.cellSize*3,this.board1.y+80,`CHAIN ×${combo}`,'#ffd68a');
        };

        this.board2.onSendGarbage = (amount) => {
            this.board1.receiveGarbage(amount);
        };
        this.board2.onCombo = (combo, amt) => {
            this.fighter2.setState(FighterState.ATTACK, 0.5);
            this.fighter1.setState(FighterState.HIT, 0.5);
            this.sound.Play('warning');
            this.hud.addFloatingText(this.board2.x+this.board2.cellSize*3,this.board2.y+80,`CHAIN ×${combo}`,'#c2b7ff');
        };
    }

    generateRandomGem() {
        const isCrash = Math.random() < 0.15; // 15% chance of crash gem
        const type = isCrash ? GemType.CRASH : GemType.NORMAL;
        const color = PuzzleConfig.COLORS[Math.floor(Math.random() * PuzzleConfig.COLORS.length)];
        return new PuzzleGem(type, color);
    }

    spawnPiece(playerNum) {
        if (playerNum === 1) {
            this.piece1.setGems(this.p1NextGems[0], this.p1NextGems[1]);
            this.p1NextGems = [this.generateRandomGem(), this.generateRandomGem()];
        } else {
            this.piece2.setGems(this.p2NextGems[0], this.p2NextGems[1]);
            this.p2NextGems = [this.generateRandomGem(), this.generateRandomGem()];
            this.cpuController.reset();
        }
        this.hud.setNextPieces(this.p1NextGems, this.p2NextGems);
    }

    OnUpdate(dt) {
        if(ControlGuideActions.IsActionDown('HELP'))this.controlsHelp?.Toggle();

        this.bar.Layout();
        this.Layout();
        if (ActionManager.IsActionDown('PAUSE')) this.paused=!this.paused;
        if (ActionManager.IsActionDown('RESET')) this.ResetMatch();
        if (this.controlsHelp.visible || this.paused) return;
        super.OnUpdate(dt);
        // Fallback for dt if undefined
        const delta = Math.min(dt ?? 1/60,0.1);

        if (this.gameEnded) {
            return;
        }

        // Logic P1
        if (!this.piece1.locked && !this.board1.gameOver) {
            this.piece1.update(delta);
        } else if (this.piece1.locked && !this.board1.gameOver) {
            this.spawnPiece(1);
        }

        // Logic P2
        if (!this.piece2.locked && !this.board2.gameOver) {
            this.piece2.update(delta);
            this.cpuController.update(delta);
        } else if (this.piece2.locked && !this.board2.gameOver) {
            this.spawnPiece(2);
        }

        this.hud.update(delta);

        this.hud.p1Score = this.board1.score;
        this.hud.p2Score = this.board2.score;

        this.checkWinCondition();
    }

    checkWinCondition() {
        if (this.board1.gameOver && !this.gameEnded) {
            this.gameEnded = true;
            this.fighter1.setState(FighterState.LOSE);
            this.fighter2.setState(FighterState.WIN);
        } else if (this.board2.gameOver && !this.gameEnded) {
            this.gameEnded = true;
            this.fighter1.setState(FighterState.WIN);
            this.fighter2.setState(FighterState.LOSE);
        }
    }

    OnDrawn() {
        if (!this.screen) return;
        this.screen.Refresh();

        const ctx = this.screen.Context;

        this.board1.draw(ctx);
        this.piece1.draw(ctx);

        this.board2.draw(ctx);
        this.piece2.draw(ctx);

        this.hud.draw(ctx,this);
        this.bar.Draw();
    }

    OnExit() {this.releaseViewport?.();this.controlsHelp?.Dispose();this.bar?.Dispose();super.OnExit();}

    OnGUI() {super.OnGUI();
        this.controlsHelp?.OnDrawn();
}
}
