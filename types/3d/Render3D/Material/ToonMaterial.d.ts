/**
 * Matte material with discrete diffuse-light bands. Uses the existing texture,
 * normal and shadow pipeline. Ambient light and shadow filtering stay continuous.
 * @param {Object} [options] - StandardMaterial options plus bands (integer 2–8).
 */
export class ToonMaterial extends StandardMaterial {
    constructor({ bands, ...options }?: {
        bands?: number;
    });
    set bands(value: any);
    get bands(): any;
    _bands: any;
}
import { StandardMaterial } from './StandardMaterial.js';
