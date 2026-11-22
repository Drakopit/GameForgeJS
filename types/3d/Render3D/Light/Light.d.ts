/**
 * Normalizes a three-component direction vector.
 * @param {number[]} vector - Direction candidate.
 * @param {number[]} [fallback] - Value used when fields are missing.
 * @returns {number[]} Unit length direction.
 */
export function normalize3(vector: number[], fallback?: number[]): number[];
/**
 * Base class for lights stored by `Scene3D`.
 *
 * @param {Object} [options] - Light values.
 * @param {string} [options.type="light"] - Renderer light category.
 * @param {number[]|Color|string} [options.color] - RGB light color.
 * @param {number} [options.intensity=1] - Light energy.
 */
export class Light {
    constructor({ type, color, intensity }?: {
        type?: string;
        color?: Color;
        intensity?: number;
    });
    isLight3D: boolean;
    type: string;
    color: any[];
    intensity: number;
    enabled: boolean;
}
import { Color } from "../Core/Color.js";
