/**
 * Background environment rendered from a cubemap cross image.
 *
 * @param {Object} [options] - Skybox definition.
 * @param {HTMLImageElement|null} [options.image=null] - Four-by-three cubemap cross image.
 * @param {string} [options.name="Skybox"] - Debug/display name.
 */
export class Skybox {
    /**
     * Wraps an already loaded cubemap cross image.
     * @param {HTMLImageElement} image - Loaded skybox image.
     * @param {Object} [options={}] - Additional skybox values.
     * @returns {Skybox} Created skybox.
     */
    static FromImage(image: HTMLImageElement, options?: any): Skybox;
    constructor({ image, name }?: {
        image?: any;
        name?: string;
    });
    isSkybox3D: boolean;
    name: string;
    image: any;
}
