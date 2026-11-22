/**
 * Material rendered without scene lighting, useful for markers and effects.
 *
 * @param {Object} [options] - Surface settings.
 * @param {number[]|Color|string} [options.color] - RGBA surface color.
 * @param {Texture|null} [options.albedoMap=null] - Optional display texture.
 * @param {boolean} [options.transparent=false] - Whether blending may be required.
 */
export class UnlitMaterial extends Material {
    constructor({ name, color, albedoMap, transparent, }?: {
        name?: string;
        color?: number[];
        albedoMap?: any;
        transparent?: boolean;
    });
    type: string;
    albedoColor: any[];
    albedoMap: any;
}
import { Material } from "./Material.js";
