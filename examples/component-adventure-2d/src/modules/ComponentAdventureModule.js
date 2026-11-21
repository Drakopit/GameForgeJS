import { Module } from 'gameforgejs/core';
import { module2D } from 'gameforgejs/2d';
import { AdventureDemoLevel } from '../levels/AdventureDemoLevel.js';

export class ComponentAdventureModule extends Module {
    constructor() {
        super('component-adventure-2d', {
            imports: [module2D({ telemetry: true })],
            declarations: [AdventureDemoLevel],
            exports: [AdventureDemoLevel],
        });
    }
}
