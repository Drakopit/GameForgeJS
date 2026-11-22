/**
 * Lazy WebGL texture resource created from an image or URL.
 *
 * @param {string|HTMLImageElement|HTMLCanvasElement|null} [source=null] - Texture source.
 * @param {Object} [options] - Upload and sampling options.
 * @param {boolean} [options.flipY=true] - Flip source image vertically on upload.
 * @param {boolean} [options.generateMipmaps=true] - Generate mip levels.
 * @param {number} [options.anisotropy=1] - Requested anisotropic filtering amount.
 */
export class Texture {
    /**
     * Creates a lazily loaded URL texture.
     * @param {string} source - Image URL.
     * @param {Object} [options={}] - Texture options.
     * @returns {Texture} Texture resource.
     */
    static Load(source: string, options?: any): Texture;
    static FromImage(image: any, options?: {}): Texture;
    constructor(source?: any, { flipY, generateMipmaps, wrapS, wrapT, minFilter, magFilter, anisotropy, }?: {
        flipY?: boolean;
        generateMipmaps?: boolean;
        wrapS?: any;
        wrapT?: any;
        minFilter?: any;
        magFilter?: any;
        anisotropy?: number;
    });
    source: any;
    flipY: boolean;
    generateMipmaps: boolean;
    wrapS: any;
    wrapT: any;
    minFilter: any;
    magFilter: any;
    anisotropy: number;
    glTexture: any;
    ready: boolean;
    loading: Promise<any>;
    contexts: Map<any, any>;
    Context(gl: any): any;
    /**
     * Uploads or begins loading the source when first required by a renderer.
     * @param {WebGL2RenderingContext} gl - Active graphics context.
     * @param {WebGLTexture|null} [fallbackTexture=null] - Temporary texture while loading.
     * @returns {WebGLTexture|null} Current GPU texture or fallback.
     */
    EnsureGPU(gl: WebGL2RenderingContext, fallbackTexture?: WebGLTexture | null): WebGLTexture | null;
    LoadImage(gl: any): any;
    Upload(gl: any, image: any): any;
    Dispose(gl: any): void;
}
