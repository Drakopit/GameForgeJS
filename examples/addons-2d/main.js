import { AddonsModule } from './src/modules/AddonsModule.js';
import { BootstrapGame } from 'gameforgejs/core';
import { AddonLevel } from './src/levels/AddonLevel.js';

BootstrapGame({
    modules: [AddonsModule],
    configPath: new URL('./config/game.config.json', import.meta.url).href,
    manifestPath: new URL('./config/resources.json', import.meta.url).href,
    levels: [new AddonLevel()],
});
