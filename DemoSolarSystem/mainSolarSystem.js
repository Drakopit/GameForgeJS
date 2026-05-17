import { BootstrapGame } from "../Root/Bootstrap.js";
import { SolarSystemLevel } from "./SolarSystemLevel.js";

BootstrapGame({
    configPath: ["gameforge.config.json", "DemoSolarSystem/solar.config.json"],
    manifestPath: "DemoSolarSystem/resources.json",
    levels: [
        new SolarSystemLevel(),
    ],
});
