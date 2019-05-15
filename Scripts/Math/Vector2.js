class Vector2 {
    constructor() {
        this.x = 0;
        this.y = 0;
    }
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get Value() {
        return this.x && this.y;
    }
    set Value(x, y) {
        this.x = x;
        this.y = y;
    }
}