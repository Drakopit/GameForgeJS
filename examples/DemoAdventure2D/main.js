import { BootstrapGame } from "gameforgejs/core";
import { AdventureDemoLevel } from "./src/levels/AdventureDemoLevel.js";

BootstrapGame({
    configPath: new URL("./game.config.json", import.meta.url).href,
    levels: [
        new AdventureDemoLevel(),
    ],
    beforeStart: () => {
        document.title = "GameForgeJS - Adventure Component Demo";
        document.body.style.backgroundColor = "#050806";
    },
});
