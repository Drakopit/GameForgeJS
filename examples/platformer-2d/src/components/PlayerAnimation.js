import { Component, Vector2D } from 'gameforgejs/core';
import { Animator } from 'gameforgejs/2d';
import { PlayerAnimations } from '../data/PlayerAnimations.js';

export class PlayerAnimation extends Component {
    constructor(screen, assets) {
        super();
        this.screen = screen;
        this.assets = assets;
        this.facingRight = true;
        this.drawPosition = new Vector2D();
    }

    OnAttach(owner) {
        super.OnAttach(owner);
        owner.sprite.screen = this.screen;
        this.animator = new Animator(owner.sprite);

        for (const [name, animation] of Object.entries(PlayerAnimations)) {
            const image = this.assets.GetImage(animation.asset);
            if (!image) {
                throw new Error(`Missing player animation asset: ${animation.asset}`);
            }
            this.animator.AddAnimation(name, image, 0, animation.frames, animation.speed);
        }

        // GameObject.OnUpdate advances Sprite once per frame, including idle.
        owner.isMoving = true;
        this.Reset();
    }

    OnUpdate(dt) {
        const movement = this.owner.controller;
        if (Math.abs(movement.vx) > 1) {
            this.facingRight = movement.vx > 0;
        }

        this.animator.Play(this.SelectAnimation(movement));
        this.animator.Update(dt);
    }

    SelectAnimation(movement) {
        if (!movement.grounded) {
            return movement.vy < 0 ? 'Jump' : 'Fall';
        }
        return Math.abs(movement.vx) > 1 ? 'Run' : 'Idle';
    }

    Reset() {
        this.facingRight = true;
        this.animator.Play('Idle');
        this.owner.sprite.Reset();
    }

    OnDrawn() {
        const player = this.owner;
        // Align the feet with the collider; sprite width does not change physics.
        this.drawPosition.x = player.position.x + (player.size.x - player.sprite.size.x) / 2;
        this.drawPosition.y = player.position.y + player.size.y - player.sprite.size.y;
        player.sprite.Animation(null, this.drawPosition, 'horizontal', 0, this.facingRight);
    }
}
