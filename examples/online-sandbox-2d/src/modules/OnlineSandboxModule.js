import { Module } from 'gameforgejs/core';
import { module2D } from 'gameforgejs/2d';
import { OnlineMMOLevel } from '../levels/OnlineMMOLevel.js';

export class OnlineSandboxModule extends Module {
    constructor() {
        super('online-sandbox-2d', {
            imports: [module2D({ telemetry: true })],
            declarations: [OnlineMMOLevel],
            exports: [OnlineMMOLevel],
        });
    }
}
