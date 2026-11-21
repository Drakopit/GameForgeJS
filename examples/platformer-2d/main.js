import { PlatformerModule } from './src/modules/PlatformerModule.js';
import { BootstrapGame } from 'gameforgejs/core';
import { PlatformerLevel } from './src/levels/PlatformerLevel.js';

BootstrapGame({
    modules: [PlatformerModule],
    configPath: new URL('./config/game.config.json', import.meta.url).href,
    manifestPath: new URL('./config/resources.json', import.meta.url).href,
    // Stage layouts are gameforgejs.scene documents listed in config/resources.json.
    levels: [new PlatformerLevel('stage_movement'), new PlatformerLevel('stage_collection')],
});
