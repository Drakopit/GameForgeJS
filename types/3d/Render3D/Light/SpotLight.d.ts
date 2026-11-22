/**
 * Cone-shaped local light defined by position, direction and angular falloff.
 *
 * @param {Object} [options] - Light values.
 * @param {number[]} [options.position] - World-space position.
 * @param {number[]} [options.direction] - World-space pointing direction.
 * @param {number} [options.innerAngle] - Fully lit cone angle in radians.
 * @param {number} [options.outerAngle] - Outer falloff cone angle in radians.
 */
export class SpotLight extends Light {
    constructor({ position, direction, color, intensity, range, innerAngle, outerAngle, }?: {
        position?: number[];
        direction?: number[];
        color?: number[];
        intensity?: number;
        range?: number;
        innerAngle?: number;
        outerAngle?: number;
    });
    position: number[];
    direction: number[];
    range: number;
    innerAngle: number;
    outerAngle: number;
}
import { Light } from "./Light.js";
