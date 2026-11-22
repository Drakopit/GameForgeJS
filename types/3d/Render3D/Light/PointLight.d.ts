/**
 * Omnidirectional local light attenuated by range.
 *
 * @param {Object} [options] - Light values.
 * @param {number[]} [options.position] - World-space position.
 * @param {number} [options.range=8] - Illumination range.
 */
export class PointLight extends Light {
    constructor({ position, color, intensity, range, }?: {
        position?: number[];
        color?: number[];
        intensity?: number;
        range?: number;
    });
    position: number[];
    range: number;
}
import { Light } from "./Light.js";
