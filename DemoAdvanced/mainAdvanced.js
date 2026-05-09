import { BootstrapGame } from "../Root/Bootstrap.js";
import { AdvancedDemoLevel } from "./AdvancedDemoLevel.js";

BootstrapGame({
    configPath: "gameforge.config.json",
    manifestPath: "DemoAdvanced/resources.json",
    levels: [
        new AdvancedDemoLevel(),
    ],
});
