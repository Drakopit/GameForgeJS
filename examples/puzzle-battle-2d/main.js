import { PuzzleBattleModule } from './src/modules/PuzzleBattleModule.js';
import { BootstrapGame } from "gameforgejs/core";
import { StreetFightPuzzleScene } from "./src/levels/StreetFightPuzzleScene.js";

BootstrapGame({
    modules: [PuzzleBattleModule],
    configPath: new URL("./config/game.config.json", import.meta.url).href,
    manifestPath: new URL("./config/resources.json", import.meta.url).href,
    levels: [
        new StreetFightPuzzleScene()
    ],
});
