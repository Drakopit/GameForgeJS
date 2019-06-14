import { Base } from "../../Scripts/Root/Base";
import { Vector2D } from "../../Scripts/Math/Vector2D";
import { DebugMap } from "../../Scripts/Root/DebugMap";

export class TileMove extends Base {
    constructor(size) {
        this.tileFrom = new Vector2D(1,1);
        this.tileTo = new Vector2D(1,1);
        this.timeMoved = 0;
        this.size = size;
        this.delayMove = 700;

        this.debugMap = new DebugMap();
    }

    PlaceAt(vector2D) {
        this.tileFrom = vector2D;
        this.tileTo = vector2D;
        this.position = new Vector2D(((this.debugMap.tileW*vector2D.GetValue().x) + ((this.debugMap.tileW - this.size.GetValue().x)/2)),
                                    ((this.debugMap.tileH*vector2D.GetValue().y) + ((this.debugMap.tileH - this.size.GetValue().y)/2)));
    }

    ProcessMovement(deltaTime) {
        if (this.tileFrom.GetValue() == this.tileTo.GetValue()) return false;
        if ((deltaTime - this.timeMoved) >= this.delayMove) {
            this.PlaceAt(this.tileTo);
        } else {
            this.position.GetValue().x = (this.tileFrom.GetValue().x * this.debugMap.tileW) + ((this.debugMap.tileW - this.size.GetValue().x)/2);
            this.position.GetValue().y = (this.tileFrom.GetValue().y * this.debugMap.tileH) + ((this.debugMap.tileH - this.size.GetValue().y)/2);

            if (this.tileTo.GetValue().x != this.tileFrom.GetValue().x) {
                let diff = (this.debugMap.tileW / this.delayMove) + (deltaTime - this.timeMoved);
                this.position.GetValue().x += (this.tileTo.GetValue().x < this.tileFrom.GetValue().x ? 0 - diff : diff)
            }

            if (this.tileTo.GetValue().y != this.tileFrom.GetValue().y) {
                let diff = (this.debugMap.tileH / this.delayMove) * (deltaTime - this.timeMoved);
                this.position.GetValue().y += (this.tileTo.GetValue().y < this.tileFrom.GetValue().y ? 0 - diff : diff);
            }

            this.position.GetValue().x = Math.round(this.position.GetValue().x);
            this.position.GetValue().y = Math.round(this.position.GetValue().y);
        }
        return true;
    }

    ToIndex(vector2D) {
        return ((vector2D.GetValue().y * this.debugMap.mapWidth) + vector2D.GetValue().x);
    }


}