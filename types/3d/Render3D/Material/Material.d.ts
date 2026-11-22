/**
 * Base surface description used by Render3D material implementations.
 *
 * @param {Object} [options] - Shared material options.
 * @param {string} [options.name="Material"] - Debug/display name.
 * @param {boolean} [options.transparent=false] - Whether blending may be required.
 */
export class Material {
    constructor({ name, transparent }?: {
        name?: string;
        transparent?: boolean;
    });
    name: string;
    transparent: boolean;
    isMaterial3D: boolean;
}
