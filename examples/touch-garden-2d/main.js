import { BootstrapGame } from 'gameforgejs/core';
import { TouchGardenModule } from './src/modules/TouchGardenModule.js';
import { TouchGardenLevel } from './src/levels/TouchGardenLevel.js';

BootstrapGame({
    modules: [TouchGardenModule],
    configPath: new URL('./config/game.config.json', import.meta.url).href,
    manifestPath: new URL('./config/resources.json', import.meta.url).href,
    levels: [new TouchGardenLevel()],
});
