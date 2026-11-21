import { BoundsComponent } from 'gameforgejs/core';
import { GameObject, Draw } from 'gameforgejs/2d';

export class Coin extends GameObject {
    constructor(screen, position) {
        super();
        this.position.Set(position.x, position.y);
        this.size.Set(16, 20);
        this.draw = new Draw(screen);
        this.bounds = this.AddComponent(new BoundsComponent({ solid: false }));
        this.collected = false;
    }

    TryCollect(player) {
        if (this.collected || !this.bounds.Intersects(player.bounds)) return false;

        this.collected = true;
        return true;
    }

    Reset() {
        this.collected = false;
    }

    OnDrawn() {
        if (this.collected) return;

        this.draw.Color = '#f3c866';
        this.draw.DrawRect(this.position.x, this.position.y, this.size.x, this.size.y);
        this.draw.Color = '#fff2b0';
        this.draw.DrawRect(this.position.x + 6, this.position.y + 3, 4, 14);
        super.OnDrawn();
    }
}
