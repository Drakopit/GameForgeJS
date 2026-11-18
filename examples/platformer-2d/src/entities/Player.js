import { GameObject } from 'gameforgejs/2d';
import { BoundsComponent } from 'gameforgejs/core';
import { PlatformerController } from 'gameforgejs/addons/platformer';
import { PlayerAnimation } from '../components/PlayerAnimation.js';

export class Player extends GameObject {
    constructor(world, screen, spawn, assets) {
        super();
        this.spawn = { ...spawn };
        this.size.x = 24;
        this.size.y = 30;
        this.bounds = this.AddComponent(new BoundsComponent());
        this.controller = this.AddComponent(new PlatformerController({ world }));
        this.animation = this.AddComponent(new PlayerAnimation(screen, assets));
        this.Respawn();
    }

    Respawn() {
        this.position.x = this.spawn.x;
        this.position.y = this.spawn.y;
        this.controller.Reset();
        this.animation.Reset();
    }
}

