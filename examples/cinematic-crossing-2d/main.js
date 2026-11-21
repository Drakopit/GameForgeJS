import { BootstrapGame } from 'gameforgejs/core';
import { CrossingModule } from './src/modules/CrossingModule.js';
import { CrossingLevel } from './src/levels/CrossingLevel.js';

BootstrapGame({ modules: [CrossingModule],
    configPath: new URL('./config/game.config.json', import.meta.url).href,
    manifestPath: new URL('./config/resources.json', import.meta.url).href,
    levels: [new CrossingLevel()],
});
