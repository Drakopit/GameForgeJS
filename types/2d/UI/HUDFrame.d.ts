/**
 * Compact Canvas HUD drawing primitives sharing the framework Draw/ScreenUI.
 * Methods restore Canvas state and never create a screen or own a game loop.
 * @param {Draw} draw - The screen's existing drawing helper.
 * @param {Object} [theme={}] - Overrides for panel, border, gold, text and track colors.
 */
export class HUDFrame {
    constructor(draw: any, theme?: {});
    context: any;
    theme: {
        panel: "rgba(13, 18, 28, 0.9)";
        border: "rgba(233, 221, 165, 0.55)";
        gold: "#dfc57a";
        text: "#f8f3da";
        muted: "#aebbd0";
        track: "#202a3c";
        green: "#3dd58a";
        red: "#ed786d";
        radius: 7;
        padding: 12;
    };
    Panel({ x, y, width, height }: {
        x: any;
        y: any;
        width: any;
        height: any;
    }): void;
    /** @param {string} text @param {number} x @param {number} y @param {{size?: number, color?: string, align?: CanvasTextAlign, weight?: number, maxWidth?: number}} [options] */
    Text(text: string, x: number, y: number, { size, color, align, weight, maxWidth }?: {
        size?: number;
        color?: string;
        align?: CanvasTextAlign;
        weight?: number;
        maxWidth?: number;
    }): void;
    Badge(label: any, x: any, y: any, size?: number): void;
    Meter(fraction: any, { x, y, width, height }: {
        x: any;
        y: any;
        width: any;
        height: any;
    }, color?: "#3dd58a"): void;
}
