/**
 * Lit PBR-style material with color, texture maps and shadow support.
 *
 * @param {Object} [options] - Surface settings.
 * @param {number[]|Color|string} [options.albedoColor] - Base RGBA color.
 * @param {Texture|null} [options.albedoMap=null] - Base color texture.
 * @param {Texture|null} [options.normalMap=null] - Tangent-space normal map.
 * @param {Texture|null} [options.heightMap=null] - Parallax height map.
 * @param {number} [options.roughness=0.72] - Surface roughness.
 * @param {number} [options.metallic=0] - Metallic factor.
 * @param {boolean} [options.receiveShadow=true] - Whether shadows affect this surface.
 */
export class StandardMaterial extends Material {
    constructor({ name, albedoColor, albedoMap, normalMap, roughnessMap, aoMap, ormMap, heightMap, emissiveMap, uvScale, normalScale, heightScale, roughness, metallic, emissiveColor, receiveShadow, transparent, }?: {
        name?: string;
        albedoColor?: number[];
        albedoMap?: any;
        normalMap?: any;
        roughnessMap?: any;
        aoMap?: any;
        ormMap?: any;
        heightMap?: any;
        emissiveMap?: any;
        uvScale?: number[];
        normalScale?: number;
        heightScale?: number;
        roughness?: number;
        metallic?: number;
        emissiveColor?: number[];
        receiveShadow?: boolean;
        transparent?: boolean;
    });
    type: string;
    albedoColor: any[];
    albedoMap: any;
    normalMap: any;
    roughnessMap: any;
    aoMap: any;
    ormMap: any;
    heightMap: any;
    emissiveMap: any;
    uvScale: number[];
    normalScale: number;
    heightScale: number;
    roughness: number;
    metallic: number;
    emissiveColor: any[];
    receiveShadow: boolean;
}
import { Material } from "./Material.js";
