import { Engine } from "./Scripts/Root/Engine.js";

/**
 * @author Patrick Faustino Camello
 * @description Initialize the Game.
 * @summary Everything is on Game Class.
 * And Game class initialize, entire game
 * with all assets
 */
window.onload = function() {
    Engine.Start();
    Engine.Update();
    console.dir(Engine);
}