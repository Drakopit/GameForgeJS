import { Vector2 } from "Math/Vector2.js";

class Screen {
    constructor(id, width, height) {
        this.id = id;
        this.width = width;
        this.height = height;
        this.x = 0;
        this.y = 0;
    }

    get Canvas() { return this.canvas; }
    set Canvas(canvas) { this.canvas = canvas; }
    get Context() { return this.context }
    set Context(context) { this.context = context; }
    get ScreenId() { return this.id; }

    Init(canvas, context) {
        this.canvas = canvas;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = context;
    }

    Resize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    get Position() { return new Vector2(this.x, this.y)}

    Position(x, y) {
        this.x = x;
        this.y = y;
        this.canvas.style.position = "absolute";
        this.canvas.style.left = `${this.x}px`;
        this.canvas.style.top = `${this.y}px`;
    }
}
