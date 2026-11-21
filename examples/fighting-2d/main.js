import { FightingModule } from './src/modules/FightingModule.js';
import { FightingAnimationLevel } from './src/screens/FightingAnimationLevel.js';
import { BootstrapGame } from "gameforgejs/core";
import { FightingCharacterSelectLevel } from "./src/screens/FightingCharacterSelectLevel.js";
import { FightingGame2DLevel } from "./src/levels/FightingGame2DLevel.js";
import { FightingGameMenuLevel } from "./src/screens/FightingGameMenuLevel.js";

BootstrapGame({
    modules: [FightingModule],
    configPath: new URL("./config/game.config.json", import.meta.url).href,
    manifestPath: new URL("./config/resources.json", import.meta.url).href,
    levels: [
        new FightingGameMenuLevel(),
        new FightingCharacterSelectLevel(),
        new FightingGame2DLevel(),
        new FightingAnimationLevel(),
    ],
});
