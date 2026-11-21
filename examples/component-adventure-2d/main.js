import { ComponentAdventureModule } from './src/modules/ComponentAdventureModule.js';
import { BootstrapGame } from "gameforgejs/core";
import { AdventureDemoLevel } from "./src/levels/AdventureDemoLevel.js";

BootstrapGame({
    modules: [ComponentAdventureModule],
    manifestPath: new URL("./config/resources.json", import.meta.url).href,
    configPath: new URL("./config/game.config.json", import.meta.url).href,
    levels: [
        new AdventureDemoLevel(),
    ],
    beforeStart: () => {
        document.title = "GameForgeJS - Component Adventure 2D";
        document.body.style.backgroundColor = "#050806";
    },
});
