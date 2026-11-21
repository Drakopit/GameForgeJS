import { Module } from 'gameforgejs/core';
import { module2D } from 'gameforgejs/2d';
import { TechDemoLevel } from '../levels/TechDemoLevel.js';

export class MovementCollisionModule extends Module {
    constructor() {
        super('movement-collision-2d', {
            imports: [module2D({ telemetry: true })],
            declarations: [TechDemoLevel],
            exports: [TechDemoLevel],
        });
    }
}
