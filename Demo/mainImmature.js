import { BootstrapGame } from "../Root/Bootstrap.js";
import { TechDemoLevel } from "./TechDemoLevel.js";

BootstrapGame({
    configPath: ["gameforge.config.json", "Demo/immature.config.json"],
    levels: [
        new TechDemoLevel(),
    ],
});
