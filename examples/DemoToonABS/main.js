import { BootstrapGame } from 'gameforgejs/core';
import { module3D } from 'gameforgejs/3d';
import { module2D } from 'gameforgejs/2d';
import { ToonRoomLevel } from './src/levels/ToonRoomLevel.js';

BootstrapGame({
    configPath: new URL('./config/game.config.json', import.meta.url).href,
    manifestPath: new URL('./config/resources.json', import.meta.url).href,
    modules: [module2D(), module3D()],
    levels: [new ToonRoomLevel()],
});
