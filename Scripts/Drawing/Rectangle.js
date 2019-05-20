import { Screen } from "../Window/Screen.js"

export class Rectangle {
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
                this.screen.Context.fillRect(this.rect.Coordinates.x, this.rect.Coordinates.y, this.rect.Size.width, this.rect.Size.height);
            break;

            case TYPES.OUTLINED:
                this.screen.Context.rect(this.rect.Coordinates.x, this.rect.Coordinates.y, this.rect.Size.width, this.rect.Size.height);
            break;

            case TYPES.STROKED:
                this.screen.Context.strokeRect(this.rect.Coordinates.x, this.rect.Coordinates.y, this.rect.Size.width, this.rect.Size.height);
            break;
        
            default:
                this.screen.Context.fillRect(this.rect.Coordinates.x, this.rect.Coordinates.y, this.rect.Size.width, this.rect.Size.height);
            break;
        }
    }
}