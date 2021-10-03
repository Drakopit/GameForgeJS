import { Vector2D } from "../Math/Vector2D.js";
import { Base } from "./Base.js";
import { Draw } from "../Drawing/Draw.js";

export class Camera extends Base {
    constructor(position, size) {
        super();
        this.position = position;
        this.size = size;
        this.GameWorld;
        this.screen;
        this.draw;
        this.zoom = 1;
    }

    Init(screen, GameWorld) {
        this.GameWorld = GameWorld;
        this.screen = screen;
        this.draw = new Draw(this.screen);
    }

    LookAt(Obj) {
        this.position = Obj.position.SubtractValue(new Vector2D((this.size.GetValue().x * 0.50) * this.zoom, (this.size.GetValue().y * 0.50) * this.zoom));
    }

    ZoomIn(value) {
        this.zoom = value;
        this.size = new Vector2D(this.size.GetValue().x * this.zoom, this.size.GetValue().y * this.zoom);
    }

    ZoomOut(value) {
        this.zoom = value;
        this.size = new Vector2D(this.size.GetValue().x * -this.zoom, this.size.GetValue().y * -this.zoom);
    }

    StrictLimit() {
        if(this.position.GetValue().x < 0) {
			this.position.GetValue().x = 0;
		} else  if(this.position.GetValue().x + this.size.GetValue().x > this.GameWorld.width) {
			this.position.GetValue().x = this.GameWorld.width - this.size.GetValue().x;
		} else if(this.position.GetValue().y < 0) {
			this.position.GetValue().y = 0;
		} else if(this.position.GetValue().y + this.size.GetValue().y > this.GameWorld.height) {
			this.position.GetValue().y = this.GameWorld.height - this.size.GetValue().y;
        }       
    }

    Begin() {
        this.screen.Context.save();
        this.screen.Context.translate(-this.position.GetValue().x,-this.position.GetValue().y);
    }

    End() {
        this.screen.Context.restore();
    }

    Update(char) {
        this.LookAt(char);
        this.StrictLimit();
    }
}

Camera.prototype.LeftEdge = function() {
    return (this.size.GetValue().x * 0.25);
}

Camera.prototype.RightEdge = function() {
    return (this.size.GetValue().x * 0.75);
}

Camera.prototype.TopEdge = function() {
    return (this.size.GetValue().y * 0.25);
}

Camera.prototype.BottomEdge = function(){
    return (this.size.GetValue().y * 0.75);
}