import { Engine, LevelHandler } from "./Root/Engine.js";
import { TechDemo3DLevel } from "./Demo3D/TechDemo3DLevel.js";

try {
    // Carrega a nossa fase 3D
    LevelHandler.addLevel(new TechDemo3DLevel());

    // A mágica acontece aqui: A Engine vai rodar o OnFixedUpdate chamando os métodos 3D!
    Engine.OnStart();
    console.log("GameForgeJS: Engine 3D Iniciada com sucesso!");

} catch(exception) {
    console.error(`Exception: ${exception}`);
}