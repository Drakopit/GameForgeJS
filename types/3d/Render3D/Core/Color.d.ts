/**
 * Normalized RGBA color value with array and hexadecimal conversion helpers.
 *
 * @param {number} [r=1] - Red channel from zero to one.
 * @param {number} [g=1] - Green channel from zero to one.
 * @param {number} [b=1] - Blue channel from zero to one.
 * @param {number} [a=1] - Alpha channel from zero to one.
 */
export class Color {
    static White(): Color;
    static Black(): Color;
    /**
     * Converts a CSS-style hexadecimal value to normalized channels.
     * @param {string} hex - Three or six digit hexadecimal color.
     * @param {number} [alpha=1] - Alpha channel.
     * @returns {Color} Parsed color.
     */
    static FromHex(hex: string, alpha?: number): Color;
    static ToArray3(value: any, fallback?: number[]): any[];
    static ToArray4(value: any, fallback?: number[]): any[];
    constructor(r?: number, g?: number, b?: number, a?: number);
    r: number;
    g: number;
    b: number;
    a: number;
    ToArray3(): number[];
    ToArray4(): number[];
}
