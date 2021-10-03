import { Base } from "../../../Scripts/Root/Base";

export class Collisor extends Base {
    constructor(position, size) {
        this.solid = true;
        this.position = position;
        this.size = size;
    }
}