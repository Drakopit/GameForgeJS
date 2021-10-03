import { Base } from "../Root/Base";

export class Background extends Base {
    constructor(screen, background) {
        this.image = new Image();
        this.image.src = background;

        this.screen = screen;
    }

    Draw(rect) {
        this.screen.Context.drawImage(this.image, rect.x, rect.y, rect.width, rect.height);
    }
}