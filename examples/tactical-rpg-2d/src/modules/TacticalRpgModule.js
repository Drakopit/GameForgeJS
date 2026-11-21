import { Module } from 'gameforgejs/core';
import { module2D } from 'gameforgejs/2d';
import { BattleLevel } from '../levels/BattleLevel.js';
import { TacticalMapLevel } from '../levels/TacticalMapLevel.js';
import { TacticalModeMenuLevel } from '../screens/TacticalModeMenuLevel.js';

export class TacticalRpgModule extends Module {
    constructor() {
        super('tactical-rpg-2d', {
            imports: [module2D({ telemetry: true })],
            declarations: [BattleLevel, TacticalMapLevel, TacticalModeMenuLevel],
            exports: [BattleLevel, TacticalMapLevel, TacticalModeMenuLevel],
        });
    }
}
