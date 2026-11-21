import { Module } from 'gameforgejs/core';
import { module2D } from 'gameforgejs/2d';
import { RouteNavigator } from '../components/RouteNavigator.js';
import { StageTrial } from '../components/StageTrial.js';
import { RouteProgress } from '../data/RouteProgress.js';
import { AtlasView } from '../entities/AtlasView.js';
import { AtlasLevel } from '../levels/AtlasLevel.js';
import { AtlasHUD } from '../ui/AtlasHUD.js';

export class AtlasModule extends Module {
    constructor() {
        super('route-atlas-2d', { imports: [module2D({ telemetry: true })],
            declarations: [RouteNavigator, StageTrial, RouteProgress, AtlasView, AtlasLevel, AtlasHUD], exports: [AtlasLevel] });
    }
}
