import { BoundsComponent } from 'gameforgejs/core';
import { GameObject } from 'gameforgejs/2d';

export class GardenObstacle extends GameObject {
    constructor(screen, rectangle) {
        super();
        this.screen = screen;
        this.position.Set(rectangle.x, rectangle.y);
        this.size.Set(rectangle.width, rectangle.height);
        this.bounds = this.AddComponent(new BoundsComponent());
    }

    OnDrawn() {
        const ctx = this.screen.Context;
        ctx.save();
        ctx.fillStyle = '#132f36'; ctx.fillRect(this.position.x, this.position.y + 6, this.size.x, this.size.y);
        ctx.fillStyle = '#42685b'; ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
        ctx.fillStyle = '#94b87c'; ctx.fillRect(this.position.x + 6, this.position.y + 6, this.size.x - 12, 7);
        ctx.restore();
    }
}
