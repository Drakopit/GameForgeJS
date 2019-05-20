// window.onload = () => console.log("Engine Html5, para desenvolvimento de Jogos, em andamento...");
import { Game } from "./Scripts/Root/Game.js";

/**
 * @author Patrick Faustino Camello
 * @description Initialize the Game.
 * @summary Everything is on Game Class.
 * And Game class initialize, entire game
 * with all assets
 */
// Inicializa o Jogo
Game.Awake();
window.requestAnimationFrame(Game.Loop);

/**
 * @author Patrick Faustino Camello
 * @description Initialize the Game.
 * @summary Everything is on Game Class.
 * And Game class initialize, entire game
 * with all assets. But, now with separated
 * functions.
 */
// Inicializa o Jogo
// window.onload = () => {
//     Game.Start();
//     Game.Update();
//     Game.FixedUpdate();
//     Game.DrawSelf();
//     Game.OnGUI();
// }

/**
 * @author Patrick Faustino Camello
 * @description Initialize the Game.
 * @summary Main class is created to
 * make a interface from Game class.
 * Main Game call and initialize every
 * Game resources. Each resource, must
 * put in methods.
 * @requires Game 
 */
// Inicializa o Jogo
// window.onload = () => {
//     class Main extends Game {
//         static Start() {
//             super.Start();
//         }

//         static Update() {
//             super.Update();
//         }

//         static FixedUpdate() {
//             super.FixedUpdate();
//         }

//         static DrawSelf() {
//             super.DrawSelf();
//         }

//         static OnGUI() {
//             super.OnGUI();
//         }
//     }

//     // Chamas os Métodos
//     Main.Start();
//     Main.Update();
//     Main.FixedUpdate();
//     Main.DrawSelf();
//     Main.OnGUI();
// }

/**
 * @author Patrick Faustino Camello
 * @description Initialize the Game.
 * @summary More primitive method for
 * initialize game.
 */
// Inicializa o Jogo
// window.onload = function() {
//     var input = new Input();
//     const FPS = 1000/60;
//     const FPSTest = 1000;
//
//     setInterval(() => {
//         console.clear();
//         /** **/if (input.GetKeyDown(input.KeyCode["A"])) {
//             console.log(`Tecla: ${input.KeyCode["A"]}`);
//             console.log("Esquerda");
//         } else if (input.GetKeyDown(input.KeyCode["D"])) {
//             console.log(`Tecla: ${input.KeyCode["D"]}`);
//             console.log("Direita");
//         } else if (input.GetKeyDown(input.KeyCode["W"])) {
//             console.log(`Tecla: ${input.KeyCode["W"]}`);
//             console.log("Cima");
//         } else if (input.GetKeyDown(input.KeyCode["S"])) {
//             console.log(`Tecla: ${input.KeyCode["S"]}`);
//             console.log("Baixo");
//         }  
//     }, FPS);
// }
