import { BootstrapGame } from "gameforgejs/core";
import { OnlineMMOLevel } from "./src/levels/OnlineMMOLevel.js";

BootstrapGame({
    configPath: new URL("./game.config.json", import.meta.url).href,
    levels: [
        new OnlineMMOLevel(),
    ],
});
