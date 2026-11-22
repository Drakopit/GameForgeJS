/**
 * Constant low-cost scene illumination without a direction.
 *
 * @param {Object} [options] - Light values.
 * @param {number[]} [options.color] - RGB light color.
 * @param {number} [options.intensity=0.18] - Ambient contribution.
 */
export class AmbientLight extends Light {
    constructor({ color, intensity }?: {
        color?: number[];
        intensity?: number;
    });
}
import { Light } from "./Light.js";
