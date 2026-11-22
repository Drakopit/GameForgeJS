/**
 * Nine-slice canvas window that positions child labels relative to its frame.
 *
 * Subclass or compose this class for in-game panels rendered inside GameForgeJS
 * rather than as external HTML.
 */
export class UIWindow extends GameObject {
    constructor(screen: any, image: any, x: any, y: any, width: any, height: any, cornerSize?: number);
    screen: any;
    background: NineSlice;
    draw: Draw;
    children: any[];
    /**
     * Adds text relative to the window's top-left corner
     * @param {string} text - Label content.
     * @param {number} offsetX - Horizontal offset inside the window.
     * @param {number} offsetY - Vertical offset inside the window.
     * @param {string} [color="#FFFFFF"] - Canvas text color.
     * @param {string} [fontSize="20px"] - CSS canvas font size.
     * @param {string} [fontStyle="Arial"] - Canvas font family.
     * @returns {void}
     */
    AddText(text: string, offsetX: number, offsetY: number, color?: string, fontSize?: string, fontStyle?: string): void;
}
import { GameObject } from "../Objects/GameObject.js";
import { NineSlice } from "./NineSlice.js";
import { Draw } from "../Graphics/Draw.js";
