import { Module } from 'gameforgejs/core';
import { module2D } from 'gameforgejs/2d';
import { AddonLevel } from '../levels/AddonLevel.js';

export class AddonsModule extends Module {
    constructor() {
        super('addons-2d', {
            imports: [module2D({ telemetry: true })],
            declarations: [AddonLevel],
            exports: [AddonLevel],
        });
    }
}
