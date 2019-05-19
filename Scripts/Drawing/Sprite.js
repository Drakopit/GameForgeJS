import { Screen } from "../Window/Screen.js";
import { Base } from "../Base.js";

export class Sprite extends Base {
    constructor(sprite) {
        super();
        this.sprite = sprite;
    }

    SetScreen(screen) {
        this.screen = new Screen(screen.ScreenId, screen.Width, screen.Height);
    }

    DrawSprite(vector2D, sprite) {
        this.sprite = this.sprite || sprite;
        this.screen.Context.drawImage(sprite, vector2D.GetValue().x, vector2D.GetValue().y);
        super.OnGUI();
    }

    DrawSpriteExt(x, y, sprite) {
        this.sprite = this.sprite || sprite;
        this.screen.Context.drawImage(sprite, x, y);
        super.OnGUI();
    }
}