import { Module } from 'gameforgejs/core';
import { module2D } from 'gameforgejs/2d';
import { module3D } from 'gameforgejs/3d';
import { ToonRoomLevel } from '../levels/ToonRoomLevel.js';
import { Explorer } from '../entities/Explorer.js';
import { Sentry } from '../entities/Sentry.js';
import { ShallowWaterContact } from '../components/ShallowWaterContact.js';

export class ToonAdventureModule extends Module {
    constructor() {
        super('toon-adventure', {
            imports: [module2D({ telemetry: true }), module3D()],
            declarations: [ToonRoomLevel, Explorer, Sentry, ShallowWaterContact],
            exports: [ToonRoomLevel],
        });
    }
}
