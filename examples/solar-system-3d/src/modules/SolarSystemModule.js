import { Module } from 'gameforgejs/core';
import { module2D } from 'gameforgejs/2d';
import { module3D } from 'gameforgejs/3d';
import { SolarSystemLevel } from '../levels/SolarSystemLevel.js';

export class SolarSystemModule extends Module {
    constructor() {
        super('solar-system-3d', {
            imports: [module2D({ telemetry: true }), module3D()],
            declarations: [SolarSystemLevel],
            exports: [SolarSystemLevel],
        });
    }
}
