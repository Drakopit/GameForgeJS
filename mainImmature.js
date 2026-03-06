import { Engine, LevelHandler } from "./Root/Engine.js";
import { Screen } from "./Window/Screen.js";
import { Input } from "./Input/Input.js";
import { TechDemoLevel } from "./Demo/TechDemoLevel.js";

try {
    // 1. Inicia o Singleton do Teclado
    new Input();

    // 2. Cria a Tela (Vai procurar uma <canvas id="gameCanvas"> no seu Main.html)
    // Se o seu Screen.js criar automaticamente caso não exista, melhor ainda!
    const screen = new Screen("gameCanvas", 800, 600);

    // 3. Adiciona nossa Tech Demo na lista de Fases e define como a Fase 0
    LevelHandler.addLevel(new TechDemoLevel(screen));

    // 4. Dá o Play na Engine!
    Engine.OnStart();
    console.log("GameForgeJS Iniciada com sucesso!");

} catch(exception) {
    console.error(`Exception: ${exception}`);
}