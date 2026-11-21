import { Module } from 'gameforgejs/core';
import { module2D } from 'gameforgejs/2d';
import { TouchGardenLevel } from '../levels/TouchGardenLevel.js';
import { GardenPlayer } from '../entities/GardenPlayer.js';
import { GardenMotion } from '../components/GardenMotion.js';

export class TouchGardenModule extends Module {
    constructor() {
        super('touch-garden-2d', {
            imports: [module2D({ telemetry: true })],
            declarations: [TouchGardenLevel, GardenPlayer, GardenMotion],
            exports: [TouchGardenLevel],
        });
    }
}
