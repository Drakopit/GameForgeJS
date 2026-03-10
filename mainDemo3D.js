import { Engine, LevelHandler } from "./Root/Engine.js";
import { Input } from "./Input/Input.js";
import { Config } from "./Root/Config.js";
import { AssetManager } from "./Root/AssetManager.js";
import { TechDemo3DLevel } from "./Demo3D/TechDemo3DLevel.js";
import { Logger } from "./Root/Logger.js";

async function Bootstrap() {
    try {
        // 1. Carrega as configurações globais
        const config = await Config.Load("gameforge.config.json");

        if (config && config.window) {
            document.title = config.window.title;
            document.body.style.backgroundColor = config.window.backgroundColor;
            document.body.style.cursor = config.window.cursor;
        }

        // 2. Inicializa o input
        new Input();

        // 3. Carrega os assets via AssetManager
        const assets = new AssetManager();
        assets.QueueShader("vertexShader",   "Shaders/VertexShader.glsl");
        assets.QueueShader("fragmentShader", "Shaders/FragmentShader.glsl");
        assets.QueueImage("textura_player",  "Demo3D/Asssets/TemplateGrid_albedo.png");

        // 4. Aguarda o download de tudo
        await assets.LoadAll();

        // 5. Inicia a Engine
        LevelHandler.addLevel(new TechDemo3DLevel());
        Engine.OnStart();

        let projName = config ? config.project.name : "GameForgeJS";
        let projVersion = config ? config.project.version : "1.0.0";
        Logger.log("info", `${projName} v${projVersion}: Todos os assets carregados e Engine iniciada!`);

    } catch (exception) {
        console.error(`Erro Crítico na Inicialização (Bootstrap): ${exception}`);
    }
}

Bootstrap();
