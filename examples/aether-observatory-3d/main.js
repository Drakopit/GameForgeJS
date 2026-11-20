import { BootstrapGame } from 'gameforgejs/core';
import { ObservatoryModule } from './src/modules/ObservatoryModule.js';
import { ObservatoryLevel } from './src/levels/ObservatoryLevel.js';

BootstrapGame({ modules: [ObservatoryModule],
    configPath: new URL('./config/game.config.json', import.meta.url).href,
    manifestPath: new URL('./config/resources.json', import.meta.url).href,
    levels: [new ObservatoryLevel()],
});
