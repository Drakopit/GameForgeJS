import { Engine, LevelHandler } from "./Root/Engine.js";
import { Input } from "./Input/Input.js";
import { CubeGameLevel } from "./DemoMiniGame3D/CubeGameLevel.js";
import { AssetManager } from "./Root/AssetManager.js";
import { Logger } from "./Root/Logger.js";

try {
    new Input(); // Inicia o teclado

    const assets = new AssetManager();
    assets.QueueImage("textura_chao", "DemoMiniGame3D/Assets/Textures/floor.jpg");
    assets.QueueImage("textura_player", "DemoMiniGame3D/Assets/Textures/player.jpg");
    assets.QueueImage("textura_coin", "DemoMiniGame3D/Assets/Textures/coin.jpg");

    // Carrega os shaders (caminhos fake, como você pediu)
    assets.QueueShader("vertexShader", "Shaders/VertexShader.vert");
    assets.QueueShader("fragmentShader", "Shaders/FragmentShader.frag");

    assets.LoadAll().then(() => {
        LevelHandler.addLevel(new CubeGameLevel());
        Engine.OnStart();
        Logger.log("info", "GameForgeJS: Todos os assets carregados e Engine iniciada!");
    }).catch(err => {
        Logger.log("error", "Erro fatal ao carregar os assets:", { error: err });
    });
} catch (exception) {
    console.error(`Exception: ${exception}`);
}