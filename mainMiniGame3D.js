import { Engine, LevelHandler } from "./Root/Engine.js";
import { Input } from "./Input/Input.js";
import { Config } from "./Root/Config.js";
import { AssetManager } from "./Root/AssetManager.js";
import { ActionManager } from "./Input/ActionManager.js";
import { CubeGameLevel } from "./DemoMiniGame3D/CubeGameLevel.js";
import { MiniGame3DMenu } from "./DemoMiniGame3D/MiniGame3DMenu.js";
import { Logger } from "./Root/Logger.js";
import { AudioManager } from "./Root/AudioManager.js";

async function Bootstrap() {
    try {
        // Carrega as configurações globais (inclui FORWARD/BACK para o Player3D)
        const config = await Config.Load("gameforge.config.json");

        if (config && config.window) {
            document.title = config.window.title;
            document.body.style.backgroundColor = config.window.backgroundColor;
            document.body.style.cursor = config.window.cursor;
        }

        // Inicializa input e mapeamento de ações
        new Input();
        ActionManager.LoadMappings(config ? config.input.actionMappings : null);

        AudioManager.instance.Initialize();

        if (config && config.audio) {
            AudioManager.instance.SetGlobalVolume(config.audio.masterVolume);
        }

        const assets = new AssetManager();

        // ---------------------------------------------------------
        // MÁGICA DO MANIFESTO: Lendo o resources.json dinamicamente!
        // ---------------------------------------------------------
        // const resourceResponse = await fetch("../DemoMiniGame3D/resources.json");
        // if (!resourceResponse.ok) throw new Error("Não foi possível carregar resources.json");

        // const manifest = await resourceResponse.json();

        const manifest = await Config.Load("../DemoMiniGame3D/resources.json");

        // Faz o loop automático para todas as imagens
        if (manifest.images) {
            manifest.images.forEach(img => {
                assets.QueueImage(img.name, img.path);
            });
        }

        // Faz o loop automático para todos os áudios
        if (manifest.audios) {
            manifest.audios.forEach(audio => {
                assets.QueueAudio(audio.name, audio.path);
            });
        }

        // Faz o loop automático para todos os shaders
        if (manifest.shaders) {
            manifest.shaders.forEach(shader => {
                assets.QueueShader(shader.name, shader.path);
            });
        }

        // Faz o loop automático para todos os modelos
        if (manifest.models) {
            manifest.models.forEach(model => {
                assets.QueueModel(model.name, model.path);
            });
        }

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
        Logger.log("error", `Erro Crítico na Inicialização (Bootstrap): ${exception}`);
        console.error(`Erro Crítico na Inicialização (Bootstrap): ${exception}`);
    }
}

Bootstrap();
