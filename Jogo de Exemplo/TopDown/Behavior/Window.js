import { Base } from "../../Scripts/Root/Base.js";
import { Draw } from "../../Scripts/Drawing/Draw.js";

export class Window extends Base {
    constructor(screen) {
        super();
        this.screen = screen;
        this.draw = new Draw(screen);
    }

    OnGUI() {
        this.ShowWindow()
    }

    ShowWindow(text, x, y, w, h) {
        this.draw.Style = 1;
        this.draw.Color = "white";
        this.draw.DrawRect(x, y, w, h);
        this.draw.Style = 0;
        this.draw.Color = "Black";
        this.draw.DrawRect(x+1, y+1, w-1, h-1);
        this.draw.SetTextAlign("start");
        this.draw.DrawText(text, x + 10, y + 10);
    }
}