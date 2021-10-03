import { Base } from "../../../Scripts/Root/Base.js";
import { Vector2D } from "../../../Scripts/Math/Vector2D.js";
import { Sprite } from "../../../Scripts/Drawing/Sprite.js";
import { Draw } from "../../../Scripts/Drawing/Draw.js";
import { Util } from "../../../Scripts/Root/Utils.js";

export class Coin extends Base {
    constructor(screen) {
        super();
        //#region Configurações do Objeto 
        this.id = Util.NewUUIDv4();;
        this.value = Math.ceil(Math.random() * 100);
        this.position = new Vector2D(128, 160);
        this.size = new Vector2D(44, 40);
        this.solid = true;
        //#endregion

        this.draw = new Draw(screen);

        //#region Sprite
        this.spritefileName = "../../Assets/Sprites/Coin.png";
        this.sprite = new Sprite(screen, this.spritefileName);
        this.sprite.size = this.size;
        this.sprite.position = this.position;
        this.sprite.frameCount = 8;
        this.sprite.updatesPerFrame = 3;

        this.row = 0;
        //#endregion
    }

    get Value() {
        return this.value;
    }

    set Value(value) {
        this.value = value;
    }

    OnDrawn() {
        this.draw.Color = "red";
        this.draw.Style = 1;
        this.draw.DrawRect(this.position.GetValue().x, this.position.GetValue().y, this.size.GetValue().x, this.size.GetValue().y);
        this.draw.Style = 0;
        this.sprite.Animation(this.spritefileName, this.position, "horizontal", this.row);
    }
}