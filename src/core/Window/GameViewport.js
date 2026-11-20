import { Config } from "../Config.js";
import { Vector2D } from '../Math/Vector2D.js';

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
    static Bind(screen, { minWidth = 360, maxWidth = 1200, onResize = null } = {}) {
        if (!Number.isFinite(minWidth) || !Number.isFinite(maxWidth) || !(minWidth > 0 && maxWidth >= minWidth)) {
            throw new RangeError('Invalid viewport width limits.');
        }
        const canvas = screen.Canvas;
        this.Apply(canvas, true);
        const viewport = window.visualViewport;
        const sides = ['top', 'right', 'bottom', 'left'];
        for (const side of sides) canvas.style.setProperty(`--gameforge-safe-${side}`, `env(safe-area-inset-${side}, 0px)`);
        const resize = () => {
            const style = getComputedStyle(canvas);
            const safe = Object.fromEntries(sides.map(side => [side,
                Math.max(0, parseFloat(style.getPropertyValue(`--gameforge-safe-${side}`)) || 0)]));
            const width = Math.max(1, (viewport?.width || window.innerWidth) - safe.left - safe.right);
            const height = Math.max(1, (viewport?.height || window.innerHeight) - safe.top - safe.bottom);
            const logicalWidth = Math.round(Math.max(minWidth, Math.min(maxWidth, width)));
            const logicalHeight = Math.max(1, Math.round(logicalWidth * height / width));
            Object.assign(canvas.style, { inset: 'auto', left: `${(viewport?.offsetLeft || 0) + safe.left}px`,
                top: `${(viewport?.offsetTop || 0) + safe.top}px`, width: `${width}px`, height: `${height}px` });
            if (canvas.width !== logicalWidth || canvas.height !== logicalHeight) {
                screen.Resize(new Vector2D(logicalWidth, logicalHeight));
                screen.Context.imageSmoothingEnabled = !(screen.config?.screen?.pixelArt ?? true);
            }
            onResize?.();
        };
        window.addEventListener('resize', resize);
        viewport?.addEventListener('resize', resize);
        viewport?.addEventListener('scroll', resize);
        resize();
        return () => {
            window.removeEventListener('resize', resize);
            viewport?.removeEventListener('resize', resize);
            viewport?.removeEventListener('scroll', resize);
        };
    }

    /**
     * Reads the active game's `screen.fullScreen` setting.
     * @returns {boolean} Whether full-window canvas presentation is enabled.
     */
    static IsFullScreen(gameConfig = Config.data) {
        const config = gameConfig?.screen?.fullScreen
            ?? gameConfig?.window?.fullScreen
            ?? false;

        return typeof config === "object"
            ? config.enabled === true
            : config === true;
    }

    /**
     * Styles a game canvas to occupy the browser window responsively.
     * @param {HTMLCanvasElement} canvas - Game canvas element.
     * @param {boolean} [enabled] - Optional setting override.
     * @returns {HTMLCanvasElement} The supplied canvas.
     */
    static Apply(canvas, enabled = this.IsFullScreen()) {
        if (!canvas || !enabled) {
            return canvas;
        }

        document.body.style.overflow = "hidden";
        document.body.style.width = "100vw";
        document.body.style.height = "100vh";

        canvas.style.position = "fixed";
        canvas.style.inset = "0";
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
        canvas.style.boxSizing = "border-box";
        canvas.style.border = "0";
        canvas.style.margin = "0";

        return canvas;
    }
}
