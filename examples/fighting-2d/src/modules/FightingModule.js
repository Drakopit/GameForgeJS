import { FightingPadSeats } from '../input/FightingPadSeats.js';
import { FightingAnimationLevel } from '../screens/FightingAnimationLevel.js';
import { FighterPosePreview } from '../presentation/FighterPosePreview.js';
import { FightingTouchControls } from '../input/FightingTouchControls.js';
import { FightingViewport } from '../presentation/FightingViewport.js';
import { Module } from 'gameforgejs/core';
import { module2D } from 'gameforgejs/2d';
import { FightingCharacterSelectLevel } from '../screens/FightingCharacterSelectLevel.js';
import { FightingGame2DLevel } from '../levels/FightingGame2DLevel.js';
import { FightingGameMenuLevel } from '../screens/FightingGameMenuLevel.js';

export class FightingModule extends Module {
    constructor() {
        super('fighting-2d', {
            imports: [module2D({ telemetry: true })],
            declarations: [FightingAnimationLevel,FighterPosePreview,FightingPadSeats, FightingTouchControls, FightingViewport, FightingCharacterSelectLevel, FightingGame2DLevel, FightingGameMenuLevel],
            exports: [FightingCharacterSelectLevel, FightingGame2DLevel, FightingGameMenuLevel],
        });
    }
}
