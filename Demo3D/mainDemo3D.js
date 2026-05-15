import { BootstrapGame } from "../Root/Bootstrap.js";
import { TechDemo3DLevel } from "./TechDemo3DLevel.js";

BootstrapGame({
    configPath: ["gameforge.config.json", "Demo3D/demo3d.config.json"],
    manifestPath: "Demo3D/resources.json",
    levels: [
        new TechDemo3DLevel(),
    ],
});
