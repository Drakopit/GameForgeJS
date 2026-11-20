import { GameObject } from 'gameforgejs/2d';
import { Vector2D } from 'gameforgejs/core';
import { FighterAnimations, FrameSize } from '../data/FighterAnimations.js';
/** Native Sprite playback for sheet inspection, isolated from combat hitboxes. */
export class FighterPosePreview extends GameObject {
    constructor(screen) { super(); this.screen = screen; this.sprite.screen = screen; this.sprite.size.Set(FrameSize.width, FrameSize.height); this.isMoving = true; this.anchor = new Vector2D(); }
    Play(image, name) {
        this.clip = FighterAnimations[name];
        this.sprite.sprite = image;
        this.sprite.frameCount = this.clip.count;
        this.sprite.loop = this.clip.loop;
        this.sprite.updatesPerFrame = 60 / this.clip.fps;
        this.sprite.Reset();
    }
    OnDrawn() {
        const scale = Math.min(4, this.screen.Width / 100, this.screen.Height / 150), index = this.sprite.index;
        const cell = this.clip.cells[Math.min(index, this.clip.count - 1)];
        this.sprite.index = cell.column;
        this.anchor.Set(this.screen.Width / 2 - FrameSize.width * scale / 2, this.screen.Height * 0.48 - FrameSize.height * scale / 2);
        this.sprite.Animation(undefined, this.anchor, 'horizontal', cell.row, true, scale);
        this.sprite.index = index;
    }
}
