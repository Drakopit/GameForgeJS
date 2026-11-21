import { ToonAdventureModule } from './src/modules/ToonAdventureModule.js';
import { BootstrapGame } from 'gameforgejs/core';
import { ToonRoomLevel } from './src/levels/ToonRoomLevel.js';

BootstrapGame({
    configPath: new URL('./config/game.config.json', import.meta.url).href,
    manifestPath: new URL('./config/resources.json', import.meta.url).href,
    modules: [ToonAdventureModule],
    levels: [new ToonRoomLevel()],
});
