import { Engine, LevelHandler } from "./Root/Engine.js";
import { Input } from "./Input/Input.js";
import { AssetManager } from "./Root/AssetManager.js";
import { AdvancedDemoLevel } from "./DemoAdvanced/AdvancedDemoLevel.js";

try {
    new Input();
    // 1. Instancia o Preloader
    const assets = new AssetManager();

    // 2. Coloca os recursos na fila (usando caminhos fake, como você pediu)
    assets.QueueImage("heroi_run", "DemoAdvanced/Assets/Player/Run.png");
    assets.QueueImage("heroi_idle", "DemoAdvanced/Assets/Player/Idle.png");
    assets.QueueImage("heroi_attack_01", "DemoAdvanced/Assets/Player/Attack-01.png");
    // assets.QueueImage("heroi_jump", "DemoAdvanced/Assets/Player/Jump.png");

    // assets.QueueImage("hero", "DemoAdvanced/Assets/Hero.png");
    assets.QueueImage("tiro_laser", "DemoAdvanced/Assets/Laser.png");
    assets.QueueImage("background", "DemoAdvanced/Assets/background.jpg");

    // Window NineSlice
    assets.QueueImage("window_base", "DemoAdvanced/Assets/manaSoul.png");

    // Background Music (BGM)
    assets.QueueAudio("bgm_fase1", "DemoAdvanced/Assets/BGM/battle_sound.mpeg");

    // Sound Effects (SFX)
    assets.QueueAudio("sfx_jump", "DemoAdvanced/Assets/SFX/jump 1.wav");
    assets.QueueAudio("sfx_laser", "DemoAdvanced/Assets/SFX/Blow 1V2.wav");

    // 3. Aguarda o download de tudo ANTES de iniciar a Engine
    assets.LoadAll().then(() => {
        LevelHandler.addLevel(new AdvancedDemoLevel());
        Engine.OnStart();
        console.log("GameForgeJS: Todos os assets carregados e Engine iniciada!");
    }).catch(err => {
        console.error("Erro fatal ao carregar os assets:", err);
    });
} catch (exception) {
    console.error(`Exception: ${exception}`);
}