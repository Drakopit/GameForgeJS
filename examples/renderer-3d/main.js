import { RendererModule } from './src/modules/RendererModule.js';
import { BootstrapGame } from "gameforgejs/core";
import { TechDemo3DLevel } from "./src/levels/TechDemo3DLevel.js";

BootstrapGame({
    modules: [RendererModule],
    configPath: new URL("./config/game.config.json", import.meta.url).href,
    manifestPath: new URL("./config/resources.json", import.meta.url).href,
    levels: [
        new TechDemo3DLevel(),
    ],
});
