import { MovementCollisionModule } from './src/modules/MovementCollisionModule.js';
import { BootstrapGame } from "gameforgejs/core";
import { TechDemoLevel } from "./src/levels/TechDemoLevel.js";

BootstrapGame({
    modules: [MovementCollisionModule],
    manifestPath: new URL("./config/resources.json", import.meta.url).href,
    configPath: new URL("./config/game.config.json", import.meta.url).href,
    levels: [
        new TechDemoLevel(),
    ],
});
