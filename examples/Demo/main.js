import { BootstrapGame } from "gameforgejs/core";
import { TechDemoLevel } from "./src/levels/TechDemoLevel.js";

BootstrapGame({
    configPath: new URL("./game.config.json", import.meta.url).href,
    levels: [
        new TechDemoLevel(),
    ],
});
