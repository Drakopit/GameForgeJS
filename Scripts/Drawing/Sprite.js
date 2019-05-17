import { Screen } from "../Window/Screen.js";
import { Base } from "../Base.js";

export class Sprite extends Base {
    constructor(sprite) {
        this.sprite = sprite;
    }

    SetScreen(screen) {
        let id = screen.ScreenId;
        let width = screen.Width;
        let height = screen.height;

        this.screen = new Screen(id, width, height);
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