import { Module } from 'gameforgejs/core';
import { module2D } from 'gameforgejs/2d';
import { module3D } from 'gameforgejs/3d';
import { ExplorerMotion } from '../components/ExplorerMotion.js';
import { MeshBinding } from '../components/MeshBinding.js';
import { ObservatoryCamera } from '../components/ObservatoryCamera.js';
import { ObservatoryTour } from '../components/ObservatoryTour.js';
import { OrbitMotion } from '../components/OrbitMotion.js';
import { MeshActor } from '../entities/MeshActor.js';
import { ObservatoryWorld } from '../entities/ObservatoryWorld.js';
import { ObservatoryLevel } from '../levels/ObservatoryLevel.js';
import { ObservatoryHUD } from '../ui/ObservatoryHUD.js';

export class ObservatoryModule extends Module {
    constructor() {
        super('aether-observatory-3d', { imports: [module2D({ telemetry: true }), module3D()],
            declarations: [ExplorerMotion, MeshBinding, ObservatoryCamera, ObservatoryTour, OrbitMotion, MeshActor, ObservatoryWorld, ObservatoryLevel, ObservatoryHUD], exports: [ObservatoryLevel] });
    }
}
