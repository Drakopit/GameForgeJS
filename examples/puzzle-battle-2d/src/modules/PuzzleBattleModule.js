import { Module } from 'gameforgejs/core';
import { module2D } from 'gameforgejs/2d';
import { StreetFightPuzzleScene } from '../levels/StreetFightPuzzleScene.js';

export class PuzzleBattleModule extends Module {
    constructor() {
        super('puzzle-battle-2d', {
            imports: [module2D({ telemetry: true })],
            declarations: [StreetFightPuzzleScene],
            exports: [StreetFightPuzzleScene],
        });
    }
}
