import { Engine, LevelHandler } from "./Root/Engine.js";
import { Screen } from "./Window/Screen.js";
import { Input } from "./Input/Input.js";
import { AssetManager } from "./Root/AssetManager.js";
import { AdvancedDemoLevel } from "./DemoAdvanced/AdvancedDemoLevel.js";

try {
    new Input();
    const screen = new Screen("gameCanvas", 800, 600);
    
    // 1. Instancia o Preloader
    const assets = new AssetManager();
    
    // 2. Coloca os recursos na fila (usando caminhos fake, como você pediu)
    // assets.QueueImage("heroi_run", "DemoAdvanced/Assets/Run.png");
    // assets.QueueImage("heroi_idle", "DemoAdvanced/Assets/Idle.png");
    assets.QueueImage("hero", "DemoAdvanced/Assets/Hero.png");
    assets.QueueImage("tiro_laser", "DemoAdvanced/Assets/Laser.png");
    assets.QueueImage("background", "DemoAdvanced/Assets/background.jpg");

    // 3. Aguarda o download de tudo ANTES de iniciar a Engine
    assets.LoadAll().then(() => {
        LevelHandler.addLevel(new AdvancedDemoLevel(screen));
        Engine.OnStart();
        console.log("GameForgeJS: Todos os assets carregados e Engine iniciada!");
    }).catch(err => {
        console.error("Erro fatal ao carregar os assets:", err);
    });
} catch(exception) {
    console.error(`Exception: ${exception}`);
}