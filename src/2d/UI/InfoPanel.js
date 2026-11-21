import { HUDFrame } from './HUDFrame.js';

/**
 * Canvas information/help panel, drawn on the caller's existing Screen or ScreenUI.
 * Input and visibility belong to the owning level; no DOM or listeners are created.
 * @param {Draw} draw - Drawing helper from the existing screen.
 * @param {Object} options - Title, text lines and panel rectangle.
 */
export class InfoPanel {
    /** @param {import('../Graphics/Draw.js').Draw} draw @param {{title?: string, lines?: string[], x?: number, y?: number, width?: number, lineHeight?: number}} [options] */
    constructor(draw, { title, lines = [], x = 20, y = 110, width = 620, lineHeight = 27 } = {}) {
        this.frame = new HUDFrame(draw);
        this.title = title;
        this.lines = lines;
        this.layout = { x, y, width, lineHeight };
        this.visible = false;
    }

    Toggle() { this.visible = !this.visible; }

    OnDrawn() {
        if (!this.visible) return;
        const { x, y, width, lineHeight } = this.layout;
        this.frame.Panel({ x, y, width, height: 65 + this.lines.length * lineHeight });
        this.frame.Text(this.title, x + 18, y + 31, { size: 20, weight: 700, color: this.frame.theme.gold });
        this.lines.forEach((text, index) => this.frame.Text(text, x + 18, y + 62 + index * lineHeight,
            { size: 14, maxWidth: width - 36 }));
    }
}
