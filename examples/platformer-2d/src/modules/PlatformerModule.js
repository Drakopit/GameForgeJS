import { Module } from 'gameforgejs/core';
import { module2D } from 'gameforgejs/2d';
import { PlatformerLevel } from '../levels/PlatformerLevel.js';

export class PlatformerModule extends Module {
    constructor() {
        super('platformer-2d', {
            imports: [module2D({ telemetry: true })],
            declarations: [PlatformerLevel],
            exports: [PlatformerLevel],
        });
    }
}
