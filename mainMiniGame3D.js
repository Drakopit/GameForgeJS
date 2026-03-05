import { Engine, LevelHandler } from "./Root/Engine.js";
import { Input } from "./Input/Input.js";
import { CubeGameLevel } from "./DemoMiniGame3D/CubeGameLevel.js";
import { AssetManager } from "./Root/AssetManager.js";

try {
    new Input(); // Inicia o teclado

    const assets = new AssetManager();
    assets.QueueImage("textura_chao", "DemoMiniGame3D/Assets/Textures/floor.jpg");
    assets.QueueImage("textura_player", "DemoMiniGame3D/Assets/Textures/player.jpg");
    assets.QueueImage("textura_coin", "DemoMiniGame3D/Assets/Textures/coin.jpg");

    assets.LoadAll().then(() => {
        LevelHandler.addLevel(new CubeGameLevel());
        Engine.OnStart();
        console.log("GameForgeJS: Todos os assets carregados e Engine iniciada!");
    }).catch(err => {
        console.error("Erro fatal ao carregar os assets:", err);
    });
} catch (exception) {
    console.error(`Exception: ${exception}`);
}