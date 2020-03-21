import { Base } from "../Scripts/Root/Base.js";

export class Level extends Base {
    constructor() {
        super();
        this.caption = "";
        this.Next = false;
    }

    static FindObject(name) {
        if (this[name] !== undefined) {
            return this[name];
        }
    }
}