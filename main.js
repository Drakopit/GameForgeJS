import { Engine } from "./Scripts/Root/Engine.js";
/**
 * @author Patrick Faustino Camello
 * @description Initialize the Game.
 * @summary Everything is on Game Class.
 * And Game class initialize, entire game
 * with all assets
 */

try {
    console.log("Chamará!");
    Engine.OnStart();
    console.dir(Engine);
} catch(exception) {
    console.error(`Exception: ${exception}`);
}