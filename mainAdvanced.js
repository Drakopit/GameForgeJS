import { Engine, LevelHandler } from "./Root/Engine.js";
import { Input } from "./Input/Input.js";
import { AssetManager } from "./Root/AssetManager.js";
import { AdvancedDemoLevel } from "./DemoAdvanced/AdvancedDemoLevel.js";
import { Config } from "./Root/Config.js"; 
import { AudioManager } from "./Root/AudioManager.js"; 
import { ActionManager } from "./Input/ActionManager.js";
import { Logger } from "./Root/Logger.js";

async function Bootstrap() {
    try {
        // CARREGA O CONFIG (Resoluções, Controles, etc)
        const config = await Config.Load("../gameforge.config.json");

        if (config && config.window) {
            document.title = config.window.title;
            document.body.style.backgroundColor = config.window.backgroundColor;
            document.body.style.cursor = config.window.cursor;
        }

        // INICIALIZA SISTEMAS GLOBAIS
        new Input();
        ActionManager.LoadMappings(config ? config.input.actionMappings : null);
        AudioManager.instance.Initialize();
        
        if (config && config.audio) {
            AudioManager.instance.SetGlobalVolume(config.audio.masterVolume);
        }

        // INSTANCIA O PRELOADER
        const assets = new AssetManager();

        // ---------------------------------------------------------
        // MÁGICA DO MANIFESTO: Lendo o resources.json dinamicamente!
        // ---------------------------------------------------------
        const resourceResponse = await fetch("../DemoAdvanced/resources.json");
        if (!resourceResponse.ok) throw new Error("Não foi possível carregar resources.json");
        
        const manifest = await resourceResponse.json();

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
        // ---------------------------------------------------------

        // AGUARDA O DOWNLOAD DE TUDO
        await assets.LoadAll();

        // INICIA A ENGINE E O NÍVEL
        LevelHandler.addLevel(new AdvancedDemoLevel());
        Engine.OnStart();

        let projName = config ? config.project.name : "GameForgeJS";
        let projVersion = config ? config.project.version : "1.0.0";
        Logger.log("info", `${projName} v${projVersion}: Engine iniciada!`);
        Logger.log("info", `${projName} v${projVersion}: Todos os assets carregados e Engine iniciada!`);

    } catch (exception) {
        Logger.log("error", `Erro Crítico na Inicialização (Bootstrap): ${exception}`);
        console.error(`Erro Crítico na Inicialização (Bootstrap): ${exception}`);
    }
}

Bootstrap();