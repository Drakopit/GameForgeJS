import { Module } from 'gameforgejs/core';
import { module2D } from 'gameforgejs/2d';
import { AdvancedDemoBossLevel } from '../levels/AdvancedDemoBossLevel.js';
import { AdvancedDemoCongratulations } from '../screens/AdvancedDemoCongratulations.js';
import { AdvancedDemoFirstLevel } from '../levels/AdvancedDemoFirstLevel.js';
import { AdvancedDemoGameOver } from '../screens/AdvancedDemoGameOver.js';
import { AdvancedDemoMenu } from '../screens/AdvancedDemoMenu.js';
import { AdvancedDemoPhaseSelector } from '../screens/AdvancedDemoPhaseSelector.js';
import { AdvancedDemoSecondLevel } from '../levels/AdvancedDemoSecondLevel.js';

export class PlatformAdventureModule extends Module {
    constructor() {
        super('platform-adventure-2d', {
            imports: [module2D({ telemetry: true })],
            declarations: [AdvancedDemoBossLevel, AdvancedDemoCongratulations, AdvancedDemoFirstLevel, AdvancedDemoGameOver, AdvancedDemoMenu, AdvancedDemoPhaseSelector, AdvancedDemoSecondLevel],
            exports: [AdvancedDemoBossLevel, AdvancedDemoCongratulations, AdvancedDemoFirstLevel, AdvancedDemoGameOver, AdvancedDemoMenu, AdvancedDemoPhaseSelector, AdvancedDemoSecondLevel],
        });
    }
}
