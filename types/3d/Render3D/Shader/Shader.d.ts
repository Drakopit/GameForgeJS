/**
 * Compiled WebGL shader program wrapper with cached uniform locations.
 *
 * Games generally select a material instead of instantiating shaders directly.
 *
 * @param {WebGL2RenderingContext} gl - Active renderer context.
 * @param {string} vertexSource - GLSL vertex shader source.
 * @param {string} fragmentSource - GLSL fragment shader source.
 * @param {string} [label="Shader"] - Error-reporting label.
 */
export class Shader {
    constructor(gl: any, vertexSource: any, fragmentSource: any, label?: string);
    gl: any;
    label: string;
    program: any;
    uniforms: Map<any, any>;
    /**
     * Binds this program for subsequent draw calls.
     * @returns {void}
     */
    Use(): void;
    /**
     * Obtains and caches a named uniform location.
     * @param {string} name - GLSL uniform name.
     * @returns {WebGLUniformLocation|null} Located uniform.
     */
    GetUniform(name: string): WebGLUniformLocation | null;
    Dispose(): void;
    #private;
}
