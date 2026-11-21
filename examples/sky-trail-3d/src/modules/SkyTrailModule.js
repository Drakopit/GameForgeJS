import { Module } from 'gameforgejs/core';
import { module2D } from 'gameforgejs/2d';
import { module3D } from 'gameforgejs/3d';
import { CubeGameLevel } from '../levels/CubeGameLevel.js';
import { MiniGame3DMenu } from '../screens/MiniGame3DMenu.js';
import { TrailPlayer } from '../entities/TrailPlayer.js';
import { TrailPlatforms } from '../entities/TrailPlatforms.js';
import { TrailCoins } from '../entities/TrailCoins.js';

export class SkyTrailModule extends Module {
    constructor() {
        super('sky-trail', {
            imports: [module2D({ telemetry: true }), module3D()],
            declarations: [CubeGameLevel, MiniGame3DMenu, TrailPlayer, TrailPlatforms, TrailCoins],
            exports: [MiniGame3DMenu, CubeGameLevel],
        });
    }
}
