import { Vector2D } from "../Math/Vector2D.js";
import { Base } from "./Base.js";

export class Camera extends Base {
    constructor(position, size) {
        super();
        this.position = new Vector2D(position);
        this.size = new Vector2D(size);
        this.GameWorld;
        this.screen;
    }

    Init(screen, GameWorld) {
        this.GameWorld = GameWorld;
        this.screen = screen;
    }

    LeftEdge() {
        return this.position.AddValue(new Vector2D(this.size.GetValue().x * 0.25, 0))
        // return this.x + (this.width * 0.25);
    }

    RightEdge() {
        return this.position.AddValue(new Vector2D(this.size.GetValue().x * 0.75, 0));
        // return this.x + (this.width * 0.75);
    }
    
    TopEdge() {
        return this.position.AddValue(new Vector2D(0, this.size.GetValue().y * 0.25))
        // return this.y + (this.height * 0.25);
    }
    BottomEdge(){
        return this.position.AddValue(new Vector2D(0, this.size.GetValue().y * 0.75))
        // return this.y + (this.height * 0.75);
    }

    UpdatePosition(char) {
        console.log(char);
  		if(char.position.GetValue().x < this.LeftEdge()) {
			this.position.GetValue().x = char.position.GetValue().x - (this.size.GetValue().x * 0.25);
        }
        
		if(char.position.GetValue().x + char.size.GetValue().x > this.RightEdge()) {
			this.position.GetValue().x = char.position.GetValue().x + char.size.GetValue().x - (this.size.GetValue().x * 0.75);
        }
        
		if(char.position.GetValue().y < this.TopEdge()) {
			this.position.GetValue().y = char.position.GetValue().y - (this.size.GetValue().y * 0.25);
        }
        
		if(char.position.GetValue().y + char.size.GetValue().y > this.BottomEdge()) {
			this.position.GetValue().y = char.position.GetValue().y + char.size.GetValue().y - (this.size.GetValue().y * 0.75);
		}
    }

    UpdateLimit() {
        if(this.position.GetValue().x < 0){
			this.position.GetValue().x = 0;
		}
		if(this.position.GetValue().x + this.size.GetValue().width > this.GameWorld.width){
			this.position.GetValue().x = this.GameWorld.width - this.size.GetValue().width;
		}
		if(this.position.GetValue().y < 0){
			this.position.GetValue().y = 0;
		}
		if(this.position.GetValue().y + this.size.GetValue().height > this.GameWorld.height){
			this.position.GetValue().y = this.GameWorld.height - this.size.GetValue().height;
		}
    }

    UpdateCamera() {
        this.screen.Context.save();
        this.screen.Context.translate(-this.position.GetValue().x,-this.position.GetValue().y);
        // for(var i in sprites){
        //     var spr = sprites[i];
        //     this.screen.Context.drawImage(spr.img,0,0,spr.width,spr.height,spr.x,spr.y,spr.width,spr.height);
        // }
        this.screen.Context.restore();
        // this.screen.Context.Font = "bold Arial";
        // this.screen.Context.FontSize = "25px";
        // this.screen.Context.DrawText("SCORE: 0",10,30);
    }

    Update(char) {
        this.UpdatePosition(char);
        this.UpdateLimit();
        this.UpdateCamera();
    }
}