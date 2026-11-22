/**
 * Canvas information/help panel, drawn on the caller's existing Screen or ScreenUI.
 * Input and visibility belong to the owning level; no DOM or listeners are created.
 * @param {Draw} draw - Drawing helper from the existing screen.
 * @param {Object} options - Title, text lines and panel rectangle.
 */
export class InfoPanel {
    /** @param {import('../Graphics/Draw.js').Draw} draw @param {{title?: string, lines?: string[], x?: number, y?: number, width?: number, lineHeight?: number}} [options] */
    constructor(draw: import("../Graphics/Draw.js").Draw, { title, lines, x, y, width, lineHeight }?: {
        title?: string;
        lines?: string[];
        x?: number;
        y?: number;
        width?: number;
        lineHeight?: number;
    });
    frame: HUDFrame;
    title: string;
    lines: string[];
    layout: {
        x: number;
        y: number;
        width: number;
        lineHeight: number;
    };
    visible: boolean;
    Toggle(): void;
    OnDrawn(): void;
}
import { HUDFrame } from './HUDFrame.js';
