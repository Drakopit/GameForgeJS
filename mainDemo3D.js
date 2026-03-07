import { Engine, LevelHandler } from "./Root/Engine.js";
import { TechDemo3DLevel } from "./Demo3D/TechDemo3DLevel.js";
import { AssetManager } from "./Root/AssetManager.js";
import { Logger } from "./Root/Logger.js";

try {
    const assets = new AssetManager();
    assets.QueueShader("vertexShader", "Shaders/VertexShader.glsl");
    assets.QueueShader("fragmentShader", "Shaders/FragmentShader.glsl");
    assets.QueueImage("textura_player", "/Demo3D/Asssets/TemplateGrid_albedo.png");

    assets.LoadAll().then(() => {
        LevelHandler.addLevel(new TechDemo3DLevel());
        Engine.OnStart();
        Logger.log("info", "GameForgeJS: Todos os assets carregados e Engine iniciada!");
    }).catch(err => {
        Logger.log("error", "Erro fatal ao carregar os assets:", { error: err });
    });
} catch (exception) {
    console.error(`Exception: ${exception}`);
}