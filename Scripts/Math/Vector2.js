class Vector2 {
    constructor(x, y) {
        this.x = (x != undefined) ? x : 0;
        this.y = (y != undefined) ? y : 0;
    }

    get Value() {
        return this.x && this.y;
    }
    set Value(x, y) {
        this.x = x;
        this.y = y;
    }
}