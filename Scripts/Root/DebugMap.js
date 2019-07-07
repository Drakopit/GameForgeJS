import { Draw } from "../Drawing/Draw.js";
import { Base } from "../Root/Base.js";

export var Screen;
export var DrawLib;
// Default
export const MapStructure = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

const GROUNDING = Object.freeze({
    NOTHING: 0,
    SAND: 1,
    MUD: 2,
    ROCK: 3
})

export class DebugMap extends Base {
    constructor(screen) {
        super();
        Screen = screen;
        DrawLib = new Draw(Screen);
    }

    AddObjectToMap(item, x, y) {
        MapStructure[x][y] = item;
    }

    SetTileSize(vector2D) {
        this.tileW = vector2D.GetValue().x;
        this.tileH = vector2D.GetValue().y;
    }

    SetMapSize(vector2D) {
        this.mapWidth = vector2D.GetValue().x;
        this.mapHeight = vector2D.GetValue().y;
    }

    DrawnSelf() {
        DrawLib.Font = 'Bold Arial';
        DrawLib.FontSize = '11px';
        for (let i = 0; i < this.mapWidth; i++) {
            for (let j = 0; j < this.mapHeight; j++) {
                switch (MapStructure[((j*this.mapWidth)+i)]) {
                    case GROUNDING.NOTHING:
                        DrawLib.Color = "#5AA457";
                        DrawLib.Style = 1;
                        DrawLib.DrawRect(i*this.tileW, j*this.tileH, this.tileW, this.tileH);
                        DrawLib.Style = 0;
                    break;

                    default:
                        DrawLib.Color = "#685b48";
                    break;
                }
                DrawLib.DrawRect(i*this.tileW, j*this.tileH, this.tileW, this.tileH);
            }
        }
        DrawLib.Color = "white";
    }
}
