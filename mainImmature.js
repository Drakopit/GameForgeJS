import { Engine, LevelHandler } from "./Root/Engine.js";
import { Input } from "./Input/Input.js";
import { Config } from "./Root/Config.js";
import { TechDemoLevel } from "./Demo/TechDemoLevel.js";

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

        // 3. Adiciona o nível e inicia a Engine
        LevelHandler.addLevel(new TechDemoLevel());
        Engine.OnStart();

        let projName = config ? config.project.name : "GameForgeJS";
        let projVersion = config ? config.project.version : "1.0.0";
        console.log(`${projName} v${projVersion}: Engine iniciada!`);

    } catch (exception) {
        console.error(`Erro Crítico na Inicialização (Bootstrap): ${exception}`);
    }
}

Bootstrap();
