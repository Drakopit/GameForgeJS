import { BootstrapGame } from 'gameforgejs/core';
import { createModules } from './src/modules.js';
import { FirstLevel } from './src/levels/FirstLevel.js';

const status = document.querySelector('#status');

try {
    const game = await BootstrapGame({
        configPath: new URL('./config/game.config.json', import.meta.url).href,
        manifestPath: new URL('./config/resources.json', import.meta.url).href,
        modules: createModules(),
        levels: [new FirstLevel()],
    });
    status.textContent = 'Ready — a rotating cube is rendered with WebGL2.';
    window.addEventListener('pagehide', () => { void game.dispose(); }, { once: true });
} catch (error) {
    status.textContent = error.message;
    console.error(error);
}
