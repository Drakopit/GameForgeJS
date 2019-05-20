import { Screen } from "../Window/Screen.js";

export class Sprite {
    constructor(sprite) {
        this.sprite = sprite;
    }

    SetScreen(screen) {
        this.screen = new Screen(screen.ScreenId, screen.Width, screen.Height);
    }

    DrawSprite(vector2D, sprite) {
        this.sprite = this.sprite || sprite;
        this.screen.Context.drawImage(sprite, vector2D.GetValue().x, vector2D.GetValue().y);
    }

    DrawSpriteExt(x, y, sprite) {
        this.sprite = this.sprite || sprite;
        this.screen.Context.drawImage(sprite, x, y);
    }
}