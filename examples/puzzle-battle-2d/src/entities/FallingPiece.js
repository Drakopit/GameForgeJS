import { ActionManager } from "gameforgejs/core";
import { PuzzleConfig } from "../data/puzzleConfig.js";

// Rotations (relative pos of gem2 from gem1)
const ROTATIONS = [
    { r: -1, c: 0 }, // UP
    { r: 0, c: 1 },  // RIGHT
    { r: 1, c: 0 },  // DOWN
    { r: 0, c: -1 }  // LEFT
];

export class FallingPiece {
    constructor(board, controls, isAI = false) {
        this.board = board;
        this.controls = controls; // e.g. { left: 'a', right: 'd', rotate: 'w', drop: 's' }
        this.isAI = isAI;

        this.col1 = 2;
        this.row1 = 0;
        this.rotIndex = 0; // Starts UP

        this.gem1 = null;
        this.gem2 = null;

        this.fallTimer = 0;
        this.locked = false;

        this.inputDelay = 0; // basic cooldown for inputs
    }

    get row2() { return this.row1 + ROTATIONS[this.rotIndex].r; }
    get col2() { return this.col1 + ROTATIONS[this.rotIndex].c; }

    setGems(g1, g2) {
        this.rotIndex = 0;
        this.inputDelay = 0;
        this.gem1 = g1;
        this.gem2 = g2;
        this.row1 = ROTATIONS[this.rotIndex].r === -1 ? 1 : 0; // Adjust starting row so gem2 is not out of bounds top
        this.col1 = 2;
        this.locked = false;
        this.fallTimer = 0;
        if (!this.canMove(this.row1,this.col1,this.row2,this.col2)) this.board.gameOver=true;
    }

    update(dt) {
        if (this.locked || !this.gem1 || this.board.gameOver) return;

        this.inputDelay -= dt;
        const isFastDrop = !this.isAI && ActionManager.IsAction(this.controls.drop);

        // Player Input
        if (!this.isAI && this.inputDelay <= 0) {
            if (ActionManager.IsAction(this.controls.left)) {
                if (this.canMove(this.row1, this.col1 - 1, this.row2, this.col2 - 1)) {
                    this.col1--;
                    this.inputDelay = 0.1;
                }
            } else if (ActionManager.IsAction(this.controls.right)) {
                if (this.canMove(this.row1, this.col1 + 1, this.row2, this.col2 + 1)) {
                    this.col1++;
                    this.inputDelay = 0.1;
                }
            }
        }
        // Rotation is an edge, independent of held horizontal repeat.
        if (!this.isAI && ActionManager.IsActionDown(this.controls.rotate)) {
                const nextRot = (this.rotIndex + 1) % 4;
                const nr2 = this.row1 + ROTATIONS[nextRot].r;
                const nc2 = this.col1 + ROTATIONS[nextRot].c;
                if (this.canMove(this.row1, this.col1, nr2, nc2)) {
                    this.rotIndex = nextRot;
                    this.inputDelay = 0.1;
                } else {
                    // Kick logic (try moving left/right if stuck on wall)
                    if (this.canMove(this.row1, this.col1 - 1, nr2, nc2 - 1)) {
                        this.col1--;
                        this.rotIndex = nextRot;
                        this.inputDelay = 0.1;
                    } else if (this.canMove(this.row1, this.col1 + 1, nr2, nc2 + 1)) {
                        this.col1++;
                        this.rotIndex = nextRot;
                        this.inputDelay = 0.1;
                    }
                }
        }

        // Gravity
        const speed = isFastDrop ? PuzzleConfig.FALL_SPEED_FAST : PuzzleConfig.FALL_SPEED_NORMAL;
        this.fallTimer += dt * speed;

        while (this.fallTimer >= 1.0 && !this.locked) {
            this.fallTimer -= 1;
            if (this.canMove(this.row1 + 1, this.col1, this.row2 + 1, this.col2)) {
                this.row1++;
            } else {
                this.lock();
            }
        }
    }

    canMove(r1, c1, r2, c2) {
        // Can be above the board visually (r < 0) before entering fully
        const valid1 = (r1 < 0 && c1 >= 0 && c1 < PuzzleConfig.COLS) || this.board.isValidPos(r1, c1);
        const valid2 = (r2 < 0 && c2 >= 0 && c2 < PuzzleConfig.COLS) || this.board.isValidPos(r2, c2);
        return valid1 && valid2;
    }

    lock() {
        this.locked = true;
        this.board.lockPiece(this);
    }

    draw(ctx) {
        const cell=this.cellSize??this.board?.cellSize??PuzzleConfig.GEM_SIZE;
        if (this.locked || !this.gem1 || this.board.gameOver) return;

        const bx = this.board.x;
        const by = this.board.y;
        let ghost = 0;
        while(this.canMove(this.row1+ghost+1,this.col1,this.row2+ghost+1,this.col2)) ghost++;
        if(ghost>0) {
            ctx.save();ctx.globalAlpha=0.18;
            this.gem1.render(ctx,bx+this.col1*cell,by+(this.row1+ghost)*cell,cell);
            this.gem2.render(ctx,bx+this.col2*cell,by+(this.row2+ghost)*cell,cell);
            ctx.restore();
        }

        if (this.row1 >= 0) {
            this.gem1.render(ctx, bx + this.col1 * cell, by + this.row1 * cell,cell);
        }
        if (this.row2 >= 0) {
            this.gem2.render(ctx, bx + this.col2 * cell, by + this.row2 * cell,cell);
        }
    }

    // Used by AI to simulate input
    aiMoveLeft() {
        if (this.canMove(this.row1, this.col1 - 1, this.row2, this.col2 - 1)) this.col1--;
    }
    aiMoveRight() {
        if (this.canMove(this.row1, this.col1 + 1, this.row2, this.col2 + 1)) this.col1++;
    }
    aiRotate() {
        const nextRot = (this.rotIndex + 1) % 4;
        const nr2 = this.row1 + ROTATIONS[nextRot].r;
        const nc2 = this.col1 + ROTATIONS[nextRot].c;
        if (this.canMove(this.row1, this.col1, nr2, nc2)) {
            this.rotIndex = nextRot;
        } else if (this.canMove(this.row1, this.col1 - 1, nr2, nc2 - 1)) {
            this.col1--;
            this.rotIndex = nextRot;
        } else if (this.canMove(this.row1, this.col1 + 1, nr2, nc2 + 1)) {
            this.col1++;
            this.rotIndex = nextRot;
        }
    }
    aiDrop() {
        this.fallTimer += 10.0; // Force fast drop
    }
}
