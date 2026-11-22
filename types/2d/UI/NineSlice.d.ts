/**
 * Draws resizable UI panels from a nine-slice source image.
 *
 * @param {Screen} screen - Canvas screen.
 * @param {HTMLImageElement} image - Panel texture.
 * @param {number} [cornerSize=16] - Corner sample size in pixels.
 */
export class NineSlice {
    /**
     * @param {Object} screen - The screen object to get the Context
     * @param {HTMLImageElement} image - The source image (loaded via AssetManager)
     * @param {number} cornerSize - The size (in pixels) of the non-scalable corners
     */
    constructor(screen: any, image: HTMLImageElement, cornerSize?: number);
    screen: any;
    image: HTMLImageElement;
    corner: number;
    /**
     * Draws the scalable panel on the screen.
     * @param {number} x - Target X position
     * @param {number} y - Target Y position
     * @param {number} finalWidth - The total width you want the window to be
     * @param {number} finalHeight - The total height you want the window to be
     */
    DrawPanel(x: number, y: number, finalWidth: number, finalHeight: number): void;
}
