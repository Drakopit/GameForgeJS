import { module2D } from "gameforgejs/2d";
import { module3D } from "gameforgejs/3d";
import { BootstrapGame } from "gameforgejs/core";
import { TechDemo3DLevel } from "./src/levels/TechDemo3DLevel.js";

BootstrapGame({
    modules: [module2D(), module3D()],
    configPath: new URL("./game.config.json", import.meta.url).href,
    manifestPath: new URL("./resources.json", import.meta.url).href,
    levels: [
        new TechDemo3DLevel(),
    ],
});
