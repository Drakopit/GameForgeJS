/**
 * Small debug tile-map level helper rendered on a 2D screen.
 *
 * @param {Screen} screen - Destination canvas screen.
 */
export class DebugMap extends Base {
    constructor(screen: any);
    screen: any;
    draw: Draw;
    tileW: number;
    tileH: number;
    mapWidth: number;
    mapHeight: number;
    MapStructure: any[][];
    AddObjectToMap(item: any, x: any, y: any): void;
    SetTileSize(vector2D: any): void;
    SetMapSize(vector2D: any): void;
}
import { Base } from "../../core/Base.js";
import { Draw } from "../Graphics/Draw.js";
