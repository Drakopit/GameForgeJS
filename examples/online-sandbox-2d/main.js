import { OnlineSandboxModule } from './src/modules/OnlineSandboxModule.js';
import { BootstrapGame } from "gameforgejs/core";
import { OnlineMMOLevel } from "./src/levels/OnlineMMOLevel.js";

BootstrapGame({
    modules: [OnlineSandboxModule],
    manifestPath: new URL("./config/resources.json", import.meta.url).href,
    configPath: new URL("./config/game.config.json", import.meta.url).href,
    levels: [
        new OnlineMMOLevel(),
    ],
});
