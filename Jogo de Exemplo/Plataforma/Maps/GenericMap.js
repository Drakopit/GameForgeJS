import { Base } from "../../../Scripts/Root/Base";

export class GenericMap extends Base {
    constructor() {
        super();
        this.screen = screen;
        this.draw = new Draw(this.screen);
        this.map = [];
        this.tileW;
        this.tileH;
        this.mapWidth;
        this.mapHeight;
    }

    SetMap(map) {
        this.map = map;
        this.mapWidth = this.map[0].length;
        this.mapHeight = this.map[1].length;
    }

    SetTileSize(w, h) {
        this.tileW = w;
        this.tileH = h;
    }

    AddObjectToMap(item, x, y) {
        this.map[x, y] = item;
    }

    DrawnSelf() {
        this.draw.Font = 'Bold Arial';
        this.draw.FontSize = '11px';
        for (let i = 0; i < this.mapWidth; i++) {
            for (let j = 0; j < this.mapHeight; j++) {
                if (this.MapStruct[((j*this.mapWidth)+i)] === 0) {
                    this.draw.Color = "#5AA457";
                    this.draw.Style = 1;
                    this.draw.DrawRect(i*this.tileW, j*this.tileH, this.tileW, this.tileH);
                    this.draw.Style = 0;
                } else {
                    this.draw.Color = "#lightred";
                }
                this.draw.DrawRect(i*this.tileW, j*this.tileH, this.tileW, this.tileH);
            }
        }
        this.draw.Color = "white";
    }
}