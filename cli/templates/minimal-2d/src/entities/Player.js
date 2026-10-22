import { ActionManager, Vector2D } from 'gameforgejs/core';
import { Draw, GameObject } from 'gameforgejs/2d';

export class Player extends GameObject {
    constructor(screen) {
        super();
        this.name = 'Player';
        this.screen = screen;
        this.position = new Vector2D(384, 209);
        this.size = new Vector2D(32, 32);
        this.speed = 240;
        this.draw = new Draw(screen);
    }

    OnUpdate(dt) {
        super.OnUpdate(dt);
        const horizontal = Number(ActionManager.IsAction('RIGHT')) - Number(ActionManager.IsAction('LEFT'));
        const vertical = Number(ActionManager.IsAction('DOWN')) - Number(ActionManager.IsAction('UP'));
        const magnitude = Math.hypot(horizontal, vertical) || 1;
        this.position.x += horizontal / magnitude * this.speed * dt;
        this.position.y += vertical / magnitude * this.speed * dt;
        this.position.x = Math.max(0, Math.min(this.screen.Width - this.size.x, this.position.x));
        this.position.y = Math.max(0, Math.min(this.screen.Height - this.size.y, this.position.y));
    }

    OnDrawn() {
        super.OnDrawn();
        this.draw.Color = '#70baff';
        this.draw.DrawRect(this.position.x, this.position.y, this.size.x, this.size.y);
    }
}
