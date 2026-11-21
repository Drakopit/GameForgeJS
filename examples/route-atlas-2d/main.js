import { BootstrapGame } from 'gameforgejs/core';
import { AtlasModule } from './src/modules/AtlasModule.js';
import { AtlasLevel } from './src/levels/AtlasLevel.js';

BootstrapGame({ modules: [AtlasModule],
    configPath: new URL('./config/game.config.json', import.meta.url).href,
    manifestPath: new URL('./config/resources.json', import.meta.url).href,
    levels: [new AtlasLevel()],
});
