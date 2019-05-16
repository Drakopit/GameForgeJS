// window.onload = () => console.log("Engine Html5, para desenvolvimento de Jogos, em andamento...");
import { Input } from "./Scripts/Inputs/Input.js";

window.onload = function() {
    var input = new Input();
    const FPS = 1000/60;
    const FPSTest = 1000;

    setInterval(() => {
        console.clear();
        if (input.GetKeyDown(input.KeyCode["A"])) {
            console.log(`Tecla: ${input.KeyCode["A"]}`);
            console.log("Esquerda");
        } else if (input.GetKeyDown(input.KeyCode["D"])) {
            console.log(`Tecla: ${input.KeyCode["D"]}`);
            console.log("Direita");
        } else if (input.GetKeyDown(input.KeyCode["W"])) {
            console.log(`Tecla: ${input.KeyCode["W"]}`);
            console.log("Cima");
        } else if (input.GetKeyDown(input.KeyCode["S"])) {
            console.log(`Tecla: ${input.KeyCode["S"]}`);
            console.log("Baixo");
        }  
    }, FPS);

    
}
