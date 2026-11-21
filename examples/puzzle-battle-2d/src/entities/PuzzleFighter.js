import { Component } from "gameforgejs/core";

const FIGHTER_SIZE = 64;

export const FighterState = {
    IDLE: 0,
    ATTACK: 1,
    HIT: 2,
    WIN: 3,
    LOSE: 4
};

export class PuzzleFighter extends Component {
    constructor(x, y, characterData) {
        super();
        this.x = x;
        this.y = y;
        this.data = characterData;
        
        this.state = FighterState.IDLE;
        this.stateTimer = 0;
        this.time = 0;
        
        // Procedural visual variations based on state
        this.offsetX = 0;
        this.offsetY = 0;
    }

    setState(newState, duration = 0.5) {
        if (this.state === FighterState.WIN || this.state === FighterState.LOSE) return;
        this.state = newState;
        this.stateTimer = duration;
        this.offsetX = 0;
        this.offsetY = 0;
        this.poseDuration = duration;
    }

    OnUpdate(dt) {
        this.time += dt;
        if (this.stateTimer > 0) {
            this.stateTimer -= dt;
            
            // Jitter/Shake if hit
            if (this.state === FighterState.HIT) {
                this.offsetX = (Math.random() - 0.5) * 10;
                this.offsetY = (Math.random() - 0.5) * 10;
            } 
            // Lunge forward if attack
            else if (this.state === FighterState.ATTACK) {
                // Determine direction based on side of screen roughly (player 1 vs 2)
                const dir = this.direction ?? 1;
                this.offsetX = dir * 20 * (this.stateTimer / this.poseDuration); // Spring back
            }

            if (this.stateTimer <= 0 && ![FighterState.WIN, FighterState.LOSE].includes(this.state)) {
                this.state = FighterState.IDLE;
                this.offsetX = 0;
                this.offsetY = 0;
            }
        }
        
        if (this.state === FighterState.WIN) {
            this.offsetY = Math.sin(this.time * 10) * 10; // Jump up and down
        } else if (this.state === FighterState.LOSE) {
            this.offsetY = FIGHTER_SIZE / 2; // Fall down/squash
        }
    }

    /**
     * Modular render. Swap for Sprite.Draw later.
     */
    draw(ctx, x = this.x, y = this.y, scale = 1, facing = 1) {
        const direction = this.direction = facing;
        const attack = this.state === FighterState.ATTACK;
        const hit = this.state === FighterState.HIT;
        ctx.save();
        ctx.translate(x + this.offsetX * scale, y + (this.offsetY + Math.sin(this.time * 5) * 2) * scale);
        ctx.scale(scale, scale);
        ctx.scale(direction, this.state === FighterState.LOSE ? 0.54 : 1);
        const shape = (color, x, y, w, h, radius) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, radius);
            ctx.fill();
        };
        shape('#171522', -25, -4, 50, 7, 4);
        shape(this.data.colorSecondary, -18, -14, 14, 14, 6);
        shape(this.data.colorSecondary, 6, -14, 14, 14, 6);
        shape(this.data.colorMain, -19, -34, 38, 28, 10);
        shape(hit ? '#ffac9e' : '#ffdfbd', -22, -60, 44, 35, 13);
        shape(this.data.colorSecondary, -24, -65, 49, 17, 8);
        shape('#221c2e', -5, -49, 5, hit ? 2 : 8, 2);
        shape('#221c2e', 10, -49, 5, hit ? 2 : 8, 2);
        shape('#792b42', 7, -37, 10, attack ? 6 : 3, 2);
        shape(this.data.colorMain, attack ? 23 : 14, attack ? -40 : -28, 19, 16, 7);
        shape(this.data.colorSecondary, -26, -29, 15, 15, 6);
        ctx.restore();
    }
}
