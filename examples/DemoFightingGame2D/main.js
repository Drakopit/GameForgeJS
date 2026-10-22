import { BootstrapGame } from "gameforgejs/core";
import { FightingCharacterSelectLevel } from "./src/screens/FightingCharacterSelectLevel.js";
import { FightingGame2DLevel } from "./src/levels/FightingGame2DLevel.js";
import { FightingGameMenuLevel } from "./src/screens/FightingGameMenuLevel.js";

BootstrapGame({
    configPath: new URL("./game.config.json", import.meta.url).href,
    manifestPath: new URL("./resources.json", import.meta.url).href,
    levels: [
        new FightingGameMenuLevel(),
        new FightingCharacterSelectLevel(),
        new FightingGame2DLevel(),
    ],
});
