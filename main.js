import { Engine } from "./Root/Engine.js";
/**
 * @author Patrick Faustino Camello
 * @description Initialize the Game.
 * @summary Everything is on Game Class.
 * And Game class initialize, entire game
 * with all assets
 */

try {
    Engine.OnStart();
    console.dir(Engine);
} catch(exception) {
    console.error(`Exception: ${exception}`);
}