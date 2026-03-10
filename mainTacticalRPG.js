import { Engine, LevelHandler } from "./Root/Engine.js";
import { Input }                from "./Input/Input.js";
import { Config }               from "./Root/Config.js";
import { Logger }               from "./Root/Logger.js";
import { TacticalMapLevel }     from "./DemoTacticalRPG/TacticalMapLevel.js";
import { BattleLevel }          from "./DemoTacticalRPG/BattleLevel.js";
import { ActionManager }        from "./Input/ActionManager.js";

async function Bootstrap() {
    try {
        const config = await Config.Load("gameforge.config.json");
        if (config?.window) {
            document.title = "FFT Demo - GameForgeJS";
            document.body.style.backgroundColor = "#000000";
        }

        new Input();
        // Lendo diretamente o actionMappings do seu JSON Data-Driven
        ActionManager.LoadMappings(config ? config.actionMappings : null); 

        LevelHandler.addLevel(new TacticalMapLevel());
        LevelHandler.addLevel(new BattleLevel());

        Engine.OnStart();
        Logger.log("info", "FFT Demo iniciado com sucesso!");

    } catch (e) {
        console.error("Erro crítico no Bootstrap:", e);
    }
}

Bootstrap();