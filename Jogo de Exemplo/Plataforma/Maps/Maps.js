import { GenericMap } from "./GenericMap";
import { Collisor } from "../Objects/Collisor.js";
import { Vector2D } from "../../../Scripts/Math/Vector2D";

export class Maps {
    constructor() {
        this.maps = new Array();
    }

    LoadMaps() {
         this.map00 = new GenericMap();
        let Map00Structure = [
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        ]    
        this.map00.SetMap(Map00Structure);
        this.map00.SetTileSize(64,64);
        for (let i = 0; i < this.map00.mapWidth; i++) {
            for (let j = 0; j < this.map00.mapHeight; j++) {
                if (this.map00.map[((j*this.map00.mapWidth)+i)] === 0) {
                    this.map00.AddObjectToMap(new Collisor(
                        new Vector2D(i*this.map00.tileW, j*this.map00.tileH),
                        new Vector2D(this.map00.tileW, this.map00.tileH)),
                        i*this.map00.tileW, j*this.map00.tileH);
                }
            }
        }
        this.maps.push(this.map00);
    }
}