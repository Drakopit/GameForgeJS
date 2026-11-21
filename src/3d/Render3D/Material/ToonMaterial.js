import { StandardMaterial } from './StandardMaterial.js';

/**
 * Matte material with discrete diffuse-light bands. Uses the existing texture,
 * normal and shadow pipeline. Ambient light and shadow filtering stay continuous.
 * @param {Object} [options] - StandardMaterial options plus bands (integer 2–8).
 */
export class ToonMaterial extends StandardMaterial {
    constructor({ bands = 3, ...options } = {}) {
        super({ name: 'ToonMaterial', ...options });
        this.type = 'toon';
        this.bands = bands;
    }

    get bands() {
        return this._bands;
    }

    set bands(value) {
        if (!Number.isInteger(value) || value < 2 || value > 8) {
            throw new RangeError('ToonMaterial bands must be an integer from 2 to 8.');
        }
        this._bands = value;
    }
}
