import { BootstrapGame } from "gameforgejs/core";
import { StreetFightPuzzleScene } from "./src/levels/StreetFightPuzzleScene.js";

BootstrapGame({
    configPath: new URL("./game.config.json", import.meta.url).href,
    manifestPath: new URL("./resources.json", import.meta.url).href,
    levels: [
        new StreetFightPuzzleScene()
    ],
});
