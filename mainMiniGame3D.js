import { Engine, LevelHandler } from "./Root/Engine.js";
import { Input } from "./Input/Input.js";
import { Config } from "./Root/Config.js";
import { AssetManager } from "./Root/AssetManager.js";
import { ActionManager } from "./Input/ActionManager.js";
import { CubeGameLevel } from "./DemoMiniGame3D/CubeGameLevel.js";
import { MiniGame3DMenu } from "./DemoMiniGame3D/MiniGame3DMenu.js";
import { Logger } from "./Root/Logger.js";

async function Bootstrap() {
    try {
        // 1. Carrega as configurações globais (inclui FORWARD/BACK para o Player3D)
        const config = await Config.Load("gameforge.config.json");

        if (config && config.window) {
            document.title = config.window.title;
            document.body.style.backgroundColor = config.window.backgroundColor;
            document.body.style.cursor = config.window.cursor;
        }

        // 2. Inicializa input e mapeamento de ações
        new Input();
        ActionManager.LoadMappings(config ? config.input.actionMappings : null);

        // 3. Carrega os assets via AssetManager
        const assets = new AssetManager();
        assets.QueueImage("textura_chao",    "DemoMiniGame3D/Assets/Textures/floor.jpg");
        assets.QueueImage("textura_player",  "DemoMiniGame3D/Assets/Textures/player.jpg");
        assets.QueueImage("textura_coin",    "DemoMiniGame3D/Assets/Textures/coin.jpg");
        assets.QueueImage("sky_cross",       "DemoMiniGame3D/Assets/Textures/Daylight Box UV.png");

        assets.QueueShader("vertexShader",    "Shaders/VertexShader.glsl");
        assets.QueueShader("fragmentShader",  "Shaders/FragmentShader.glsl");
        assets.QueueShader("skyboxVertex",    "Shaders/SkyBoxVertexShader.glsl");
        assets.QueueShader("skyboxFragment",  "Shaders/SkyBoxFragmentShader.glsl");

        // 4. Aguarda o download de tudo
        await assets.LoadAll();

        // 5. Inicia a Engine
        LevelHandler.addLevel(new MiniGame3DMenu());
        LevelHandler.addLevel(new CubeGameLevel());
        Engine.OnStart();

        let projName = config ? config.project.name : "GameForgeJS";
        let projVersion = config ? config.project.version : "1.0.0";
        Logger.log("info", `${projName} v${projVersion}: Todos os assets carregados e Engine iniciada!`);

    } catch (exception) {
        console.error(`Erro Crítico na Inicialização (Bootstrap): ${exception}`);
    }
}

Bootstrap();
