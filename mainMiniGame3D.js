import { Engine, LevelHandler } from "./Root/Engine.js";
import { Input } from "./Input/Input.js";
import { CubeGameLevel } from "./DemoMiniGame3D/CubeGameLevel.js";
import { AssetManager } from "./Root/AssetManager.js";
import { Logger } from "./Root/Logger.js";
import { MiniGame3DMenu } from "./DemoMiniGame3D/MiniGame3DMenu.js";

try {
    new Input(); // Inicia o teclado

    const assets = new AssetManager();
    assets.QueueImage("textura_chao", "DemoMiniGame3D/Assets/Textures/floor.jpg");
    assets.QueueImage("textura_player", "DemoMiniGame3D/Assets/Textures/player.jpg");
    assets.QueueImage("textura_coin", "DemoMiniGame3D/Assets/Textures/coin.jpg");

    // Carrega os shaders (caminhos fake, como você pediu)
    assets.QueueShader("vertexShader", "Shaders/VertexShader.glsl");
    assets.QueueShader("fragmentShader", "Shaders/FragmentShader.glsl");

    // Skybox - 6 imagens para as faces do cubo
    // assets.QueueImage("sky_right", "DemoMiniGame3D/Assets/Textures/sky_right.jpg");
    // assets.QueueImage("sky_left", "DemoMiniGame3D/Assets/Textures/sky_left.jpg");
    // assets.QueueImage("sky_top", "DemoMiniGame3D/Assets/Textures/sky_top.jpg");
    // assets.QueueImage("sky_bottom", "DemoMiniGame3D/Assets/Textures/sky_bottom.jpg");
    // assets.QueueImage("sky_front", "DemoMiniGame3D/Assets/Textures/sky_front.jpg");
    // assets.QueueImage("sky_back", "DemoMiniGame3D/Assets/Textures/sky_back.jpg");

    // Imagem em formato de cruz para skybox (6 faces em uma única imagem)
    assets.QueueImage("sky_cross", "DemoMiniGame3D/Assets/Textures/Daylight Box UV.png");

    // Shaders específicos para a Skybox
    assets.QueueShader("skyboxVertex", "Shaders/SkyBoxVertexShader.glsl");
    assets.QueueShader("skyboxFragment", "Shaders/SkyBoxFragmentShader.glsl");

    assets.LoadAll().then(() => {
        LevelHandler.addLevel(new MiniGame3DMenu());
        LevelHandler.addLevel(new CubeGameLevel());
        Engine.OnStart();
        Logger.log("info", "GameForgeJS: Todos os assets carregados e Engine iniciada!");
    }).catch(err => {
        Logger.log("error", "Erro fatal ao carregar os assets:", { error: err });
    });
} catch (exception) {
    console.error(`Exception: ${exception}`);
}