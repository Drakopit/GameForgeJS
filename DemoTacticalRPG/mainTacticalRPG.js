import { BootstrapGame } from "../Root/Bootstrap.js";
import { BattleLevel } from "./BattleLevel.js";
import { TacticalMapLevel } from "./TacticalMapLevel.js";

BootstrapGame({
    configPath: "gameforge.config.json",
    levels: [
        new TacticalMapLevel(),
        new BattleLevel(),
    ],
    beforeStart: () => {
        document.title = "FFT Demo - GameForgeJS";
        document.body.style.backgroundColor = "#000000";
    },
});
