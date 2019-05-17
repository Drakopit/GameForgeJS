import { Base } from "../Base.js";

export class Rectangle extends Base {
    constructor(rect) {
        this.rect = rect;

        const TYPES = Object.freeze({
            FILLED,
            OUTLINED,
            STROKED
        });
    }

    SetScreen(screen) {
        let id = screen.ScreenId;
        let width = screen.Width;
        let height = screen.height;

        this.screen = new Screen(id, width, height);
    }

    set Color(color) {
        this.color = color || 'white';
    }

    set Style(style) {
        this.style = style;
    }

    OnGUI() {
        this.screen.Context.fillStyle = this.color;
        switch (style) {
            case TYPES.FILLED:
                context.fillRect(this.rect.Coordinates.x, this.rect.Coordinates.y, this.rect.Size.width, this.rect.Size.height);
            break;

            case TYPES.OUTLINED:
                context.rect(this.rect.Coordinates.x, this.rect.Coordinates.y, this.rect.Size.width, this.rect.Size.height);
            break;

            case TYPES.STROKED:
                context.strokeRect(this.rect.Coordinates.x, this.rect.Coordinates.y, this.rect.Size.width, this.rect.Size.height);
            break;
        
            default:
                context.fillRect(this.rect.Coordinates.x, this.rect.Coordinates.y, this.rect.Size.width, this.rect.Size.height);
            break;
        }
        super.OnGUI();
    }
}