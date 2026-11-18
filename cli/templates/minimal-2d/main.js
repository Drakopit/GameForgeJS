import { BootstrapGame } from 'gameforgejs/core';
import { AppModule } from './src/modules/AppModule.js';
import { FirstLevel } from './src/levels/FirstLevel.js';

try {
    const game = await BootstrapGame({
        configPath: new URL('./config/game.config.json', import.meta.url).href,
        manifestPath: new URL('./config/resources.json', import.meta.url).href,
        modules: [AppModule],
        levels: [new FirstLevel()],
    });
    window.addEventListener('pagehide', () => { void game.dispose(); }, { once: true });
} catch (error) {
    console.error(error);
}
