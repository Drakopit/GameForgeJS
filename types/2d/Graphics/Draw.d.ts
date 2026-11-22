/**
 * @doc Class Draw
 * @namespace Graphic
 * @class Draw
 * @author Patrick Faustino Camello
 * @summary Provides drawing utilities for 2D graphics.
 * @description This class facilitates drawing operations on a given canvas, including text, rectangles, circles, and sprites.
 * @Date 15/05/2019
 * @example
 *  const draw = new Draw(screen);
 *  draw.Color = 'red';
 *  draw.DrawText('Hello World', 50, 50);
 * @returns {Object}
 */
export class Draw {
    constructor(screen: any);
    screen: any;
    fontSize: string;
    font: string;
    TYPES: {
        FILLED: number;
        STROKED: number;
    };
    style: number;
    color: string;
    set Color(color: string);
    get Color(): string;
    set Font(font: string);
    get Font(): string;
    set FontSize(fontSize: string);
    get FontSize(): string;
    set Style(style: number);
    get Style(): number;
    /**
     * @doc Method
     * @param {string} align - The text alignment (e.g., 'left', 'center', 'right').
     * @description Sets the text alignment for drawing text.
     * @example
     *  draw.SetTextAlign('center');
     */
    SetTextAlign(align: string): void;
    /**
     * @doc Method
     * @param {string} text - The text to be drawn.
     * @param {number} x - The x-coordinate where the text will be drawn.
     * @param {number} y - The y-coordinate where the text will be drawn.
     * @param {number} [maxWidth] - The maximum width of the text. If not provided, there is no limit.
     * @description Draws text on the canvas.
     * @example
     *  draw.DrawText('Hello World', 50, 50);
     */
    DrawText(text: string, x: number, y: number, maxWidth?: number): void;
    /**
     * @doc Method
     * @param {number} x - The x-coordinate where the rectangle will be drawn.
     * @param {number} y - The y-coordinate where the rectangle will be drawn.
     * @param {number} width - The width of the rectangle.
     * @param {number} height - The height of the rectangle.
     * @description Draws a rectangle on the canvas.
     * @example
     *  draw.DrawRect(10, 10, 100, 50);
     */
    DrawRect(x: number, y: number, width: number, height: number): void;
    /**
     * @doc Method
     * @param {number} x - The x-coordinate of the circle's center.
     * @param {number} y - The y-coordinate of the circle's center.
     * @param {number} radius - The radius of the circle.
     * @description Draws a circle on the canvas.
     * @example
     *  draw.DrawCircle(50, 50, 20);
     */
    DrawCircle(x: number, y: number, radius: number): void;
    /**
     * @doc Method
     * @param {HTMLImageElement | string} sprite - The image element or the URL of the sprite.
     * @param {number} x - The x-coordinate where the sprite will be drawn.
     * @param {number} y - The y-coordinate where the sprite will be drawn.
     * @description Draws an image or sprite on the canvas.
     * @example
     *  draw.DrawSprite(image, 10, 10);
     */
    DrawSprite(sprite: HTMLImageElement | string, x: number, y: number): void;
    DrawSpriteStretched(sprite: any, x: any, y: any, width: any, height: any): void;
    DrawSpritePart(sprite: any, source: any, destination: any): void;
}
