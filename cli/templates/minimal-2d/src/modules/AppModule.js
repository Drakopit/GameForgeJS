import { Module } from 'gameforgejs/core';
import { createModules } from '../modules.js';
import { FirstLevel } from '../levels/FirstLevel.js';
import { Player } from '../entities/Player.js';

export class AppModule extends Module {
    constructor() {
        super('app', {
            imports: createModules(),
            declarations: [FirstLevel, Player],
            exports: [FirstLevel],
        });
    }
}
