/**
 * Two-tone ambient illumination blended between sky and ground colors.
 *
 * @param {Object} [options] - Light values.
 * @param {number[]} [options.skyColor] - Upper hemisphere RGB color.
 * @param {number[]} [options.groundColor] - Lower hemisphere RGB color.
 * @param {number} [options.intensity=0.35] - Contribution strength.
 */
export class HemisphereLight extends Light {
    constructor({ skyColor, groundColor, intensity, }?: {
        skyColor?: number[];
        groundColor?: number[];
        intensity?: number;
    });
    skyColor: any[];
    groundColor: any[];
}
import { Light } from "./Light.js";
