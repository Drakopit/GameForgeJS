/**
 * Transparent overlay screen for GameForgeJS canvas-based UI above gameplay.
 *
 * @param {string} [id="gameCanvasUI"] - UI canvas identifier.
 * @param {number} [width=800] - Logical canvas width.
 * @param {number} [height=600] - Logical canvas height.
 * @param {number} [zIndex=100] - CSS stacking position.
 */
export class ScreenUI {
    constructor(id?: string, width?: number, height?: number, zIndex?: number, options?: {});
    screen: Screen;
    draw: Draw;
    Refresh(): void;
    Dispose(): void;
    get Draw(): Draw;
    get Screen(): Screen;
}
import { Screen } from "./Screen.js";
import { Draw } from "../Graphics/Draw.js";
