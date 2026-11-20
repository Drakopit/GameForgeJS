import { BootstrapGame } from 'gameforgejs/core';
import { ArenaModule } from './src/modules/ArenaModule.js';
import { ArenaLevel } from './src/levels/ArenaLevel.js';

BootstrapGame({ modules: [ArenaModule],
    configPath: new URL('./config/game.config.json', import.meta.url).href,
    manifestPath: new URL('./config/resources.json', import.meta.url).href,
    levels: [new ArenaLevel()],
});
