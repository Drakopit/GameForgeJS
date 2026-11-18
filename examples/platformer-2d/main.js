import { PlatformerModule } from './src/modules/PlatformerModule.js';
import { BootstrapGame } from 'gameforgejs/core';
import { PlatformerLevel } from './src/levels/PlatformerLevel.js';
import { MovementStage } from './src/data/MovementStage.js';
import { CollectionStage } from './src/data/CollectionStage.js';

BootstrapGame({
    modules: [PlatformerModule],
    configPath: new URL('./config/game.config.json', import.meta.url).href,
    manifestPath: new URL('./config/resources.json', import.meta.url).href,
    levels: [new PlatformerLevel(MovementStage), new PlatformerLevel(CollectionStage)],
});
