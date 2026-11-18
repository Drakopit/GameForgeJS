import { SolarSystemModule } from './src/modules/SolarSystemModule.js';
import { BootstrapGame } from "gameforgejs/core";
import { SolarSystemLevel } from "./src/levels/SolarSystemLevel.js";

BootstrapGame({
    modules: [SolarSystemModule],
    configPath: new URL("./config/game.config.json", import.meta.url).href,
    manifestPath: new URL("./config/resources.json", import.meta.url).href,
    levels: [
        new SolarSystemLevel(),
    ],
});
