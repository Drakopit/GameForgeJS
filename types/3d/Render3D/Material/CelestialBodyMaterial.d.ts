/**
 * Procedural lit material used for planets, stars and atmospheric bodies.
 *
 * @param {Object} [options] - Celestial surface controls.
 * @param {number[]} [options.baseColor] - Main RGB terrain color.
 * @param {number[]} [options.secondaryColor] - Secondary variation color.
 * @param {number[]} [options.atmosphereColor] - Rim lighting color.
 * @param {number} [options.cloudStrength=0.35] - Procedural cloud amount.
 * @param {number} [options.emissiveStrength=0] - Self-illumination factor.
 */
export class CelestialBodyMaterial extends Material {
    constructor({ name, baseColor, secondaryColor, atmosphereColor, nightColor, emissiveColor, roughness, seed, cloudStrength, atmosphereStrength, emissiveStrength, albedoMap, normalMap, }?: {
        name?: string;
        baseColor?: number[];
        secondaryColor?: number[];
        atmosphereColor?: number[];
        nightColor?: number[];
        emissiveColor?: number[];
        roughness?: number;
        seed?: number;
        cloudStrength?: number;
        atmosphereStrength?: number;
        emissiveStrength?: number;
        albedoMap?: any;
        normalMap?: any;
    });
    type: string;
    baseColor: any[];
    secondaryColor: any[];
    atmosphereColor: any[];
    nightColor: any[];
    emissiveColor: any[];
    roughness: number;
    seed: number;
    cloudStrength: number;
    atmosphereStrength: number;
    emissiveStrength: number;
    albedoMap: any;
    normalMap: any;
}
import { Material } from "./Material.js";
