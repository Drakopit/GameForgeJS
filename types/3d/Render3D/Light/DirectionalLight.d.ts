/**
 * Sun-like directional light that can cast one shadow map.
 *
 * @param {Object} [options] - Light and shadow settings.
 * @param {number[]} [options.direction] - Direction in world space.
 * @param {boolean} [options.castShadow=false] - Whether to render shadows.
 * @param {number} [options.shadowMapSize=1024] - Shadow texture resolution.
 * @param {number} [options.shadowDistance=16] - Shadow camera coverage.
 */
export class DirectionalLight extends Light {
    constructor({ direction, color, intensity, castShadow, shadowMapSize, shadowBias, shadowStrength, shadowDistance, }?: {
        direction?: number[];
        color?: number[];
        intensity?: number;
        castShadow?: boolean;
        shadowMapSize?: number;
        shadowBias?: number;
        shadowStrength?: number;
        shadowDistance?: number;
    });
    direction: number[];
    castShadow: boolean;
    shadowMapSize: number;
    shadowBias: number;
    shadowStrength: number;
    shadowDistance: number;
    /**
     * Updates the normalized light direction.
     * @param {number[]} direction - New world-space direction.
     * @returns {DirectionalLight} This light.
     */
    SetDirection(direction: number[]): DirectionalLight;
}
import { Light } from "./Light.js";
