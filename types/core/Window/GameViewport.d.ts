/**
 * Applies the responsive full-window canvas mode selected by a game config.
 *
 * Logical canvas coordinates remain unchanged; only presentation fills the
 * available browser viewport.
 */
export class GameViewport {
    /**
     * Fit a Screen to the visible browser area, excluding device safe-area insets.
     * Tracks browser bars, keyboard, rotation and visual viewport panning. The
     * returned cleanup stops observing; the level still owns the Screen.
     * @param {Screen} screen - Screen whose logical size follows the visible area.
     * @param {Object} [options] - Logical width limits and resize notification.
     * @returns {() => void} Remove the viewport event listeners.
     */
    static Bind(screen: Screen, { minWidth, maxWidth, onResize }?: any): () => void;
    /**
     * Reads the active game's `screen.fullScreen` setting.
     * @returns {boolean} Whether full-window canvas presentation is enabled.
     */
    static IsFullScreen(gameConfig?: any): boolean;
    /**
     * Styles a game canvas to occupy the browser window responsively.
     * @param {HTMLCanvasElement} canvas - Game canvas element.
     * @param {boolean} [enabled] - Optional setting override.
     * @returns {HTMLCanvasElement} The supplied canvas.
     */
    static Apply(canvas: HTMLCanvasElement, enabled?: boolean, config?: any): HTMLCanvasElement;
    /** CSS follows browser bars/rotation without resizing a fixed-coordinate game world. */
    static Contain(canvas: any): any;
    /** Keep native WebGL and transparent UI surfaces on the exact same viewport. */
    static Align(source: any, target: any): void;
}
