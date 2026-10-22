import { BootstrapGame } from "gameforgejs/core";
import { AdvancedDemoBossLevel } from "./src/levels/AdvancedDemoBossLevel.js";
import { AdvancedDemoCongratulations } from "./src/screens/AdvancedDemoCongratulations.js";
import { AdvancedDemoFirstLevel } from "./src/levels/AdvancedDemoFirstLevel.js";
import { AdvancedDemoGameOver } from "./src/screens/AdvancedDemoGameOver.js";
import { AdvancedDemoMenu } from "./src/screens/AdvancedDemoMenu.js";
import { AdvancedDemoPhaseSelector } from "./src/screens/AdvancedDemoPhaseSelector.js";
import { AdvancedDemoSecondLevel } from "./src/levels/AdvancedDemoSecondLevel.js";

BootstrapGame({
    configPath: new URL("./config/game.config.json", import.meta.url).href,
    manifestPath: new URL("./config/resources.json", import.meta.url).href,
    levels: [
        new AdvancedDemoMenu(),
        new AdvancedDemoPhaseSelector(),
        new AdvancedDemoFirstLevel(),
        new AdvancedDemoSecondLevel(),
        new AdvancedDemoBossLevel(),
        new AdvancedDemoGameOver(),
        new AdvancedDemoCongratulations(),
    ],
});
