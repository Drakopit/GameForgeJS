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
    assets: any;
    /** ShaderMaterial programs by stage sources: { shader } or { error }. */
    materialPrograms: Map<any, any>;
    subdivisionCache: WeakMap<object, any>;
    warnings: Set<any>;
    /** A ShaderMaterial of domain "post" applied to the finished frame (see SetPostProcess). */
    postProcess: any;
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
     * Applies a full-screen `post` ShaderMaterial to every rendered frame, or removes it (null).
     * Its fragment stage reads `uSceneColor` / `uSceneDepth` (sampler2D), `vUv`, `uResolution`,
     * `uTime`, `uCameraNear` / `uCameraFar` and its own properties, and writes `outColor`.
     * @param {ShaderMaterial|null} material
     * @returns {void}
     */
    SetPostProcess(material: ShaderMaterial | null): void;
    /**
     * Releases shader programs, caches and GPU-owned resources.
     * @returns {void}
     */
    Dispose(): void;
    disposed: boolean;
    postTarget: {
        framebuffer: any;
        color: any;
        depth: any;
    };
    whiteTexture: any;
    normalTexture: any;
    blackTexture: any;
    grayTexture: any;
    emptyVertexArray: any;
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
