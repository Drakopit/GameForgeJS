import { TacticalRpgModule } from './src/modules/TacticalRpgModule.js';
import { BootstrapGame } from "gameforgejs/core";
import { BattleLevel } from "./src/levels/BattleLevel.js";
import { TacticalMapLevel } from "./src/levels/TacticalMapLevel.js";
import { TacticalModeMenuLevel } from "./src/screens/TacticalModeMenuLevel.js";

BootstrapGame({
    modules: [TacticalRpgModule],
    configPath: new URL("./config/game.config.json", import.meta.url).href,
    manifestPath: new URL("./config/resources.json", import.meta.url).href,
    levels: [
        new TacticalModeMenuLevel(),
        new TacticalMapLevel(),
        new BattleLevel(),
    ],
    beforeStart: () => {
        document.title = "Tactical RPG - GameForgeJS";
        document.body.style.backgroundColor = "#000000";
    },
});
