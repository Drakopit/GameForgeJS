/**
 * WebGL2 renderer for `Scene3D`, including lit materials, skyboxes and shadows.
 *
 * @param {HTMLCanvasElement|Screen3D} canvasOrScreen - Destination canvas or screen wrapper.
 * @param {Object} [options] - Renderer settings.
 * @param {number[]} [options.clearColor] - Default RGBA clear color.
 * @param {boolean} [options.antialias=true] - Request browser multisampling.
 */
export class WebGL3DRenderer {
    constructor(canvasOrScreen: any, { clearColor, antialias, assets, }?: {
        clearColor?: number[];
        antialias?: boolean;
        assets?: any;
    });
    canvas: any;
    gl: any;
    clearColor: number[];
    renderQueue: RenderQueue3D;
    /** Main camera pass only; shadow and skybox draws are not included. */
    stats: {
        visible: number;
        culled: number;
        triangles: number;
    };
    geometryCache: WeakMap<object, any>;
    textureCache: Map<any, any>;
    shadowCache: WeakMap<object, any>;
    skyboxCache: WeakMap<object, any>;
    skyboxTextures: Set<any>;
    ownedBuffers: Set<any>;
    ownedVertexArrays: Set<any>;
    ownedTextures: Set<any>;
    ownedFramebuffers: Set<any>;
    usedTextures: Set<any>;
    lightViewProjection: Float32Array<ArrayBuffer>;
    skyboxGeometry: import("../index.js").Geometry3D;
    standardShader: Shader;
    unlitShader: Shader;
    shadowShader: Shader;
    celestialShader: Shader;
    skyboxShader: Shader;
    /**
     * Draws one scene from a supplied or scene-owned camera.
     * @param {Scene3D} scene - Scene to render.
     * @param {PerspectiveCamera} [camera] - Camera override.
     * @returns {void}
     */
    Render(scene: Scene3D, camera?: PerspectiveCamera): void;
    /**
     * Releases shader programs, caches and GPU-owned resources.
     * @returns {void}
     */
    Dispose(): void;
    disposed: boolean;
    whiteTexture: any;
    normalTexture: any;
    blackTexture: any;
    activeReflection: {
        texture: any;
        matrix: any;
    };
    reflectionTarget: {
        framebuffer: any;
        color: any;
        depth: any;
    };
    reflectionClip: any;
    #private;
}
import { RenderQueue3D } from './RenderQueue3D.js';
import { Shader } from "../Shader/Shader.js";
