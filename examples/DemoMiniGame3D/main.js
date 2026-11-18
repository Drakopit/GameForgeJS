import { SkyTrailModule } from './src/modules/SkyTrailModule.js';
import { BootstrapGame } from "gameforgejs/core";
import { CubeGameLevel } from "./src/levels/CubeGameLevel.js";
import { MiniGame3DMenu } from "./src/screens/MiniGame3DMenu.js";

BootstrapGame({
    modules: [SkyTrailModule],
    configPath: new URL("./config/game.config.json", import.meta.url).href,
    manifestPath: new URL("./config/resources.json", import.meta.url).href,
    levels: [
        new MiniGame3DMenu(),
        new CubeGameLevel(),
    ],
});
