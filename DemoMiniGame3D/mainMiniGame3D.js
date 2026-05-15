import { BootstrapGame } from "../Root/Bootstrap.js";
import { CubeGameLevel } from "./CubeGameLevel.js";
import { MiniGame3DMenu } from "./MiniGame3DMenu.js";

BootstrapGame({
    configPath: ["gameforge.config.json", "DemoMiniGame3D/mini3d.config.json"],
    manifestPath: "DemoMiniGame3D/resources.json",
    levels: [
        new MiniGame3DMenu(),
        new CubeGameLevel(),
    ],
});
