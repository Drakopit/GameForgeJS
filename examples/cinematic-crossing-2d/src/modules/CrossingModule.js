import { CourierSteps } from '../components/CourierSteps.js';
import { Module } from 'gameforgejs/core';
import { module2D } from 'gameforgejs/2d';
import { CourierControl } from '../components/CourierControl.js';
import { CourierVisual } from '../components/CourierVisual.js';
import { CrossingSequence } from '../components/CrossingSequence.js';
import { WaypointMotion } from '../components/WaypointMotion.js';
import { Courier } from '../entities/Courier.js';
import { CrossingLandscape } from '../entities/CrossingLandscape.js';
import { CrossingLevel } from '../levels/CrossingLevel.js';
import { CrossingHUD } from '../ui/CrossingHUD.js';

export class CrossingModule extends Module {
    constructor() {
        super('cinematic-crossing-2d', { imports: [module2D({ telemetry: true })],
            declarations: [CourierSteps, CourierControl, CourierVisual, CrossingSequence, WaypointMotion, Courier, CrossingLandscape, CrossingLevel, CrossingHUD], exports: [CrossingLevel] });
    }
}
