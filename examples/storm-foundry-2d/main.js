// @ts-check
import { BootstrapGame } from 'gameforgejs/core';
import { FoundryModule } from './src/modules/FoundryModule.js';
import { FoundryLevel } from './src/levels/FoundryLevel.js';

BootstrapGame({
    modules: [FoundryModule],
    configPath: new URL('./config/game.config.json', import.meta.url).href,
    manifestPath: new URL('./config/resources.json', import.meta.url).href,
    levels: [new FoundryLevel()],
});
